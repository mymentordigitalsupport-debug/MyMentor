-- Rename the course content model from modules to chapters.
-- This preserves the existing relationships while changing the table and column names.

alter table if exists public.lessons
  rename column module_id to chapter_id;

alter table if exists public.modules
  rename to chapters;

alter index if exists idx_modules_course_version_id
  rename to idx_chapters_course_version_id;

alter index if exists idx_lessons_module_id
  rename to idx_lessons_chapter_id;
