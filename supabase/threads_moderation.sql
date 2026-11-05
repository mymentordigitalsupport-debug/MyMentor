-- Run once in Supabase SQL Editor before deploying Threads moderation.
-- Community topics, guest email verification, and permanent comment bans.

create table if not exists public.threads_topics (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 50),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.threads_topics (name, slug, position)
values
  ('Mindset', 'mindset', 10),
  ('Progress', 'progress', 20),
  ('Learning', 'learning', 30),
  ('Life', 'life', 40),
  ('Community', 'community', 50)
on conflict (slug) do update set name = excluded.name, position = excluded.position;

alter table public.threads_entries add column if not exists topic_id uuid references public.threads_topics(id) on delete restrict;
update public.threads_entries
set topic_id = (select id from public.threads_topics where slug = 'community')
where topic_id is null;
alter table public.threads_entries alter column topic_id set not null;
create index if not exists threads_entries_topic_created on public.threads_entries(topic_id, created_at desc);

create table if not exists public.threads_commenter_verifications (
  normalized_email text primary key check (normalized_email = lower(trim(normalized_email))),
  name text not null check (char_length(trim(name)) between 1 and 80),
  code_hash text not null,
  expires_at timestamptz not null,
  attempts smallint not null default 0 check (attempts between 0 and 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.threads_comment_bans (
  id uuid primary key default gen_random_uuid(),
  normalized_email text not null unique check (normalized_email = lower(trim(normalized_email))),
  reason text,
  banned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.threads_topics enable row level security;
alter table public.threads_commenter_verifications enable row level security;
alter table public.threads_comment_bans enable row level security;
revoke all on public.threads_commenter_verifications, public.threads_comment_bans from anon, authenticated;
grant select on public.threads_topics to anon, authenticated;
drop policy if exists "Anyone reads thread topics" on public.threads_topics;
create policy "Anyone reads thread topics" on public.threads_topics for select to anon, authenticated using (true);

create or replace function public.prepare_thread_entry() returns trigger
language plpgsql security definer set search_path = public, auth as $$
declare p public.profiles; commenter public.threads_commenters; parent public.threads_entries; commenter_email text;
begin
  if auth.uid() is not null then
    if new.author_id <> auth.uid() or new.commenter_id is not null then raise exception 'Sign in to post.'; end if;
    select lower(email) into commenter_email from auth.users where id = auth.uid();
    if exists (select 1 from public.threads_comment_bans where normalized_email = commenter_email) then raise exception 'This email address cannot comment.'; end if;
    select * into p from public.profiles where user_id = auth.uid();
    new.is_anonymous := coalesce(p.is_anonymous, false);
    new.author_name := case when new.is_anonymous then coalesce(nullif(p.anonymous_name, ''), 'Anonymous Member') else coalesce(nullif(p.display_name, ''), 'Member') end;
  else
    if new.author_id is not null or new.commenter_id is null or new.parent_id is null then raise exception 'Guest comments must be replies.'; end if;
    select * into commenter from public.threads_commenters where id = new.commenter_id;
    if not found then raise exception 'Commenter not found.'; end if;
    if exists (select 1 from public.threads_comment_bans where normalized_email = commenter.normalized_email) then raise exception 'This email address cannot comment.'; end if;
    new.author_name := case when new.is_anonymous then 'Anonymous' else commenter.name end;
  end if;
  new.created_at := now();
  if exists (select 1 from public.threads_entries where coalesce(author_id::text, commenter_id::text) = coalesce(new.author_id::text, new.commenter_id::text) and created_at > now() - interval '10 seconds') then raise exception 'Please wait 10 seconds between posts or replies.'; end if;
  if new.parent_id is not null then
    select * into parent from public.threads_entries where id = new.parent_id;
    if not found or coalesce(parent.post_id, parent.id) <> new.post_id then raise exception 'Reply must belong to this thread.'; end if;
    new.topic_id := parent.topic_id;
  elsif not exists (select 1 from public.threads_topics where id = new.topic_id) then
    raise exception 'Choose a valid topic.';
  end if;
  if new.media_path is not null and not exists (select 1 from storage.objects where bucket_id = 'threads_media' and name = new.media_path and (storage.foldername(name))[1] = auth.uid()::text) then raise exception 'Upload your attachment before posting.'; end if;
  return new;
end $$;

revoke all on function public.prepare_thread_entry() from public;
