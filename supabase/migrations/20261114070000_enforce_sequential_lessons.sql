-- Members complete published lessons in order within each chapter.

create or replace function public.validate_sequential_lesson_progress()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  current_lesson public.lessons;
begin
  if new.status not in ('in_progress', 'completed') and new.completed_at is null then
    return new;
  end if;

  select * into current_lesson
  from public.lessons
  where id = new.lesson_id
    and is_published;

  if not found then
    raise exception 'Lesson is unavailable';
  end if;

  if exists (
    select 1
    from public.lessons prerequisite
    left join public.user_lesson_progress progress
      on progress.lesson_id = prerequisite.id
      and progress.user_id = new.user_id
    where prerequisite.chapter_id = current_lesson.chapter_id
      and prerequisite.is_published
      and prerequisite.sort_order < current_lesson.sort_order
      and progress.completed_at is null
  ) then
    raise exception 'Complete the previous lesson before continuing';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_sequential_lesson_progress() from public, anon, authenticated;

drop trigger if exists validate_sequential_lesson_progress on public.user_lesson_progress;
create trigger validate_sequential_lesson_progress
before insert or update of status, completed_at on public.user_lesson_progress
for each row execute function public.validate_sequential_lesson_progress();
