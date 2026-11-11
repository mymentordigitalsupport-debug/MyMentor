-- Allow verified guests to start Threads and leave one reaction per entry.
alter table public.threads_votes drop constraint if exists threads_votes_pkey;
alter table public.threads_votes add column if not exists id uuid default gen_random_uuid();
update public.threads_votes set id = gen_random_uuid() where id is null;
alter table public.threads_votes alter column id set not null;
alter table public.threads_votes add primary key (id);
alter table public.threads_votes alter column user_id drop not null;
alter table public.threads_votes add column if not exists commenter_id uuid references public.threads_commenters(id) on delete cascade;
alter table public.threads_votes add constraint threads_votes_one_voter check ((user_id is not null) <> (commenter_id is not null));
create unique index if not exists threads_votes_member_unique on public.threads_votes(entry_id, user_id) where user_id is not null;
create unique index if not exists threads_votes_guest_unique on public.threads_votes(entry_id, commenter_id) where commenter_id is not null;

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
    if new.author_id is not null or new.commenter_id is null then raise exception 'Verify your email to post.'; end if;
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
  elsif not exists (select 1 from public.threads_topics where id = new.topic_id) then raise exception 'Choose a valid topic.';
  end if;
  if new.media_path is not null and not exists (select 1 from storage.objects where bucket_id = 'threads_media' and name = new.media_path and (storage.foldername(name))[1] = auth.uid()::text) then raise exception 'Upload your attachment before posting.'; end if;
  return new;
end $$;
