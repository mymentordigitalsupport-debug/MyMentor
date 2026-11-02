"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/ui/PageTransition";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getDisplayCourseVersionTitle } from "@/lib/course-library";
import { cn, formatDate, formatShortDate, truncate } from "@/lib/utils";
import { BotanicalSprig, CommunityTexture, PaperPin, PaperSurface, PaperTape } from "@/components/threads/ThreadPaper";
import {
  Award,
  ArrowRight,
  ArrowUp,
  BarChart3,
  BookMarked,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  Heart,
  Lock,
  MessageSquareQuote,
  NotebookPen,
  Play,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

export type CourseLesson = {
  id: string;
  title: string;
  description: string | null;
  estimated_minutes: number | null;
  sort_order: number;
  chapter_id: string;
};

export type CourseChapter = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  lessons: CourseLesson[];
  lessonsCompleted: number;
  lessonsTotal: number;
};

type JournalEntrySummary = {
  id: string;
  title: string | null;
  body: string;
  mood: string | null;
  created_at: string;
};

type MoodCheckinSummary = {
  mood: string;
  created_at: string;
};

type InsightSummary = {
  id: string;
  text: string;
  created_at: string;
};

type CourseProgressSummary = {
  course_version_id: string;
  started_at: string;
  completed_at: string | null;
  last_active_at: string;
};

type CourseTab = "overview" | "Chapters" | "lessons" | "insights" | "achievements";

type Achievement = {
  title: string;
  detail: string;
  unlocked: boolean;
  icon: typeof Award;
};

export interface CourseDashboardProps {
  courseId: string;
  courseTitle: string;
  courseDescription: string | null;
  courseVersionTitle: string;
  guidancePath: "religious" | "christian";
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  completedChapters: number;
  totalChapters: number;
  activeChapter: CourseChapter | null;
  activeLessonId: string | null;
  ChapterData: CourseChapter[];
  activeLessonHref: string;
  completedLessonIds: string[];
  courseProgress: CourseProgressSummary[];
  journalEntries: JournalEntrySummary[];
  moodCheckins: MoodCheckinSummary[];
  savedInsights: InsightSummary[];
}

const tabs: Array<{ id: CourseTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "Chapters", label: "Chapters" },
  { id: "lessons", label: "Lessons" },
  { id: "insights", label: "Insights" },
  { id: "achievements", label: "Achievements" },
];

function formatLessonCount(count: number) {
  return `${count} lesson${count === 1 ? "" : "s"}`;
}

function TabPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-profile-exempt
      onClick={onClick}
      className={cn(
        "member-course-tab rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-[#e5ddd0] bg-[#fbf9f5] font-medium text-text shadow-[0_10px_18px_-16px_rgba(31,42,36,0.22)]"
          : "border-transparent bg-transparent text-muted hover:bg-[#fbf9f5] hover:text-text"
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card variant="mist" padding="lg" className="text-center">
      <p className="text-3xl" aria-hidden="true">
        ∅
      </p>
      <p className="mt-3 font-medium text-text">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </Card>
  );
}

