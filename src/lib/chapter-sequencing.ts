import type { SupabaseClient } from "@supabase/supabase-js";

type ChapterRow = { id: string; sort_order: number };
type LessonRow = { id: string; chapter_id: string };
type ProgressRow = { lesson_id: string; completed_at: string | null };

export async function getBlockedChapterId(
  supabase: SupabaseClient,
  userId: string,
  courseVersionId: string,
  chapterId: string,
) {
  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("id,sort_order")
    .eq("course_version_id", courseVersionId)
    .eq("is_published", true)
    .order("sort_order");
  if (chaptersError) throw chaptersError;

  const orderedChapters = (chapters ?? []) as ChapterRow[];
  const chapterIndex = orderedChapters.findIndex((chapter) => chapter.id === chapterId);
  if (chapterIndex <= 0) return null;

  const prerequisiteChapterIds = orderedChapters
    .slice(0, chapterIndex)
    .map((chapter) => chapter.id);
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id,chapter_id")
    .in("chapter_id", prerequisiteChapterIds)
    .eq("is_published", true);
  if (lessonsError) throw lessonsError;

  const prerequisiteLessons = (lessons ?? []) as LessonRow[];
  if (prerequisiteLessons.length === 0) return null;

  const { data: progress, error: progressError } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id,completed_at")
    .eq("user_id", userId)
    .in("lesson_id", prerequisiteLessons.map((lesson) => lesson.id));
  if (progressError) throw progressError;

  const completedIds = new Set(
    ((progress ?? []) as ProgressRow[])
      .filter((item) => item.completed_at)
      .map((item) => item.lesson_id),
  );

  return prerequisiteChapterIds.find((prerequisiteChapterId) => {
    const chapterLessons = prerequisiteLessons.filter(
      (lesson) => lesson.chapter_id === prerequisiteChapterId,
    );
    return chapterLessons.some((lesson) => !completedIds.has(lesson.id));
  }) ?? null;
}
