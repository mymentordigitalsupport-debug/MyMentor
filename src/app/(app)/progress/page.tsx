import type { Metadata } from "next";
import { Brain, CheckCircle2, NotebookPen, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDisplayCourseTitle } from "@/lib/course-library";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Progress" };

type CourseVersion = { id: string; title: string; course_id: string | null; courses: Array<{ id: string; title: string }> };
type Chapter = { id: string; title: string; sort_order: number };
type Lesson = { id: string; chapter_id: string; title: string; sort_order: number };
type LessonProgress = { lesson_id: string; status: string | null; completed_at: string | null; started_at: string | null; last_opened_at: string | null };

function percent(done: number, total: number) { return total ? Math.min(100, Math.round((done / total) * 100)) : 0; }
function minutesLabel(seconds: number) { const minutes = Math.round(seconds / 60); return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60 ? `${minutes % 60}m` : ""}`.trim(); }

export default async function ProgressPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: courseProgress }, { data: enrollments }] = await Promise.all([
    supabase.from("profiles").select("preferred_guidance_path, selected_course_id").eq("id", user.id).maybeSingle(),
    supabase.from("user_course_progress").select("course_version_id, last_active_at").eq("user_id", user.id).order("last_active_at", { ascending: false }).limit(1),
    supabase.from("user_course_enrollments").select("course_version_id, started_at").eq("user_id", user.id).order("started_at", { ascending: false }).limit(1),
  ]);
  const guidancePath = profile?.preferred_guidance_path === "general" ? "religious" : profile?.preferred_guidance_path ?? "religious";
  const activeVersionId = courseProgress?.[0]?.course_version_id ?? enrollments?.[0]?.course_version_id ?? null;
  const versionSelect = "id, title, course_id, courses(id, title)";
  const versionResult = activeVersionId
    ? await supabase.from("course_versions").select(versionSelect).eq("id", activeVersionId).maybeSingle()
    : await supabase.from("course_versions").select(versionSelect).eq("guidance_path", guidancePath).eq("course_id", profile?.selected_course_id ?? "").limit(1).maybeSingle();
  const activeVersion = (versionResult.data ?? null) as CourseVersion | null;

  const [{ data: lessonProgress }, { data: stepEvents }, { data: quizAnswers }, { data: moods }, { data: journals }, { data: insights }] = await Promise.all([
    supabase.from("user_lesson_progress").select("lesson_id, status, completed_at, started_at, last_opened_at").eq("user_id", user.id),
    supabase.from("lesson_step_events").select("duration_ms").eq("user_id", user.id).limit(1000),
    supabase.from("lesson_quiz_answers").select("is_correct").eq("user_id", user.id).limit(500),
    supabase.from("mood_checkins").select("id, mood, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
    supabase.from("journal_entries").select("id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
    supabase.from("saved_insights").select("id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
  ]);

  const chaptersResult = activeVersion ? await supabase.from("chapters").select("id, title, sort_order").eq("course_version_id", activeVersion.id).eq("is_published", true).order("sort_order") : { data: [] as Chapter[] };
  const chapters = (chaptersResult.data ?? []) as Chapter[];
  const chapterIds = chapters.map((chapter) => chapter.id);
  const lessonsResult = chapterIds.length ? await supabase.from("lessons").select("id, chapter_id, title, sort_order").in("chapter_id", chapterIds).eq("is_published", true).order("sort_order") : { data: [] as Lesson[] };
  const lessons = (lessonsResult.data ?? []) as Lesson[];
  const progressRows = (lessonProgress ?? []) as LessonProgress[];
  const completedIds = new Set(progressRows.filter((row) => row.status === "completed" || row.completed_at).map((row) => row.lesson_id));
  const completedLessons = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
  const chapterRows = chapters.map((chapter) => { const chapterLessons = lessons.filter((lesson) => lesson.chapter_id === chapter.id); const done = chapterLessons.filter((lesson) => completedIds.has(lesson.id)).length; return { ...chapter, total: chapterLessons.length, done }; });
  const completedChapters = chapterRows.filter((chapter) => chapter.total > 0 && chapter.done === chapter.total).length;
  const overallPercent = percent(completedLessons, lessons.length);
  const nextLesson = lessons.find((lesson) => !completedIds.has(lesson.id)) ?? null;
  const nextChapter = nextLesson ? chapters.find((chapter) => chapter.id === nextLesson.chapter_id) : null;
  const sevenDaysAgo = Date.now() - 6 * 86_400_000;
  const completedThisWeek = progressRows.filter((row) => row.completed_at && new Date(row.completed_at).getTime() >= sevenDaysAgo).length;
  const learningSeconds = (stepEvents ?? []).reduce((total, event) => total + Math.max(0, Number(event.duration_ms ?? 0)) / 1000, 0);
  const quizTotal = quizAnswers?.length ?? 0;
  const quizCorrect = (quizAnswers ?? []).filter((answer) => answer.is_correct).length;
  const latestMood = moods?.[0] ?? null;
  const activity = [
    ...progressRows.filter((row) => row.completed_at).map((row) => ({ type: "Lesson completed", at: row.completed_at as string, icon: CheckCircle2 })),
    ...(journals ?? []).map((entry) => ({ type: "Journal entry", at: entry.created_at, icon: NotebookPen })),
    ...(moods ?? []).map((entry) => ({ type: "Mood check-in", at: entry.created_at, icon: Brain })),
    ...(insights ?? []).map((entry) => ({ type: "Insight saved", at: entry.created_at, icon: Sparkles })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 5);
  const courseTitle = activeVersion ? getDisplayCourseTitle(activeVersion.courses?.[0]?.title ?? activeVersion.title) : null;

  const nextLessonHref = nextLesson && activeVersion?.courses?.[0]?.id
    ? `/course/${activeVersion.courses[0].id}/${nextLesson.chapter_id}/${nextLesson.id}`
    : "/course";
  const latestMoodDate = latestMood
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(latestMood.created_at))
    : null;

  return (
    <ProgressDashboard
      courseTitle={courseTitle}
      activeVersion={Boolean(activeVersion)}
      overallPercent={overallPercent}
      completedLessons={completedLessons}
      totalLessons={lessons.length}
      completedChapters={completedChapters}
      totalChapters={chapters.length}
      nextChapterTitle={nextChapter?.title ?? null}
      nextLessonTitle={nextLesson?.title ?? null}
      nextLessonHref={nextLessonHref}
      completedThisWeek={completedThisWeek}
      learningTime={minutesLabel(learningSeconds)}
      chapters={chapterRows}
      journalCount={journals?.length ?? 0}
      moodCount={moods?.length ?? 0}
      insightCount={insights?.length ?? 0}
      latestMood={latestMood?.mood ?? null}
      latestMoodDate={latestMoodDate}
      quizTotal={quizTotal}
      quizCorrect={quizCorrect}
      activity={activity}
    />
  );
}