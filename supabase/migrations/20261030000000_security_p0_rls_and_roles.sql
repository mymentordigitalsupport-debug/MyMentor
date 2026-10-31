-- Security P0: close member-data exposure and prevent self-assigned roles.
-- Apply through the Supabase migration pipeline before deploying the matching app code.

-- Policies in the original schema existed without RLS on these tables. Enable RLS
-- so the policies actually apply to PostgREST/browser requests.
alter table public.courses enable row level security;
alter table public.course_versions enable row level security;
alter table public.chapters enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_content_blocks enable row level security;
alter table public.mentor_videos enable row level security;
alter table public.audio_tracks enable row level security;
alter table public.reflection_prompts enable row level security;
alter table public.pause_reflect_cards enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.resources enable row level security;

-- A member must never be able to change role, status, or another account's identity.
-- Column grants are enforced before the UPDATE policy; the trigger protects against
-- accidental future broad UPDATE grants.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
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
  if auth.role() <> 'service_role'
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

-- Existing member-owned tables keep their policies, but explicit grants avoid
-- relying on Supabase's default table privileges.
revoke all on table public.journal_entries, public.mood_checkins, public.saved_insights,
  public.user_course_progress, public.user_lesson_progress from anon, authenticated;
grant select, insert, update, delete on table public.journal_entries, public.mood_checkins,
  public.saved_insights, public.user_course_progress, public.user_lesson_progress to authenticated;

-- Content is intentionally readable by visitors. Write access stays service-role only.
revoke all on table public.courses, public.course_versions, public.chapters, public.lessons,
  public.lesson_content_blocks, public.mentor_videos, public.audio_tracks,
  public.reflection_prompts, public.pause_reflect_cards, public.quizzes,
  public.quiz_questions, public.resources from anon, authenticated;
grant select on table public.courses, public.course_versions, public.chapters, public.lessons,
  public.lesson_content_blocks, public.mentor_videos, public.audio_tracks,
  public.reflection_prompts, public.pause_reflect_cards, public.quizzes,
  public.quiz_questions, public.resources to anon, authenticated;

-- Security-definer functions must not be callable by arbitrary database users.
revoke all on function public.handle_new_user() from public;

