-- Required before deploying the production admin dashboard.
-- Prevent self-assigned roles and create private audio storage.

alter table public.profiles enable row level security;

revoke update on table public.profiles from anon, authenticated;
grant update (
  display_name,
  username,
  anonymous_name,
  is_anonymous,
  preferred_guidance_path,
  display_name_mode,
  selected_course_id,
  personal_goal,
  mood_baseline,
  onboarding_completed,
  onboarding_step,
  onboarding_completed_at,
  updated_at
) on table public.profiles to authenticated;

drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can update safe own profile fields" on public.profiles;
create policy "Users can update safe own profile fields"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.prevent_profile_privilege_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role'
    and (
      new.role is distinct from old.role
      or new.status is distinct from old.status
      or new.user_id is distinct from old.user_id
      or new.id is distinct from old.id
    ) then
    raise exception 'Profile privilege fields cannot be changed by a member.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_privilege_changes on public.profiles;
create trigger prevent_profile_privilege_changes
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_changes();

revoke all on function public.prevent_profile_privilege_changes() from public;

alter table public.courses enable row level security;
alter table public.course_versions enable row level security;
alter table public.chapters enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_content_blocks enable row level security;
alter table public.reflection_prompts enable row level security;
alter table public.pause_reflect_cards enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.resources enable row level security;

revoke insert, update, delete on table public.courses, public.course_versions,
  public.chapters, public.lessons, public.lesson_content_blocks,
  public.reflection_prompts,
  public.pause_reflect_cards, public.quizzes, public.quiz_questions,
  public.resources from anon, authenticated;

-- Media differs between older and current databases. Secure whichever base
-- table exists; do not ALTER the compatibility views mentor_videos/audio_tracks.
do $$
begin
  if exists (select 1 from pg_class where oid = to_regclass('public.mentor_media') and relkind in ('r', 'p')) then
    execute 'alter table public.mentor_media enable row level security';
    execute 'revoke insert, update, delete on table public.mentor_media from anon, authenticated';
  end if;
  if exists (select 1 from pg_class where oid = to_regclass('public.audio_tracks') and relkind in ('r', 'p')) then
    execute 'alter table public.audio_tracks enable row level security';
    execute 'revoke insert, update, delete on table public.audio_tracks from anon, authenticated';
  end if;
  if exists (select 1 from pg_class where oid = to_regclass('public.mentor_videos') and relkind in ('r', 'p')) then
    execute 'alter table public.mentor_videos enable row level security';
    execute 'revoke insert, update, delete on table public.mentor_videos from anon, authenticated';
  end if;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  false,
  262144000,
  array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/aac', 'audio/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
