import type { SupabaseClient } from "@supabase/supabase-js";

type LessonRow = { id: string; sort_order: number };
type ProgressRow = { lesson_id: string; completed_at: string | null };

export async function getBlockedLessonId(
  supabase: SupabaseClient,
  userId: string,
  chapterId: string,
  lessonId: string,
) {
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id,sort_order")
    .eq("chapter_id", chapterId)
    .eq("is_published", true)
    .order("sort_order");
  if (lessonsError) throw lessonsError;

  const orderedLessons = (lessons ?? []) as LessonRow[];
  const lessonIndex = orderedLessons.findIndex((lesson) => lesson.id === lessonId);
  if (lessonIndex <= 0) return null;

  const prerequisiteIds = orderedLessons.slice(0, lessonIndex).map((lesson) => lesson.id);
  const { data: progress, error: progressError } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id,completed_at")
    .eq("user_id", userId)
    .in("lesson_id", prerequisiteIds);
  if (progressError) throw progressError;

  const completedIds = new Set(
    ((progress ?? []) as ProgressRow[])
      .filter((item) => item.completed_at)
      .map((item) => item.lesson_id),
  );
  return prerequisiteIds.find((id) => !completedIds.has(id)) ?? null;
}
