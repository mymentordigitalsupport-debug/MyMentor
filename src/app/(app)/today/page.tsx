import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageTransition } from "@/components/ui/PageTransition";
import { TodayBanner } from "@/components/today/TodayBanner";
import { MoodCheckIn } from "@/components/today/MoodCheckIn";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatShortDate, percent, truncate } from "@/lib/utils";
import type { MoodValue } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Today",
};

type CourseVersionRow = {
  id: string;
  guidance_path: string;
  title: string;
  description: string | null;
  course_id: string | null;
  courses: Array<{
    id: string;
    title: string;
    description: string | null;
  }>;
};

type CourseEnrollmentRow = {
  course_version_id: string;
  started_at: string | null;
  completed_at: string | null;
  status: string | null;
};

type ChapterRow = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

type LessonRow = {
  id: string;
  title: string;
  subtitle: string | null;
  estimated_minutes: number | null;
  sort_order: number;
  chapter_id: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type LessonProgressRow = {
  lesson_id: string;
  status: "not_started" | "in_progress" | "completed";
  started_at: string | null;
  completed_at: string | null;
  last_opened_at: string | null;
};

type JournalEntryRow = {
  id: string;
  title: string | null;
  body: string;
  created_at: string;
};

type InsightRow = {
  id: string;
  text: string;
  created_at: string;
};

type MoodCheckinRow = {
  id: string;
  mood: MoodValue;
  note: string | null;
  created_at: string;
};

type ReflectionItem = {
  id: string;
  text: string;
  created_at: string;
  source: "journal" | "insight";
};

function toTimestamp(value: string | null | undefined): number {
  if (!value) return 0;
  return new Date(value).getTime();
}

function toDateKey(value: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default async function TodayPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, is_anonymous, onboarding_completed, preferred_guidance_path, selected_course_id")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const resolvedName = profile.display_name ?? profile.username ?? "Friend";
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Johannesburg",
    hour: "2-digit",
    hour12: false,
  })
    .formatToParts(new Date())
    .find((part) => part.type === "hour");
  const currentHour = hour ? Number(hour.value) : new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  const profileGuidancePath = profile.preferred_guidance_path as string | null;
  const guidancePath =
    profileGuidancePath === "general"
      ? "religious"
      : ((profileGuidancePath as "christian" | "religious" | null) ?? "religious");
  const courseVersionSelect =
    "id, guidance_path, title, description, course_id, courses(id, title, description)";

  const recentCourseProgressPromise = supabase
    .from("user_course_progress")
    .select("course_version_id, started_at, completed_at, last_active_at")
    .eq("user_id", user.id)
    .order("last_active_at", { ascending: false })
    .limit(1);

  const recentEnrollmentPromise = supabase
    .from("user_course_enrollments")
    .select("course_version_id, started_at, completed_at, status")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(1);

  const guidedCourseVersionsPromise = supabase
    .from("course_versions")
    .select(courseVersionSelect)
    .eq("guidance_path", guidancePath)
    .eq("course_id", profile?.selected_course_id ?? "");

  const [{ data: recentCourseProgress }, { data: recentEnrollments }, { data: guidedCourseVersions }] = await Promise.all([
    recentCourseProgressPromise,
    recentEnrollmentPromise,
    guidedCourseVersionsPromise,
  ]);

  const guidedCourseVersionList = (guidedCourseVersions ?? []) as CourseVersionRow[];
  const enrollmentList = (recentEnrollments ?? []) as CourseEnrollmentRow[];
  const selectedCourseId = profile?.selected_course_id ?? null;
  const recentCourseVersionId = recentCourseProgress?.[0]?.course_version_id ?? enrollmentList[0]?.course_version_id ?? null;
  const recentCourseVersion =
    recentCourseVersionId
      ? guidedCourseVersionList.find((courseVersion) => courseVersion.id === recentCourseVersionId) ??
        (await supabase
          .from("course_versions")
          .select(courseVersionSelect)
          .eq("id", recentCourseVersionId)
          .maybeSingle()
          .then((result) => result.data as CourseVersionRow | null))
      : null;

  const selectedCourseVersion =
    selectedCourseId
      ? guidedCourseVersionList.find((courseVersion) => courseVersion.course_id === selectedCourseId) ?? null
      : null;

  const fallbackGuidedCourseVersions =
    guidedCourseVersionList.length > 0
      ? guidedCourseVersionList
      : ((await supabase
          .from("course_versions")
          .select(courseVersionSelect)
          .eq("guidance_path", guidancePath)
          .then((result) => result.data ?? [])) as CourseVersionRow[]);

  const activeCourseVersion =
    recentCourseVersion ??
    selectedCourseVersion ??
    fallbackGuidedCourseVersions.find((courseVersion) => courseVersion.course_id === selectedCourseId) ??
    fallbackGuidedCourseVersions[0] ??
    null;

  if (!activeCourseVersion) {
    return (
      <PageTransition>
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 pb-6">
          <Card variant="mist" padding="lg" className="text-center">
            <p className="text-sm text-muted">No course is available yet.</p>
          </Card>
        </div>
      </PageTransition>
    );
  }

  const course = activeCourseVersion.courses;
  const courseInfo = course?.[0] ?? null;
  const courseId = courseInfo?.id ?? activeCourseVersion.course_id ?? "";
  const courseTitle = courseInfo?.title ?? activeCourseVersion.title;
  const courseDescription = courseInfo?.description ?? activeCourseVersion.description;

  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("id, title, description, sort_order")
    .eq("course_version_id", activeCourseVersion.id)
    .eq("is_published", true)
    .order("sort_order");

  if (chaptersError) {
    throw new Error("Failed to load today chapters");
  }

  const ChapterList = (chapters ?? []) as ChapterRow[];
  const ChapterIds = ChapterList.map((Chapter) => Chapter.id);

  const lessonsPromise = ChapterIds.length
    ? supabase
        .from("lessons")
        .select("id, title, subtitle, estimated_minutes, sort_order, chapter_id, is_published, created_at, updated_at")
        .in("chapter_id", ChapterIds)
        .eq("is_published", true)
        .order("sort_order")
    : Promise.resolve({ data: [], error: null });

  const lessonProgressPromise = supabase
    .from("user_lesson_progress")
    .select("lesson_id, status, started_at, completed_at, last_opened_at")
    .eq("user_id", user.id);

  const weekAgoIso = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();

  const journalPromise = supabase
    .from("journal_entries")
    .select("id, title, body, created_at")
    .eq("user_id", user.id)
    .gte("created_at", weekAgoIso)
    .order("created_at", { ascending: false })
    .limit(10);

  const moodPromise = supabase
    .from("mood_checkins")
    .select("id, mood, note, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(7);

  const insightsPromise = supabase
    .from("saved_insights")
    .select("id, text, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const [
    { data: lessons, error: lessonsError },
    { data: lessonProgress },
    { data: journalEntries },
    { data: moodCheckins },
    { data: savedInsights },
  ] = await Promise.all([lessonsPromise, lessonProgressPromise, journalPromise, moodPromise, insightsPromise]);

  if (lessonsError) {
    throw new Error("Failed to load today lessons");
  }

  const lessonList = (lessons ?? []) as LessonRow[];
  const progressList = (lessonProgress ?? []) as LessonProgressRow[];
  const completedLessonIds = new Set(
    progressList.filter((progress) => progress.status === "completed" || progress.completed_at).map((progress) => progress.lesson_id)
  );

  const lessonsByChapter = new Map<string, LessonRow[]>();
  lessonList.forEach((lesson) => {
    const existing = lessonsByChapter.get(lesson.chapter_id) ?? [];
    existing.push(lesson);
    lessonsByChapter.set(lesson.chapter_id, existing);
  });

  const ChapterData = ChapterList.map((Chapter) => {
    const ChapterLessons = lessonsByChapter.get(Chapter.id) ?? [];
    const lessonsCompleted = ChapterLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;

    return {
      ...Chapter,
      lessons: ChapterLessons,
      lessonsTotal: ChapterLessons.length,
      lessonsCompleted,
    };
  });

  const activeProgress =
    [...progressList]
      .sort((a, b) => toTimestamp(b.last_opened_at ?? b.started_at ?? b.completed_at) - toTimestamp(a.last_opened_at ?? a.started_at ?? a.completed_at))
      .find((progress) => progress.status !== "completed") ??
    [...progressList].sort((a, b) => toTimestamp(b.last_opened_at ?? b.started_at ?? b.completed_at) - toTimestamp(a.last_opened_at ?? a.started_at ?? a.completed_at))[0] ??
    null;

  const currentLesson =
    (activeProgress ? lessonList.find((lesson) => lesson.id === activeProgress.lesson_id) : null) ??
    lessonList.find((lesson) => !completedLessonIds.has(lesson.id)) ??
    lessonList[0] ??
    null;

  const currentChapter =
    (currentLesson ? ChapterList.find((Chapter) => Chapter.id === currentLesson.chapter_id) : null) ?? ChapterList[0] ?? null;

  const completedLessons = completedLessonIds.size;
  const totalLessons = lessonList.length;
  const completedChapters = ChapterData.filter(
    (Chapter) => Chapter.lessonsTotal > 0 && Chapter.lessonsCompleted === Chapter.lessonsTotal
  ).length;
  const totalChapters = ChapterData.length;
  const progressPercent = totalLessons > 0 ? percent(completedLessons, totalLessons) : 0;

  const moodHistory = (moodCheckins ?? []) as MoodCheckinRow[];
  const todayCheckin = moodHistory.find((entry) => toDateKey(entry.created_at) === toDateKey(new Date().toISOString())) ?? null;
  const latestMood = (todayCheckin?.mood ?? null) as MoodValue | null;
  const latestMoodAt = todayCheckin?.created_at ?? moodHistory[0]?.created_at ?? null;
  const latestNote = todayCheckin?.note ?? moodHistory[0]?.note ?? null;

  const journalHistory = (journalEntries ?? []) as JournalEntryRow[];
  const savedInsightHistory = (savedInsights ?? []) as InsightRow[];
  const reflections: ReflectionItem[] = [
    ...journalHistory.map((entry) => ({
      id: `journal-${entry.id}`,
      text: entry.body,
      created_at: entry.created_at,
      source: "journal" as const,
    })),
    ...savedInsightHistory.map((insight) => ({
      id: `insight-${insight.id}`,
      text: insight.text,
      created_at: insight.created_at,
      source: "insight" as const,
    })),
  ]
    .sort((a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at))
    .slice(0, 3);

  const weeklyLessonProgressPromise = supabase
    .from("user_lesson_progress")
    .select("lesson_id, completed_at, started_at")
    .eq("user_id", user.id)
    .gte("completed_at", weekAgoIso);

  const { data: weeklyLessonProgress } = await weeklyLessonProgressPromise;

  const weeklyCompletedLessons = new Set(
    (weeklyLessonProgress ?? [])
      .filter((progress) => progress.completed_at)
      .map((progress) => progress.lesson_id)
  ).size;
  const reflectionDays = new Set(journalHistory.map((entry) => toDateKey(entry.created_at))).size;
  const moodCounts = moodHistory.reduce<Record<MoodValue, number>>(
    (counts, item) => {
      counts[item.mood] = (counts[item.mood] ?? 0) + 1;
      return counts;
    },
    { low: 0, heavy: 0, uncertain: 0, hopeful: 0, steady: 0, strong: 0 }
  );
  const topMood = (Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null) as MoodValue | null;

  const currentLessonCard =
    currentLesson && currentChapter
      ? {
          id: currentLesson.id,
          title: currentLesson.title,
          description: currentLesson.subtitle,
          estimated_minutes: currentLesson.estimated_minutes,
          sort_order: currentLesson.sort_order,
          ChapterId: currentChapter.id,
          courseId,
          courseVersionId: activeCourseVersion.id,
          ChapterName: currentChapter.title,
          chapter_id: currentLesson.chapter_id,
          is_published: currentLesson.is_published,
          created_at: currentLesson.created_at,
          updated_at: currentLesson.updated_at,
        }
      : null;

  return (
    <PageTransition>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 pb-6">
        <TodayBanner
          greeting={greeting}
          userName={resolvedName}
          latestMood={latestMood}
          course={{
            courseTitle: activeCourseVersion.title,
            progressPercent,
            chaptersCompleted: completedChapters,
            totalChapters,
            lessonsCompleted: completedLessons,
            totalLessons,
            currentChapter: currentChapter?.title ?? "Current Chapter",
            currentLessonTitle: currentLesson?.title ?? "Continue your course",
            currentLessonSubtitle: currentLesson?.subtitle ?? courseDescription,
            currentLessonMinutes: currentLesson?.estimated_minutes ?? null,
            currentLessonHref: currentLesson ? `/course/${courseId}/${currentChapter?.id}/${currentLesson.id}` : "/course",
          }}
        />

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-5">
            <MoodCheckIn
              userId={user.id}
              latestMood={latestMood}
              latestMoodAt={latestMoodAt}
              latestNote={latestNote}
              moodHistory={moodHistory}
              todayCheckinId={todayCheckin?.id ?? null}
            />

            <Card variant="default" padding="md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Today&apos;s focus</p>
                  <h2 className="mt-2 text-lg font-semibold text-text">Small steps become lasting change.</h2>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-[#eadfcf] bg-[#fbf9f5] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Lesson</p>
                <p className="mt-2 text-sm font-medium text-forest">
                  {currentLessonCard?.title ?? "Continue your current lesson"}
                </p>
              </div>
            </Card>

            <Card variant="default" padding="md" className="relative top-[8px]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Course progress</p>
                  <h2 className="mt-2 text-lg font-semibold text-text">How am I progressing?</h2>
                </div>
                <Badge variant="sage">{progressPercent}% complete</Badge>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>Progress</span>
                  <span>{completedLessons} lessons completed</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-mist">
                  <div className="h-3 rounded-full bg-sage" style={{ width: `${Math.max(progressPercent, 6)}%` }} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-mist bg-cream p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Chapters complete</p>
                  <p className="mt-2 text-xl font-semibold text-forest">{completedChapters}</p>
                </div>
                <div className="rounded-2xl border border-mist bg-cream p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Lessons complete</p>
                  <p className="mt-2 text-xl font-semibold text-forest">{completedLessons}</p>
                </div>
                <div className="rounded-2xl border border-mist bg-cream p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Current Chapter</p>
                  <p className="mt-2 text-sm font-semibold text-forest">{currentChapter?.title ?? "Current Chapter"}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <Card variant="default" padding="md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Recent insights</p>
                  <h2 className="mt-2 text-lg font-semibold text-text">Recent reflections</h2>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {reflections.length > 0 ? (
                  reflections.map((reflection) => (
                    <div key={reflection.id} className="rounded-2xl border border-mist bg-cream p-4">
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant={reflection.source === "journal" ? "sage" : "gold"}>
                          {reflection.source === "journal" ? "Journal" : "Insight"}
                        </Badge>
                        <span className="text-xs text-muted">{formatShortDate(reflection.created_at)}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-text">{truncate(reflection.text, 120)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No reflections saved yet.</p>
                )}
              </div>
            </Card>

            <Card variant="default" padding="md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Course consistency</p>
                  <h2 className="mt-2 text-lg font-semibold text-text">Gentle accountability</h2>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-mist bg-cream px-4 py-3">
                  <p className="text-xs text-muted">Reflection days</p>
                  <p className="mt-1 text-xl font-semibold text-forest">{reflectionDays} days this week</p>
                </div>
                <div className="rounded-2xl border border-mist bg-cream px-4 py-3">
                  <p className="text-xs text-muted">Lessons completed this week</p>
                  <p className="mt-1 text-xl font-semibold text-forest">{weeklyCompletedLessons}</p>
                </div>
                <div className="rounded-2xl border border-mist bg-cream px-4 py-3">
                  <p className="text-xs text-muted">Most common mood</p>
                  <p className="mt-1 text-xl font-semibold capitalize text-forest">{topMood ?? "Not enough data yet"}</p>
                </div>
              </div>
            </Card>

            <Card variant="default" padding="md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Quick actions</p>
                  <h2 className="mt-2 text-lg font-semibold text-text">Move without overthinking</h2>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <Link
                  href="/course"
                  className="rounded-2xl border border-mist bg-cream px-4 py-3 text-sm font-medium text-forest transition hover:border-sage"
                >
                  Open course page
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

