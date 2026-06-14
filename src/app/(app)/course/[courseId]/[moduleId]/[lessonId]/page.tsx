import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { LessonReader } from "@/components/lesson/LessonReader";
import { PageTransition } from "@/components/ui/PageTransition";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("lessons")
    .select("title")
    .eq("id", lessonId)
    .single();
  return { title: data?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: Props) {
  const { courseId, moduleId: chapterId, lessonId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, subtitle, estimated_minutes, chapter_id")
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  const { data: blocks } = await supabase
    .from("lesson_content_blocks")
    .select("id, block_type, content, sort_order")
    .eq("lesson_id", lessonId)
    .order("sort_order");

  const { data: chapter } = await supabase
    .from("chapters")
    .select("title, course_version_id")
    .eq("id", chapterId)
    .single();

  const courseVersionId = chapter?.course_version_id ?? null;
  const { data: progress } = await supabase
    .from("user_lesson_progress")
    .select("completed_at")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const now = new Date().toISOString();
  if (progress) {
    await supabase
      .from("user_lesson_progress")
      .update({
        last_opened_at: now,
        status: progress.completed_at ? "completed" : "in_progress",
      })
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);
  } else {
    await supabase.from("user_lesson_progress").insert({
      user_id: user.id,
      lesson_id: lessonId,
      status: "in_progress",
      started_at: now,
      last_opened_at: now,
    });
  }

  if (courseVersionId) {
    const { data: existingEnrollment } = await supabase
      .from("user_course_enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_version_id", courseVersionId)
      .limit(1);

    if (!existingEnrollment || existingEnrollment.length === 0) {
      await supabase.from("user_course_enrollments").insert({
        user_id: user.id,
        course_version_id: courseVersionId,
        started_at: now,
        status: "active",
      });
    }

    const { data: existingCourseProgress } = await supabase
      .from("user_course_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_version_id", courseVersionId)
      .limit(1);

    if (!existingCourseProgress || existingCourseProgress.length === 0) {
      await supabase.from("user_course_progress").insert({
        user_id: user.id,
        course_version_id: courseVersionId,
        started_at: now,
        last_active_at: now,
      });
    } else {
      await supabase
        .from("user_course_progress")
        .update({ last_active_at: now })
        .eq("user_id", user.id)
        .eq("course_version_id", courseVersionId);
    }
  }

  const { data: lessonAttempt } = await supabase
    .from("lesson_attempts")
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        course_version_id: courseVersionId,
        status: progress?.completed_at ? "completed" : "in_progress",
        started_at: now,
        updated_at: now,
      },
      { onConflict: "user_id,lesson_id" }
    )
    .select("id")
    .single();

  const lessonAttemptId = lessonAttempt?.id ?? "";

  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, sort_order")
    .eq("chapter_id", chapterId)
    .eq("is_published", true)
    .order("sort_order");

  const currentIndex = allLessons?.findIndex((item) => item.id === lessonId) ?? -1;
  const nextLesson = allLessons?.[currentIndex + 1];
  const nextHref = nextLesson ? `/course/${courseId}/${chapterId}/${nextLesson.id}` : `/course/${courseId}/${chapterId}`;

  return (
    <PageTransition>
      <LessonReader
        courseId={courseId}
        courseVersionId={courseVersionId}
        chapterId={chapterId}
        chapterTitle={chapter?.title ?? "Chapter"}
        lessonId={lessonId}
        lessonAttemptId={lessonAttemptId}
        lessonTitle={lesson.title}
        lessonSubtitle={lesson.subtitle}
        estimatedMinutes={lesson.estimated_minutes}
        blocks={(blocks ?? []).map((block) => ({
          id: block.id,
          block_type: block.block_type,
          content: block.content as Record<string, unknown>,
          sort_order: block.sort_order,
        }))}
        nextHref={nextHref}
        backHref={`/course/${courseId}/${chapterId}`}
        isCompleted={Boolean(progress?.completed_at)}
        userId={user.id}
      />
    </PageTransition>
  );
}
