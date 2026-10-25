import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, CheckCircle2, Clock3, NotebookPen, Sparkles, Target, Trophy } from "lucide-react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDisplayCourseTitle } from "@/lib/course-library";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Progress" };

type CourseVersion = { id: string; title: string; course_id: string | null; courses: Array<{ id: string; title: string }> };
type Chapter = { id: string; title: string; sort_order: number };
type Lesson = { id: string; chapter_id: string; title: string; sort_order: number };
type LessonProgress = { lesson_id: string; status: string | null; completed_at: string | null; started_at: string | null; last_opened_at: string | null };

function percent(done: number, total: number) { return total ? Math.min(100, Math.round((done / total) * 100)) : 0; }
function shortDate(value: string) { return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value)); }
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

  return <div className="mx-auto w-full max-w-6xl pb-12">
    <header className="flex flex-col gap-5 border-b border-mist pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Your journey</p><h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-forest sm:text-5xl">Progress</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">A clear view of your course, learning rhythm, and reflections.</p></div><Link href="/course" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-sage/45 px-5 text-sm font-semibold text-forest transition hover:bg-mist">Open course <ArrowRight className="h-4 w-4" /></Link></header>
    <section className="mt-7 overflow-hidden rounded-[30px] bg-forest px-6 py-7 text-cream shadow-[0_20px_45px_-30px_rgba(31,42,36,.75)] sm:px-9 sm:py-9"><div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-cream/65">{courseTitle ?? "Course progress"}</p><h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">{activeVersion ? `${overallPercent}% complete` : "Choose a course to begin"}</h2><p className="mt-3 text-sm text-cream/75">{activeVersion ? `${completedLessons} of ${lessons.length} lessons completed` : "Your reflection and activity progress will still appear below."}</p></div><div className="w-full max-w-md"><div className="h-3 overflow-hidden rounded-full bg-cream/20"><div className="h-full rounded-full bg-gold transition-all" style={{ width: `${overallPercent}%` }} /></div>{nextLesson ? <p className="mt-3 text-sm text-cream/80">Next: <span className="font-semibold text-cream">{nextLesson.title}</span></p> : activeVersion ? <p className="mt-3 text-sm font-semibold text-gold">Course complete.</p> : null}</div></div></section>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={BookOpen} label="Lessons completed" value={`${completedLessons}/${lessons.length}`} detail={activeVersion ? "Across your current course" : "Start a course to track this"} /><Stat icon={Target} label="Chapters finished" value={`${completedChapters}/${chapters.length}`} detail={nextChapter ? `Current: ${nextChapter.title}` : "No active chapter yet"} /><Stat icon={Trophy} label="This week" value={`${completedThisWeek}`} detail="Lessons completed" /><Stat icon={Clock3} label="Learning time" value={minutesLabel(learningSeconds)} detail="Tracked lesson time" /></section>
    <div className="mt-7 grid gap-7 lg:grid-cols-[1.35fr_.85fr]"><section className="rounded-[28px] border border-mist bg-white p-6 shadow-[0_16px_36px_-32px_rgba(31,42,36,.45)] sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-sage">Course roadmap</p><h2 className="mt-2 font-serif text-2xl font-semibold text-forest">Chapter progress</h2></div><span className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-forest">{overallPercent}%</span></div>{chapterRows.length ? <div className="mt-7 space-y-5">{chapterRows.map((chapter) => { const value = percent(chapter.done, chapter.total); return <div key={chapter.id}><div className="flex items-baseline justify-between gap-3 text-sm"><span className="font-semibold text-text">{chapter.title}</span><span className="shrink-0 text-muted">{chapter.done}/{chapter.total}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-sage" style={{ width: `${value}%` }} /></div></div>; })}</div> : <Empty text="Your chapter roadmap appears once a course is available." />}</section>
    <section className="rounded-[28px] border border-mist bg-cream p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[.18em] text-sage">Reflection rhythm</p><h2 className="mt-2 font-serif text-2xl font-semibold text-forest">Your wellbeing notes</h2><div className="mt-6 grid grid-cols-3 gap-3"><MiniStat value={`${journals?.length ?? 0}`} label="Journal" /><MiniStat value={`${moods?.length ?? 0}`} label="Mood" /><MiniStat value={`${insights?.length ?? 0}`} label="Insights" /></div><div className="mt-6 rounded-2xl border border-sage/20 bg-white/70 p-4"><p className="text-xs font-semibold uppercase tracking-[.16em] text-muted">Latest mood</p><p className="mt-2 text-sm font-semibold capitalize text-forest">{latestMood?.mood ?? "No check-in yet"}</p><p className="mt-1 text-xs text-muted">{latestMood ? shortDate(latestMood.created_at) : "Check in during a lesson to see it here."}</p></div><div className="mt-5 border-t border-sage/20 pt-5"><p className="text-xs font-semibold uppercase tracking-[.16em] text-muted">Quiz accuracy</p><p className="mt-2 font-serif text-3xl font-semibold text-forest">{quizTotal ? `${percent(quizCorrect, quizTotal)}%` : "—"}</p><p className="mt-1 text-xs text-muted">{quizTotal ? `${quizCorrect} correct from ${quizTotal} answers` : "Complete a quiz to track mastery."}</p></div></section></div>
    <section className="mt-7 rounded-[28px] border border-mist bg-white p-6 shadow-[0_16px_36px_-32px_rgba(31,42,36,.45)] sm:p-7"><p className="text-xs font-semibold uppercase tracking-[.18em] text-sage">Recent activity</p><h2 className="mt-2 font-serif text-2xl font-semibold text-forest">Small steps, recorded</h2>{activity.length ? <ol className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{activity.map((item, index) => { const Icon = item.icon; return <li key={`${item.type}-${item.at}-${index}`} className="rounded-2xl bg-mist/60 p-4"><Icon className="h-4 w-4 text-sage" /><p className="mt-4 text-sm font-semibold text-forest">{item.type}</p><p className="mt-1 text-xs text-muted">{shortDate(item.at)}</p></li>; })}</ol> : <Empty text="Your completed lessons, reflections, check-ins, and saved insights will appear here." />}</section>
  </div>;
}

function Stat({ icon: Icon, label, value, detail }: { icon: typeof BookOpen; label: string; value: string; detail: string }) { return <div className="rounded-[24px] border border-mist bg-white p-5"><Icon className="h-5 w-5 text-sage" /><p className="mt-5 text-xs font-semibold uppercase tracking-[.15em] text-muted">{label}</p><p className="mt-2 font-serif text-3xl font-semibold text-forest">{value}</p><p className="mt-1 text-xs leading-5 text-muted">{detail}</p></div>; }
function MiniStat({ value, label }: { value: string; label: string }) { return <div className="rounded-xl border border-sage/15 bg-white/70 px-3 py-3 text-center"><p className="font-serif text-2xl font-semibold text-forest">{value}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.12em] text-muted">{label}</p></div>; }
function Empty({ text }: { text: string }) { return <p className="mt-6 rounded-2xl border border-dashed border-sage/30 bg-cream/50 p-5 text-sm leading-6 text-muted">{text}</p>; }
