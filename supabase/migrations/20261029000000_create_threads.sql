-- Member community. Identity is resolved by the database, never supplied by a client.
create table public.threads_entries (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text not null default 'Member',
  is_anonymous boolean not null default false,
  parent_id uuid references public.threads_entries(id) on delete cascade,
  post_id uuid references public.threads_entries(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 3000),
  media_path text,
  media_type text check (media_type in ('image', 'video')),
  rules_accepted boolean not null check (rules_accepted),
  created_at timestamptz not null default now(),
  check (length(trim(body)) > 0 or media_path is not null),
  check ((media_path is null) = (media_type is null)),
  check ((parent_id is null) = (post_id is null)),
  check (parent_id is null or media_path is null)
);
create index threads_entries_feed on public.threads_entries(created_at desc) where parent_id is null;
create index threads_entries_comments on public.threads_entries(post_id, created_at);

create function public.prepare_thread_entry() returns trigger
language plpgsql security definer set search_path = public as $$
declare p public.profiles; parent public.threads_entries;
begin
  if auth.uid() is null or new.author_id <> auth.uid() then
    raise exception 'Sign in to post.';
  end if;
  select * into p from public.profiles where user_id = auth.uid();
  new.is_anonymous := coalesce(p.is_anonymous, false);
  new.author_name := case when new.is_anonymous then coalesce(nullif(p.anonymous_name, ''), 'Anonymous Member')
    else coalesce(nullif(p.display_name, ''), 'Member') end;
  new.created_at := now();
  if exists (select 1 from public.threads_entries where author_id = auth.uid() and created_at > now() - interval '10 seconds') then
    raise exception 'Please wait 10 seconds between posts or replies.';
  end if;
  if new.parent_id is not null then
    select * into parent from public.threads_entries where id = new.parent_id;
    if not found or coalesce(parent.post_id, parent.id) <> new.post_id then
      raise exception 'Reply must belong to this thread.';
    end if;
  end if;
  if new.media_path is not null and not exists (
    select 1 from storage.objects where bucket_id = 'threads_media' and name = new.media_path
      and (storage.foldername(name))[1] = auth.uid()::text
  ) then raise exception 'Upload your attachment before posting.'; end if;
  return new;
end $$;
create trigger prepare_thread_entry before insert on public.threads_entries
for each row execute function public.prepare_thread_entry();

create table public.threads_votes (
  entry_id uuid not null references public.threads_entries(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (entry_id, user_id)
);
alter table public.threads_entries enable row level security;
alter table public.threads_votes enable row level security;
create policy "Anyone read threads" on public.threads_entries for select to anon, authenticated using (true);
create policy "Members post as themselves" on public.threads_entries for insert to authenticated with check (author_id = auth.uid());
create policy "Authors delete their entries" on public.threads_entries for delete to authenticated using (author_id = auth.uid());
create policy "Members read reactions" on public.threads_votes for select to authenticated using (true);
create policy "Members react as themselves" on public.threads_votes for insert to authenticated with check (user_id = auth.uid());
create policy "Members change their reactions" on public.threads_votes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Members remove their reactions" on public.threads_votes for delete to authenticated using (user_id = auth.uid());
grant select, insert, delete on public.threads_entries to authenticated;
grant select, insert, update, delete on public.threads_votes to authenticated;

create function public.thread_reactions(entry_ids uuid[])
returns table (entry_id uuid, likes bigint, dislikes bigint, my_vote smallint)
language sql stable security definer set search_path = public as $$
  select v.entry_id, count(*) filter (where value = 1), count(*) filter (where value = -1),
    max(value) filter (where user_id = auth.uid())
  from public.threads_votes v where auth.uid() is not null and v.entry_id = any(entry_ids)
  group by v.entry_id;
$$;
revoke all on function public.thread_reactions(uuid[]) from public;
grant execute on function public.thread_reactions(uuid[]) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('threads_media', 'threads_media', false, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']);
create policy "Members view thread media" on storage.objects for select to authenticated
using (bucket_id = 'threads_media');
create policy "Members upload own thread media" on storage.objects for insert to authenticated
with check (bucket_id = 'threads_media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Members remove own thread media" on storage.objects for delete to authenticated
using (bucket_id = 'threads_media' and (storage.foldername(name))[1] = auth.uid()::text);
