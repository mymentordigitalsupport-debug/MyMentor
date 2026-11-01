import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageTransition } from "@/components/ui/PageTransition";
import { MemberDashboard } from "@/components/today/MemberDashboard";
import { getDisplayCourseTitle } from "@/lib/course-library";
import { percent } from "@/lib/utils";
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
    .select("display_name, username, anonymous_name, is_anonymous, onboarding_completed, preferred_guidance_path, selected_course_id")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const resolvedName = profile.is_anonymous ? profile.anonymous_name ?? "Friend" : profile.display_name ?? profile.username ?? "Friend";
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
        <div className="member-dashboard">
          <section className="member-panel member-empty-course">
            <p className="member-eyebrow">YOUR PERSONAL SPACE</p>
            <h1>Your next chapter is on its way.</h1>
            <p>There are no published courses available yet. In the meantime, make a little room for reflection.</p>
            <Link href="/journal/new" className="member-action member-action-forest">Open your journal</Link>
          </section>
        </div>
      </PageTransition>
    );
  }

  const course = activeCourseVersion.courses;
  const courseInfo = course?.[0] ?? null;
  const courseId = courseInfo?.id ?? activeCourseVersion.course_id ?? "";
  const courseTitle = getDisplayCourseTitle(courseInfo?.title ?? activeCourseVersion.title);
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

  const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const journalPromise = supabase
    .from("journal_entries")
    .select("id, title, body, created_at")
    .eq("user_id", user.id)
    .gte("created_at", weekAgoIso)
    .order("created_at", { ascending: false });

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

  const completedLessons = lessonList.filter((lesson) => completedLessonIds.has(lesson.id)).length;
  const totalLessons = lessonList.length;
  const hasStartedCourse =
    completedLessons > 0 ||
    progressList.filter((progress) => lessonList.some((lesson) => lesson.id === progress.lesson_id)).some(
      (progress) =>
        progress.status === "in_progress" ||
        progress.status === "completed" ||
        Boolean(progress.started_at) ||
        Boolean(progress.completed_at) ||
        Boolean(progress.last_opened_at)
    );
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

  const today = new Date();
  const dayDates = Array.from({ length: 7 }, (_, index) => new Date(today.getTime() - (6 - index) * 86_400_000));
  const weekDateKeys = new Set(dayDates.map((date) => toDateKey(date.toISOString())));
  const weeklyCompletions = (weeklyLessonProgress ?? []).filter((progress) => progress.completed_at && weekDateKeys.has(toDateKey(progress.completed_at)));
  const weeklyJournals = journalHistory.filter((entry) => weekDateKeys.has(toDateKey(entry.created_at)));
  const weeklyMoods = moodHistory.filter((entry) => weekDateKeys.has(toDateKey(entry.created_at)));
  const weeklyCompletedLessons = new Set(weeklyCompletions.map((progress) => progress.lesson_id)).size;
  const reflectionDays = new Set(weeklyJournals.map((entry) => toDateKey(entry.created_at))).size;
  const activeDateKeys = new Set([
    ...weeklyCompletions.map((progress) => toDateKey(progress.completed_at!)),
    ...weeklyJournals.map((entry) => toDateKey(entry.created_at)),
    ...weeklyMoods.map((entry) => toDateKey(entry.created_at)),
  ]);
  const days = dayDates.map((date, index) => ({
    date: toDateKey(date.toISOString()),
    label: new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "Africa/Johannesburg" }).format(date),
    active: activeDateKeys.has(toDateKey(date.toISOString())),
    isToday: index === 6,
  }));

  return (
    <PageTransition>
      <MemberDashboard
        greeting={greeting}
        userName={resolvedName}
        displayDate={new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Johannesburg" }).format(today)}
        course={{
          courseTitle,
          progressPercent,
          chaptersCompleted: completedChapters,
          totalChapters,
          lessonsCompleted: completedLessons,
          totalLessons,
          currentChapter: currentChapter?.title ?? "Current chapter",
          currentLessonTitle: currentLesson?.title ?? "Explore your course",
          currentLessonSubtitle: currentLesson?.subtitle ?? courseDescription,
          currentLessonMinutes: currentLesson?.estimated_minutes ?? null,
          currentLessonHref: currentLesson && currentChapter ? `/course/${courseId}/${currentChapter.id}/${currentLesson.id}` : "/course",
          hasStarted: hasStartedCourse,
        }}
        mood={{
          userId: user.id,
          latestMood,
          latestMoodAt,
          latestNote,
          moodHistory: weeklyMoods,
          todayCheckinId: todayCheckin?.id ?? null,
        }}
        weekly={{ lessons: weeklyCompletedLessons, reflectionDays, days }}
        reflections={reflections}
      />
    </PageTransition>
  );
}
