-- Visitors may reply without a member account. Their contact details stay private.
create table public.threads_commenters (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  email text not null check (char_length(email) <= 254),
  normalized_email text not null unique check (normalized_email = lower(trim(email))),
  session_token_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.threads_commenters enable row level security;
revoke all on table public.threads_commenters from anon, authenticated;

alter table public.threads_entries add column commenter_id uuid references public.threads_commenters(id) on delete cascade;
alter table public.threads_entries alter column author_id drop not null;
alter table public.threads_entries add constraint threads_entries_one_author check ((author_id is not null) <> (commenter_id is not null));
create index threads_entries_commenter on public.threads_entries(commenter_id, created_at desc) where commenter_id is not null;

create or replace function public.prepare_thread_entry() returns trigger
language plpgsql security definer set search_path = public as $$
declare p public.profiles; commenter public.threads_commenters; parent public.threads_entries;
begin
  if auth.uid() is not null then
    if new.author_id <> auth.uid() or new.commenter_id is not null then raise exception 'Sign in to post.'; end if;
    select * into p from public.profiles where user_id = auth.uid();
    new.is_anonymous := coalesce(p.is_anonymous, false);
    new.author_name := case when new.is_anonymous then coalesce(nullif(p.anonymous_name, ''), 'Anonymous Member') else coalesce(nullif(p.display_name, ''), 'Member') end;
  else
    if new.author_id is not null or new.commenter_id is null or new.parent_id is null then raise exception 'Guest comments must be replies.'; end if;
    select * into commenter from public.threads_commenters where id = new.commenter_id;
    if not found then raise exception 'Commenter not found.'; end if;
    new.author_name := case when new.is_anonymous then 'Anonymous' else commenter.name end;
  end if;
  new.created_at := now();
  if exists (select 1 from public.threads_entries where coalesce(author_id::text, commenter_id::text) = coalesce(new.author_id::text, new.commenter_id::text) and created_at > now() - interval '10 seconds') then raise exception 'Please wait 10 seconds between posts or replies.'; end if;
  if new.parent_id is not null then
    select * into parent from public.threads_entries where id = new.parent_id;
    if not found or coalesce(parent.post_id, parent.id) <> new.post_id then raise exception 'Reply must belong to this thread.'; end if;
  end if;
  if new.media_path is not null and not exists (select 1 from storage.objects where bucket_id = 'threads_media' and name = new.media_path and (storage.foldername(name))[1] = auth.uid()::text) then raise exception 'Upload your attachment before posting.'; end if;
  return new;
end $$;

revoke all on function public.prepare_thread_entry() from public;
