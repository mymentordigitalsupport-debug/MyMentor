-- Replace the Christian course video placeholders with the generated private audio tracks.
update public.lesson_content_blocks as block
set
  block_type = 'audio',
  content = jsonb_build_object(
    'title', lesson.title,
    'storage_path', track.url
  ),
  updated_at = now()
from public.lessons as lesson
join public.chapters as chapter on chapter.id = lesson.chapter_id
join public.course_versions as version on version.id = chapter.course_version_id
join public.courses as course on course.id = version.course_id
join public.audio_tracks as track on track.title = format(
  'Christian · Chapter %s: %s · Lesson %s: %s',
  chapter.sort_order,
  chapter.title,
  lesson.sort_order,
  lesson.title
)
where block.lesson_id = lesson.id
  and block.block_type in ('video', 'audio')
  and course.slug = 'uprooting-drug-abuse'
  and version.guidance_path = 'christian';
