import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { LessonRow } from "@/components/course/LessonRow";
import { PageTransition } from "@/components/ui/PageTransition";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { percent } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId: chapterId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("chapters")
    .select("title")
    .eq("id", chapterId)
    .single();
  return { title: data?.title ?? "Chapter" };
}

export default async function ChapterPage({ params }: Props) {
  const { courseId, moduleId: chapterId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: mod } = await supabase
    .from("chapters")
    .select("id, title, description")
    .eq("id", chapterId)
    .single();

  if (!mod) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, subtitle, estimated_minutes, sort_order")
    .eq("chapter_id", chapterId)
    .eq("is_published", true)
    .order("sort_order");

  const { data: lessonProgress } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .not("completed_at", "is", null);

  const completedIds = new Set(lessonProgress?.map((p) => p.lesson_id) ?? []);
  const total = lessons?.length ?? 0;
  const completed = lessons?.filter((l) => completedIds.has(l.id)).length ?? 0;

  return (
    <PageTransition>
      <div className="flex flex-col gap-5 py-8">
        {/* Back */}
        <Link
          href={`/course/${courseId}`}
          className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
        >
          ← Back to Course
        </Link>

        {/* Header */}
        <div>
          <h1 className="font-serif text-2xl text-forest font-semibold mb-2 leading-snug">
            {mod.title}
          </h1>
          {mod.description && (
            <p className="text-muted text-sm leading-relaxed mb-4">
              {mod.description}
            </p>
          )}
          <ProgressBar
            value={percent(completed, total)}
            label={`${completed} of ${total} lessons complete`}
            showPercent
          />
        </div>

        {/* Lessons */}
        <div className="flex flex-col gap-2">
          {(lessons ?? []).map((lesson) => (
            <LessonRow
              key={lesson.id}
              courseId={courseId}
              chapterId={chapterId}
              lessonId={lesson.id}
              title={lesson.title}
              description={lesson.subtitle}
              estimatedMinutes={lesson.estimated_minutes}
              sortOrder={lesson.sort_order}
              isCompleted={completedIds.has(lesson.id)}
            />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

