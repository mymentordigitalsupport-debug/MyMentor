import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  CourseDashboard,
  type CourseChapter,
} from "@/components/course/CourseDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Course",
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
    status: string | null;
  }>;
};

type CourseProgressRow = {
  course_version_id: string;
  started_at: string;
  completed_at: string | null;
  last_active_at: string;
};

type CourseEnrollmentRow = {
  course_version_id: string;
  started_at: string | null;
  completed_at: string | null;
  status: string | null;
};

type JournalEntryRow = {
  id: string;
  title: string | null;
  body: string;
  mood: string | null;
  created_at: string;
};

type LessonRow = {
  id: string;
  title: string;
  subtitle: string | null;
  estimated_minutes: number | null;
  sort_order: number;
  chapter_id: string;
};

type MoodCheckinRow = {
  mood: string;
  created_at: string;
};

type InsightRow = {
  id: string;
  text: string;
  created_at: string;
};

export default async function CoursePage() {
  const courseStartedAt = Date.now();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profilePromise = supabase
    .from("profiles")
    .select("preferred_guidance_path, selected_course_id")
    .eq("id", user.id)
    .single();

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

  const { data: profile } = await profilePromise;

  const profileGuidancePath = profile?.preferred_guidance_path as string | null;
  const guidancePath =
    profileGuidancePath === "general"
      ? "religious"
      : ((profileGuidancePath as "christian" | "religious" | null) ?? "religious");
  const courseVersionSelect =
    "id, guidance_path, title, description, course_id, courses(id, title, description, status)";

  const courseProgressStartedAt = Date.now();
  const [{ data: recentCourseProgress }, { data: recentEnrollments }, { data: guidedCourseVersions }] = await Promise.all([
    recentCourseProgressPromise,
    recentEnrollmentPromise,
    supabase
      .from("course_versions")
      .select(courseVersionSelect)
      .eq("guidance_path", guidancePath)
      .eq("course_id", profile?.selected_course_id ?? ""),
  ]);
  if (process.env.NODE_ENV !== "production") {
    console.info("[Course] loaded course progress and versions", Date.now() - courseProgressStartedAt, "ms");
  }

  const enrollmentList = (recentEnrollments ?? []) as CourseEnrollmentRow[];
  const selectedCourseId = profile?.selected_course_id ?? null;
  const recentCourseVersionId = recentCourseProgress?.[0]?.course_version_id ?? enrollmentList[0]?.course_version_id ?? null;

  const guidedCourseVersionList = (guidedCourseVersions ?? []) as CourseVersionRow[];
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
      <div className="py-8">
        <div className="rounded-[28px] border border-[#e5ddd0] bg-[#fbf9f5] p-8 text-center shadow-[0_18px_40px_-28px_rgba(31,42,36,0.18)]">
          <p className="mt-3 text-sm text-muted">No Course is available yet.</p>
        </div>
      </div>
    );
  }

  const course = activeCourseVersion.courses?.[0] ?? null;
  const courseId = course?.id ?? activeCourseVersion.course_id ?? "";
  const courseTitle = course?.title ?? activeCourseVersion.title;
  const courseDescription = course?.description ?? activeCourseVersion.description;
  const courseVersionTitle = activeCourseVersion.title;

  const { data: Chapters } = await supabase
    .from("chapters")
    .select("id, title, description, sort_order")
    .eq("course_version_id", activeCourseVersion.id)
    .eq("is_published", true)
    .order("sort_order");

  const { data: lessonProgress } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id, completed_at")
    .eq("user_id", user.id);

  const completedLessonIds = lessonProgress?.filter((lesson) => lesson.completed_at).map((lesson) => lesson.lesson_id) ?? [];

  const ChapterIds = (Chapters ?? []).map((Chapter) => Chapter.id);
  const lessonsStartedAt = Date.now();
  const { data: allLessons, error: allLessonsError } = ChapterIds.length
    ? await supabase
        .from("lessons")
        .select("id, title, subtitle, estimated_minutes, sort_order, chapter_id")
        .in("chapter_id", ChapterIds)
        .eq("is_published", true)
        .order("sort_order")
    : { data: [], error: null };

  if (allLessonsError) {
    console.error("Course lessons query failed", {
      ChapterIds,
      error: allLessonsError,
    });
    throw new Error("Failed to load lessons for this Course");
  }
  if (process.env.NODE_ENV !== "production") {
    console.info("[Course] loaded all lessons", Date.now() - lessonsStartedAt, "ms");
  }

  const lessonsByChapter = new Map<string, LessonRow[]>();
  (allLessons ?? []).forEach((lesson) => {
    const lessons = lessonsByChapter.get(lesson.chapter_id) ?? [];
    lessons.push(lesson as LessonRow);
    lessonsByChapter.set(lesson.chapter_id, lessons);
  });

  const ChapterResults = (Chapters ?? []).map((Chapter) => {
    const lessonsForChapter = lessonsByChapter.get(Chapter.id) ?? [];
    const lessonsTotal = lessonsForChapter.length;
    const lessonsCompleted = lessonsForChapter.filter((lesson) => completedLessonIds.includes(lesson.id)).length;

    return {
      ...Chapter,
      lessons: lessonsForChapter.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.subtitle,
        estimated_minutes: lesson.estimated_minutes,
        sort_order: lesson.sort_order,
        chapter_id: lesson.chapter_id,
      })),
      lessonsCompleted,
      lessonsTotal,
    };
  });

  const ChapterData: CourseChapter[] = ChapterResults;

  const completedLessons = completedLessonIds.length;
  const completedChapters = ChapterData.filter(
    (Chapter) => Chapter.lessonsTotal > 0 && Chapter.lessonsCompleted === Chapter.lessonsTotal
  ).length;
  const totalLessons = ChapterData.reduce((sum, Chapter) => sum + Chapter.lessonsTotal, 0);
  const totalChapters = ChapterData.length;
  const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0;

  const activeChapter =
    ChapterData.find((Chapter) => Chapter.lessonsTotal > 0 && Chapter.lessonsCompleted < Chapter.lessonsTotal) ??
    ChapterData[0] ??
    null;

  const activeChapterLessons = activeChapter?.lessons ?? [];
  const activeLesson =
    activeChapterLessons.find((lesson) => !completedLessonIds.includes(lesson.id)) ?? activeChapterLessons[0] ?? null;
  const activeLessonHref = activeLesson ? `/course/${courseId}/${activeChapter?.id}/${activeLesson.id}` : "#";

  const [{ data: journalEntries }, { data: moodCheckins }, { data: savedInsights }] = await Promise.all([
    supabase
      .from("journal_entries")
      .select("id, title, body, mood, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("mood_checkins")
      .select("mood, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("saved_insights")
      .select("id, text, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  if (process.env.NODE_ENV !== "production") {
    console.info("[Course] route complete", Date.now() - courseStartedAt, "ms");
  }

  return (
    <CourseDashboard
      courseId={courseId}
      courseTitle={courseTitle}
      courseDescription={courseDescription}
      courseVersionTitle={courseVersionTitle}
      guidancePath={guidancePath}
      progressPercent={progressPercent}
      completedLessons={completedLessons}
      totalLessons={totalLessons}
      completedChapters={completedChapters}
      totalChapters={totalChapters}
      activeChapter={activeChapter}
      activeLessonId={activeLesson?.id ?? null}
      ChapterData={ChapterData}
      activeLessonHref={activeLessonHref}
      completedLessonIds={completedLessonIds}
      courseProgress={(recentCourseProgress ?? []) as CourseProgressRow[]}
      journalEntries={(journalEntries ?? []) as JournalEntryRow[]}
      moodCheckins={(moodCheckins ?? []) as MoodCheckinRow[]}
      savedInsights={(savedInsights ?? []) as InsightRow[]}
    />
  );
}



