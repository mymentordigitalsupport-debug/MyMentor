import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ChapterCard } from "@/components/course/ChapterCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .single();
  return { title: data?.title ?? "Course" };
}

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_guidance_path")
    .eq("id", user.id)
    .single();
  const profileGuidancePath = profile?.preferred_guidance_path as string | null;
  const guidancePath =
    profileGuidancePath === "general"
      ? "religious"
      : ((profileGuidancePath as "christian" | "religious" | null) ?? "religious");

  // Load course
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  // Load matching course version
  const { data: courseVersion } = await supabase
    .from("course_versions")
    .select("id, guidance_path, title")
    .eq("course_id", courseId)
    .eq("guidance_path", guidancePath)
    .single();

  if (!courseVersion) notFound();

  // Load Chapters
  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, title, description, sort_order")
    .eq("course_version_id", courseVersion.id)
    .eq("is_published", true)
    .order("sort_order");

  // Load lesson counts and progress
  const { data: lessonProgress } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .not("completed_at", "is", null);

  const completedIds = new Set(lessonProgress?.map((p) => p.lesson_id) ?? []);
  const ChapterIds = (chapters ?? []).map((mod) => mod.id);
  const { data: lessons } = ChapterIds.length
    ? await supabase
        .from("lessons")
        .select("id, chapter_id")
        .in("chapter_id", ChapterIds)
        .eq("is_published", true)
    : { data: [] };

  const lessonsByChapter = new Map<string, string[]>();
  (lessons ?? []).forEach((lesson) => {
    const current = lessonsByChapter.get(lesson.chapter_id) ?? [];
    current.push(lesson.id);
    lessonsByChapter.set(lesson.chapter_id, current);
  });

  const ChapterData = (chapters ?? []).map((mod) => {
    const ChapterLessonIds = lessonsByChapter.get(mod.id) ?? [];
    const total = ChapterLessonIds.length;
    const completed = ChapterLessonIds.filter((lessonId) => completedIds.has(lessonId)).length;

    return { ...mod, lessonsTotal: total, lessonsCompleted: completed };
  });

  return (
    <PageTransition>
      <div className="flex flex-col gap-5 py-8">
        {/* Back */}
        <Link href="/course" className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1">
          ← All Courses
        </Link>

        {/* Header */}
        <div>
          <Badge variant={courseVersion.guidance_path === "christian" ? "gold" : "sage"} className="mb-3">
            {courseVersion.guidance_path === "christian" ? "Christian Guided" : "Religious Guidance"}
          </Badge>
          <h1 className="font-serif text-3xl text-forest font-semibold mb-2 leading-snug">
            {course.title}
          </h1>
          {course.description && (
            <p className="text-muted text-sm leading-relaxed">{course.description}</p>
          )}
        </div>

        {/* Chapters */}
        <div className="flex flex-col gap-3">
          {ChapterData.map((mod) => (
            <ChapterCard
              key={mod.id}
              courseId={courseId}
              chapterId={mod.id}
              title={mod.title}
              description={mod.description}
              sortOrder={mod.sort_order}
              lessonsCompleted={mod.lessonsCompleted}
              lessonsTotal={mod.lessonsTotal}
            />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