export function CourseDashboard({
  courseId,
  courseTitle,
  courseDescription,
  courseVersionTitle,
  progressPercent,
  completedLessons,
  totalLessons,
  completedChapters,
  totalChapters,
  activeChapter,
  ChapterData,
  activeLessonHref,
  activeLessonId,
  completedLessonIds,
  courseProgress,
  journalEntries,
  moodCheckins,
  savedInsights,
}: CourseDashboardProps) {
  const [activeTab, setActiveTab] = useState<CourseTab>("overview");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isBackToTopVisible = showBackToTop && activeTab === "Chapters";
  const chapterSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const summary = chapterSummaryRef.current;
    if (!summary) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | null = null;
    const reveal = () => {
      summary.dataset.summaryVisible = "true";
      observer?.disconnect();
      observer = null;
    };
    const watch = () => {
      if (motionPreference.matches || !("IntersectionObserver" in window)) { reveal(); return; }
      observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) reveal(); }, { threshold: .15, rootMargin: "0px 0px -5% 0px" });
      observer.observe(summary);
    };
    const onMotionChange = () => { if (motionPreference.matches) reveal(); };
    watch();
    motionPreference.addEventListener("change", onMotionChange);
    return () => { observer?.disconnect(); motionPreference.removeEventListener("change", onMotionChange); };
  }, []);

  useEffect(() => {
    const updateVisibility = () => setShowBackToTop(window.scrollY > 420);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const activeChapterLessons = activeChapter?.lessons ?? [];
  const activeChapterLessonsPreview = activeChapterLessons.slice(0, 4).map((lesson) => {
    return {
      ...lesson,
      completed: completedLessonIds.includes(lesson.id),
      current: lesson.id === activeLessonId,
      locked: lesson.id !== activeLessonId && !completedLessonIds.includes(lesson.id),
    };
  });

  const achievements: Achievement[] = [
    {
      title: "Course started",
      detail: courseProgress.length > 0 ? `Started on ${formatDate(courseProgress[0].started_at)}` : "No course started yet.",
      unlocked: courseProgress.length > 0,
      icon: Target,
    },
    {
      title: "First lesson completed",
      detail: "Complete any lesson to unlock this milestone.",
      unlocked: completedLessons > 0,
      icon: CheckCircle2,
    },
    {
      title: "Reflection saved",
      detail: "Save an insight during a Pause & Reflect moment.",
      unlocked: savedInsights.length > 0,
      icon: MessageSquareQuote,
    },
    {
      title: "Journal habit",
      detail: "Write your first journal entry.",
      unlocked: journalEntries.length > 0,
      icon: NotebookPen,
    },
    {
      title: "Mood awareness",
      detail: "Log how you are feeling in the mood check-in.",
      unlocked: moodCheckins.length > 0,
      icon: Heart,
    },
    {
      title: "Chapter momentum",
      detail: completedChapters > 0 ? `${completedChapters} Chapter${completedChapters === 1 ? "" : "s"} completed.` : "Complete a Chapter to unlock this.",
      unlocked: completedChapters > 0,
      icon: Trophy,
    },
  ];

  const recentJournalEntries = journalEntries.slice(0, 3);
  const recentInsights = savedInsights.slice(0, 4);
  const recentMoodCheckins = moodCheckins.slice(0, 5);
  const displayCourseVersionTitle = getDisplayCourseVersionTitle(courseTitle, courseVersionTitle);
  const textureId = `course-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <>
    <PageTransition>
      <div className="member-course-page" style={{ "--community-grain": `url(#${textureId}-grain)`, "--community-fibres": `url(#${textureId}-fibres)` } as CSSProperties}>
        <CommunityTexture id={textureId} />
        <div className="member-course-shell">
          <header className="member-course-heading"><div><p className="member-eyebrow">YOUR GUIDED PATH</p><h1>Your course<span>.</span></h1></div><span className="member-course-handwriting">one lesson at a time</span></header>
          <section className="member-course-hero">
            <div className="member-course-hero-copy"><p className="member-course-kicker"><span /> YOUR JOURNEY, YOUR PACE</p><h2>We transform<br /><em>together.</em></h2><p>{courseDescription || "Your transformation happens one lesson at a time. Stay consistent, stay honest, and keep moving forward."}</p><span className="member-course-version">{displayCourseVersionTitle}</span></div>
            <div className="member-course-next-wrap"><PaperSurface seed={46} warm /><PaperPin className="member-course-hero-pin" /><span className="member-course-note-label">PICK UP WHERE YOU LEFT OFF</span><span className="member-course-progress-label">{progressPercent}% complete</span><div className="member-course-progress-track"><span style={{ width: `${progressPercent}%` }} /></div><strong>{activeChapter?.title ?? courseTitle}</strong>{activeChapter?.description && <span className="member-course-chapter-preview">{activeChapter.description}</span>}<span className="member-course-next-lesson">Next: {activeChapterLessonsPreview.find((lesson) => lesson.id === activeLessonId)?.title ?? "Your next lesson is ready."}</span><Link className="member-course-continue" href={activeLessonHref}>{completedLessons ? "Continue learning" : "Start your first lesson"}<ArrowRight className="h-4 w-4" /></Link><BotanicalSprig className="member-course-sprig" /></div>
            <svg className="member-course-loose-thread" viewBox="0 0 160 100" aria-hidden="true"><path d="M2 62c50-83 65 67 110 10S141 8 158 32" /></svg>
            <div className="member-course-tear" aria-hidden="true"><svg viewBox="0 0 1200 70" preserveAspectRatio="none"><path d="m0 35 34-4 39 8 27-7 43-8 38 5 28-8 45-1 31-8 44 7 46 9 24-5 53 10 35-8 49 4 33-5 51 10 43-6 26 6 42-14 41-5 31 8 27-3 47 12 39-6 36 9 48-9 35 7 48-15 47 5 49-7 36 7 30-6 60 10v48H0Z" fill="#fffdf5" /><path d="m0 45 48-4 33 10 48-9 30 4 38-10 50 1 42-8 35 8 39 6 33-3 45 10 38-7 46 3 39-4 51 9 44-4 30 7 38-13 37-6 38 10 24-5 48 11 38-4 39 7 43-6 40 4 45-13 46 5 48-7 34 7 32-6 63 10v35H0Z" fill="#f6f3ed" /></svg></div>
          </section>

          <div className="member-course-stats">
            <div className="member-course-stat"><PaperSurface seed={10} /><PaperPin className="member-course-stat-pin" /><span>YOUR PROGRESS</span><strong>{progressPercent}<small>%</small></strong><i className="member-course-stat-line"><span style={{ width: `${progressPercent}%` }} /></i></div>
            <div className="member-course-stat"><PaperSurface seed={13} warm /><PaperTape className="member-course-stat-tape" /><span>LESSONS COMPLETE</span><strong>{completedLessons}<small> / {totalLessons}</small></strong><i>{completedLessons === 1 ? "A first brave step." : "Every step matters."}</i></div>
            <div className="member-course-stat"><PaperSurface seed={16} /><PaperPin className="member-course-stat-pin" /><span>CHAPTERS COMPLETE</span><strong>{completedChapters}<small> / {totalChapters}</small></strong><i>Keep your momentum.</i></div>
            <div className="member-course-stat"><PaperSurface seed={21} warm /><PaperTape className="member-course-stat-tape" /><span>COURSE</span><strong className="member-course-stat-title">{courseTitle}</strong><i>Made for your becoming.</i></div>
          </div>

          <section className="member-course-quote"><span>“</span><p>Small steps today create a different future.</p><i>— My Mentor</i></section>

        <div className="rounded-[26px] border border-[#e5ddd0] bg-[#fbf9f5] p-5 shadow-[0_16px_34px_-26px_rgba(31,42,36,0.16)] member-course-progress-card">
          <div className="grid gap-5 xl:grid-cols-[1.25fr_0.58fr_0.58fr_0.78fr_1fr]">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Current Course</p>
                  <div className="mt-3 flex items-center gap-3">
                    <h2 className="text-[1.15rem] font-medium tracking-[-0.03em] text-text">{courseTitle}</h2>
                  </div>
                </div>
                <span className="rounded-full border border-[#e5ddd0] bg-white px-3 py-1 text-[10px] font-semibold text-text">
                  {progressPercent}% Complete
                </span>
              </div>

              {courseDescription ? (
                <p className="text-sm leading-6 text-muted">{courseDescription}</p>
              ) : null}

              <div className="h-2 rounded-full bg-[#ebe5db]">
                <div className="h-2 rounded-full bg-[#7a9272]" style={{ width: `${progressPercent}%` }} />
              </div>

              <div className="flex items-center gap-3 text-sm text-muted">
                <span>
                  {completedLessons} / {totalLessons} lessons
                </span>
                <span>-</span>
                <span>
                  {completedChapters} / {totalChapters} Chapters
                </span>
              </div>
            </div>

            <div className="xl:border-l xl:border-[#e5ddd0] xl:pl-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Chapters</p>
              <p className="mt-3 text-[2rem] leading-none font-medium text-text">
                {completedChapters} <span className="text-[1rem] text-muted">/ {totalChapters}</span>
              </p>
              <p className="mt-3 text-sm text-muted">Complete</p>
            </div>

            <div className="xl:border-l xl:border-[#e5ddd0] xl:pl-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Lessons</p>
              <p className="mt-3 text-[2rem] leading-none font-medium text-text">
                {completedLessons} <span className="text-[1rem] text-muted">/ {totalLessons}</span>
              </p>
              <p className="mt-3 text-sm text-muted">Complete</p>
            </div>

            <div className="xl:border-l xl:border-[#e5ddd0] xl:pl-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Estimated Time</p>
              <p className="mt-3 text-[2rem] leading-none font-medium text-text">6 weeks</p>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                <Clock3 className="h-4 w-4" />
                Remaining
              </p>
            </div>

            <div className="xl:border-l xl:border-[#e5ddd0] xl:pl-5">
              <div className="flex items-start gap-3">
                <MessageSquareQuote className="mt-1 h-5 w-5 shrink-0 text-[#c9b9a1]" />
                <div className="space-y-3 text-[0.98rem] leading-7 text-text">
                  <p>Small steps today create a different future.</p>
                  <p className="text-muted">- My Mentor</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="member-course-tabs flex flex-wrap items-center gap-3">
          {tabs.map((tab) => (
            <TabPill key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </TabPill>
          ))}
        </div>

        <div className="member-course-content">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-5">
            <div className="rounded-[26px] border border-[#e5ddd0] bg-[#fbf9f5] p-5 shadow-[0_16px_34px_-26px_rgba(31,42,36,0.16)] member-course-overview-paper">
              <PaperSurface seed={57} /><PaperPin className="member-course-overview-pin" />
              <div className="member-course-overview-content">
              <div className="grid gap-5 xl:grid-cols-[1fr_300px] member-course-active-chapter-grid">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
                    {activeChapter ? `Chapter ${activeChapter.sort_order}` : "Chapter"}
                  </p>
                  <h2
                    className="mt-3 text-[1.7rem] leading-[1.05] tracking-[-0.04em] text-text"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {activeChapter?.title ?? "The Stage of Creation"}
                  </h2>
                  <p className="member-course-chapter-description mt-4 max-w-xl text-[0.98rem] leading-7 text-muted">
                    {activeChapter?.description ??
                      "Understand who you were created to be and how identity, purpose, and choices shape your life."}
                  </p>
                </div>

                <div className="member-course-chapter-note">
                  <PaperSurface seed={39} warm /><PaperTape />
                  <span>CHAPTER {activeChapter?.sort_order ?? "—"} PROGRESS</span><strong>{activeChapter?.lessonsCompleted ?? 0} / {activeChapter?.lessonsTotal ?? 0} lessons</strong><div className="member-course-chapter-track"><i style={{ width: `${activeChapter?.lessonsTotal ? Math.round((activeChapter.lessonsCompleted / activeChapter.lessonsTotal) * 100) : 0}%` }} /></div><p>Keep showing up for the next step.</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Lessons</p>
                <div className="mt-3 space-y-2">
                {activeChapterLessonsPreview.length > 0 ? (
                  activeChapterLessonsPreview.map((lesson) => {
                      const current = lesson.current;
                      const completed = lesson.completed;

                      if (current) {
                        return (
                          <div
                            key={lesson.id}
                            className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[#163127] bg-[#163127] px-4 py-4 text-[#fbf9f5]"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f271c] text-[#fbf9f5]">
                              <Play className="h-3.5 w-3.5 fill-current" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[0.98rem] font-medium text-[#fbf9f5]">{lesson.title}</p>
                              <p className="mt-1 flex items-center gap-2 text-[0.82rem] text-[#fbf9f5]/72">
                                <span className="h-2 w-2 rounded-full bg-[#8ea281]" />
                                In Progress
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[0.82rem] text-[#fbf9f5]/72">{lesson.estimated_minutes ?? 8} min</span>
                              <Link
                                href={activeLessonHref}
                                className="inline-flex items-center rounded-full bg-[#0f271c] px-5 py-2.5 text-[0.92rem] font-semibold text-[#fbf9f5] transition hover:bg-[#24352e]"
                              >
                                Continue
                              </Link>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={lesson.id}
                          href={`/course/${courseId}/${activeChapter?.id}/${lesson.id}`}
                          className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[#e5ddd0] bg-[#fffdf9] px-4 py-4 transition hover:bg-[#f8f5ef]"
                        >
                          <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", completed ? "bg-[#8ea281] text-[#fbf9f5]" : "bg-[#f3eee7] text-muted")}>
                            {completed ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                          </span>
                          <div className="min-w-0">
                            <p className={cn("truncate text-[0.98rem] font-medium", completed && "text-muted line-through")}>
                              {lesson.title}
                            </p>
                            {lesson.description ? <p className="mt-1 text-[0.82rem] text-muted">{lesson.description}</p> : null}
                          </div>
                          <div className="flex items-center gap-3 text-[0.82rem] text-muted">
                            <span>{lesson.estimated_minutes ?? 8} min</span>
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e5ddd0] bg-white text-muted">
                              {completed ? <FileText className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                            </span>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="rounded-[18px] border border-[#e5ddd0] bg-[#fffdf9] px-4 py-4 text-sm text-muted">
                      No lessons found for this Chapter.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("insights")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e5ddd0] bg-[#fbf9f5] px-5 py-3 text-[0.95rem] font-medium text-text transition hover:bg-[#f7f3eb]"
                >
                  <BarChart3 className="h-4 w-4" />
                  View Chapter insights
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("lessons")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e5ddd0] bg-[#fbf9f5] px-5 py-3 text-[0.95rem] font-medium text-text transition hover:bg-[#f7f3eb]"
                >
                  <BookMarked className="h-4 w-4" />
                  View all lessons
                </button>
              </div>
            </div>
              </div>
          </div>
        )}

        {activeTab === "Chapters" && (
          <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr] member-course-chapters-layout">
            <Card variant="default" padding="md" className="member-course-chapters-list">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Chapter Catalog</p>
                  <h2 className="mt-2 text-xl font-semibold text-text">All Chapters</h2>
                </div>
                <Badge variant="sage">{ChapterData.length} total</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {ChapterData.map((Chapter) => {
                  const complete = Chapter.lessonsTotal > 0 && Chapter.lessonsCompleted === Chapter.lessonsTotal;
                  const lessonPreview = Chapter.lessons.slice(0, 3);
                  return (
                    <Link key={Chapter.id} href={`/course/${courseId}/${Chapter.id}`}>
                      <div className="rounded-2xl border border-mist bg-cream p-4 hover:border-sage/40 hover:shadow-sm transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text">{Chapter.title}</p>
                            {Chapter.description ? <p className="member-course-chapter-catalog-description mt-1 text-xs leading-5 text-muted">{Chapter.description}</p> : null}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                                {formatLessonCount(Chapter.lessonsTotal)}
                              </span>
                              {lessonPreview.map((lesson) => (
                                <span
                                  key={lesson.id}
                                  className="rounded-full border border-[#e5ddd0] bg-[#fffdf9] px-2.5 py-1 text-[10px] text-muted"
                                >
                                  {lesson.title}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", complete ? "bg-sage/15 text-forest" : "bg-mist text-muted")}>
                            {Chapter.lessonsCompleted}/{Chapter.lessonsTotal}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>

            <div ref={chapterSummaryRef} className="member-course-sticky-summary-shell" data-summary-visible="false">
            <Card variant="mist" padding="md" className="member-course-sticky-summary-card">
              <PaperSurface seed={82} warm /><PaperPin className="member-course-summary-pin" />
              <div className="member-course-summary-content">
              <p className="member-course-summary-eyebrow"><Sparkles size={13} /> CHAPTER SUMMARY</p>
              <h3 className="member-course-summary-title">{activeChapter?.title ?? "No active Chapter"}</h3>
              {activeChapter?.description ? (
                <p className="member-course-summary-description">{activeChapter.description}</p>
              ) : (
                <p className="member-course-summary-description">This view shows the active chapter and its lesson progress.</p>
              )}
              <div className="member-course-summary-progress"><span>COURSE JOURNEY</span><strong>{progressPercent}%</strong><i><span style={{ width: `${progressPercent}%` }} /></i></div>
              <div className="mt-4 space-y-2 text-sm text-text member-course-summary-items">
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <span>Published Chapters</span>
                  <span className="font-medium">{totalChapters}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <span>Completed Chapters</span>
                  <span className="font-medium">{completedChapters}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <span>Completion</span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <span>Lessons in this Chapter</span>
                  <span className="font-medium">{activeChapter?.lessonsTotal ?? 0}</span>
                </div>
              </div>
              </div>
              <BotanicalSprig className="member-course-summary-sprig" />
            </Card>
            </div>
          </div>
        )}

        {activeTab === "lessons" && (
          <div className="grid gap-5">
            {ChapterData.length > 0 ? (
              ChapterData.map((Chapter) => (
                <Card key={Chapter.id} variant="default" padding="md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Chapter {Chapter.sort_order}</p>
                      <h3 className="mt-2 text-lg font-semibold text-text">{Chapter.title}</h3>
                      {Chapter.description ? <p className="mt-1 text-sm leading-6 text-muted">{Chapter.description}</p> : null}
                    </div>
                    <Badge variant={Chapter.lessonsTotal > 0 && Chapter.lessonsCompleted === Chapter.lessonsTotal ? "sage" : "muted"}>
                      {Chapter.lessonsCompleted}/{Chapter.lessonsTotal}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    {Chapter.lessons.length > 0 ? (
                      Chapter.lessons.map((lesson) => (
                        <Link key={lesson.id} href={`/course/${courseId}/${Chapter.id}/${lesson.id}`}>
                          <div className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[#e5ddd0] bg-[#fffdf9] px-4 py-4 transition hover:bg-[#f8f5ef]">
                            <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", completedLessonIds.includes(lesson.id) ? "bg-sage text-cream" : "bg-[#f3eee7] text-muted")}>
                              {completedLessonIds.includes(lesson.id) ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[0.98rem] font-medium text-text">
                                Lesson {lesson.sort_order}: {lesson.title}
                              </p>
                              {lesson.description ? <p className="mt-1 text-[0.82rem] text-muted">{lesson.description}</p> : null}
                            </div>
                            <span className="text-[0.82rem] text-muted">{lesson.estimated_minutes ?? 8} min</span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-[18px] border border-[#e5ddd0] bg-[#fffdf9] px-4 py-4 text-sm text-muted">
                        No lessons found for this Chapter.
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState title="No lessons yet" body="Add published lessons to show them here." />
            )}
          </div>
        )}

        {activeTab === "insights" && (
          <div className="grid gap-5 lg:grid-cols-3">
            <Card variant="default" padding="md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Saved Insights</p>
              <div className="mt-4 space-y-3">
                {recentInsights.length > 0 ? (
                  recentInsights.map((insight) => (
                    <div key={insight.id} className="rounded-2xl border border-mist bg-cream p-4">
                      <p className="text-sm leading-6 text-text">{insight.text}</p>
                      <p className="mt-2 text-[11px] text-muted">{formatShortDate(insight.created_at)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No saved insights yet.</p>
                )}
              </div>
            </Card>

            <Card variant="default" padding="md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Journal Entries</p>
              <div className="mt-4 space-y-3">
                {recentJournalEntries.length > 0 ? (
                  recentJournalEntries.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-mist bg-cream p-4">
                      <p className="text-sm font-medium text-text">{entry.title ?? "Journal Entry"}</p>
                      <p className="mt-1 text-sm leading-6 text-muted">{truncate(entry.body, 120)}</p>
                      <p className="mt-2 text-[11px] text-muted">{formatShortDate(entry.created_at)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No journal entries yet.</p>
                )}
              </div>
            </Card>

            <Card variant="default" padding="md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Mood Check-ins</p>
              <div className="mt-4 space-y-3">
                {recentMoodCheckins.length > 0 ? (
                  recentMoodCheckins.map((checkin, index) => (
                    <div key={`${checkin.created_at}-${index}`} className="rounded-2xl border border-mist bg-cream p-4">
                      <p className="text-sm font-medium text-text capitalize">{checkin.mood}</p>
                      <p className="mt-2 text-[11px] text-muted">{formatShortDate(checkin.created_at)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No mood check-ins yet.</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <Card variant="gold" padding="md">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-forest" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Achievements</p>
                  <h2 className="mt-1 text-lg font-semibold text-text">Milestones from your progress</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.title}
                      className={cn(
                        "rounded-2xl border p-4",
                        achievement.unlocked ? "border-sage/20 bg-white" : "border-mist bg-[#fffdf9]"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                            achievement.unlocked ? "bg-sage/15 text-forest" : "bg-mist text-muted"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-text">{achievement.title}</p>
                          <p className="mt-1 text-xs leading-5 text-muted">{achievement.detail}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card variant="mist" padding="md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Progress Snapshot</p>
              <div className="mt-4 space-y-2 text-sm text-text">
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <span>Lessons completed</span>
                  <span className="font-medium">{completedLessons}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <span>Chapters completed</span>
                  <span className="font-medium">{completedChapters}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <span>Insights saved</span>
                  <span className="font-medium">{savedInsights.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <span>Journal entries</span>
                  <span className="font-medium">{journalEntries.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <span>Mood check-ins</span>
                  <span className="font-medium">{moodCheckins.length}</span>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-[#e5ddd0] bg-[#fbf9f5] p-4 text-sm text-muted">
                Achievements here are derived from existing tables. If you want a separate achievements table later, we can add one, but it is not required for the current UI.
              </div>
            </Card>
          </div>
        )}
        </div>
        </div>
      </div>
    </PageTransition>
    <button
      type="button"
      className="member-course-back-to-top"
      data-visible={isBackToTopVisible}
      aria-hidden={!isBackToTopVisible}
      tabIndex={isBackToTopVisible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
    >
      <ArrowUp size={17} aria-hidden="true" /><span>Back to top</span>
    </button>
    </>
  );
}
