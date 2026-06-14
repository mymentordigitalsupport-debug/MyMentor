"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageTransition } from "@/components/ui/PageTransition";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn, formatDate, formatShortDate, truncate } from "@/lib/utils";
import {
  Award,
  BarChart3,
  BookMarked,
  CheckCircle2,
  ChevronDown,
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
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition",
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
  guidancePath,
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

  return (
    <PageTransition>
      <div className="flex flex-col gap-5 py-5">
        <div className="overflow-hidden rounded-[30px] border border-[#e5ddd0] bg-[#fbf9f5] shadow-[0_18px_42px_-28px_rgba(31,42,36,0.18)]">
          <div className="grid min-h-[280px] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative z-10 px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
              <p className="text-[0.95rem] text-muted">
                Course <span className="inline-block -translate-y-px">{'>'}</span>
              </p>
              <h1
                className="mt-7 text-[clamp(2.6rem,4vw,4.6rem)] leading-[0.96] tracking-[-0.05em] text-forest"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                My Course
              </h1>
              <p className="mt-6 max-w-2xl text-[1rem] leading-7 text-muted">
                Your transformation happens one lesson at a time.
                <br />
                Stay consistent, stay honest, keep moving forward.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <Badge variant={guidancePath === "christian" ? "gold" : "sage"}>
                  {guidancePath === "christian" ? "Christian Guidance" : "Religious Guidance"}
                </Badge>
                <Badge variant="muted">{courseVersionTitle}</Badge>
              </div>
            </div>

            <div className="relative min-h-[240px]">
              <Image
                src="/assets/images/login-bg.png"
                alt=""
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,249,245,0.98)_0%,rgba(251,249,245,0.7)_26%,rgba(251,249,245,0.22)_62%,rgba(251,249,245,0)_100%)]" />
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-[#e5ddd0] bg-[#fbf9f5] p-5 shadow-[0_16px_34px_-26px_rgba(31,42,36,0.16)]">
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
                <div className="h-2 rounded-full bg-[#7a9272]" style={{ width: `${Math.max(progressPercent, 12)}%` }} />
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

        <div className="flex flex-wrap items-center gap-3">
          {tabs.map((tab) => (
            <TabPill key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </TabPill>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[26px] border border-[#e5ddd0] bg-[#fbf9f5] p-5 shadow-[0_16px_34px_-26px_rgba(31,42,36,0.16)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Chapters</p>
              <div className="mt-4 space-y-3">
                {ChapterData.slice(0, 5).map((Chapter, index) => {
                  const complete = Chapter.lessonsTotal > 0 && Chapter.lessonsCompleted === Chapter.lessonsTotal;
                  const active = activeChapter?.id === Chapter.id;
                  const locked = !active && !complete && index > 0;

                  return (
                    <Link
                      key={Chapter.id}
                      href={`/course/${courseId}/${Chapter.id}`}
                      className={cn(
                        "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 transition",
                        active
                          ? "border-[#b9caa8] bg-[#eef4e7]"
                          : "border-[#e5ddd0] bg-[#fffdf9] hover:bg-[#f8f5ef]"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[0.95rem] font-medium",
                            active
                              ? "bg-[#4f6757] text-[#fbf9f5]"
                              : complete
                                ? "bg-[#163127] text-[#fbf9f5]"
                                : "bg-[#f3eee7] text-muted"
                          )}
                        >
                          {Chapter.sort_order}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[0.98rem] font-medium text-text">{Chapter.title}</p>
                          <p className="mt-0.5 text-[0.82rem] text-muted">
                            {Chapter.lessonsCompleted} / {Chapter.lessonsTotal} Lessons Completed
                          </p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                          complete
                            ? "border-[#8ea281] text-[#8ea281]"
                            : active
                              ? "border-[#8ea281] text-[#8ea281]"
                              : locked
                                ? "border-[#d8d2c6] text-[#d8d2c6]"
                                : "border-[#8ea281] text-[#8ea281]"
                        )}
                      >
                        {complete ? (
                          <CheckCircle2 className="h-[17px] w-[17px]" />
                        ) : locked ? (
                          <Lock className="h-[15px] w-[15px]" />
                        ) : (
                          <Circle className="h-[15px] w-[15px]" />
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <button
                type="button"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#e5ddd0] bg-[#fbf9f5] px-5 py-3 text-[0.95rem] font-medium text-text transition hover:bg-[#f7f3eb]"
              >
                View all {totalChapters} Chapters
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-[26px] border border-[#e5ddd0] bg-[#fbf9f5] p-5 shadow-[0_16px_34px_-26px_rgba(31,42,36,0.16)]">
              <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
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
                  <p className="mt-4 max-w-xl text-[0.98rem] leading-7 text-muted">
                    {activeChapter?.description ??
                      "Understand who you were created to be and how identity, purpose, and choices shape your life."}
                  </p>
                </div>

                <div className="relative min-h-[150px] overflow-hidden rounded-[22px]">
                  <Image src="/assets/images/login-bg.png" alt="" fill className="object-cover object-center" />
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
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e5ddd0] bg-[#fbf9f5] px-5 py-3 text-[0.95rem] font-medium text-text transition hover:bg-[#f7f3eb]"
                >
                  <BarChart3 className="h-4 w-4" />
                  View Chapter insights
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e5ddd0] bg-[#fbf9f5] px-5 py-3 text-[0.95rem] font-medium text-text transition hover:bg-[#f7f3eb]"
                >
                  <BookMarked className="h-4 w-4" />
                  Download Chapter Guide
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Chapters" && (
          <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <Card variant="default" padding="md">
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
                  return (
                    <Link key={Chapter.id} href={`/course/${courseId}/${Chapter.id}`}>
                      <div className="rounded-2xl border border-mist bg-cream p-4 hover:border-sage/40 hover:shadow-sm transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text">{Chapter.title}</p>
                            {Chapter.description ? <p className="mt-1 text-xs leading-5 text-muted">{Chapter.description}</p> : null}
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

            <Card variant="mist" padding="md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Chapter Summary</p>
              <h3 className="mt-2 text-lg font-semibold text-text">{activeChapter?.title ?? "No active Chapter"}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                The Chapter list is powered by `Chapters`, and each Chapter is linked to its lessons via `lessons`.
              </p>
              <div className="mt-4 space-y-2 text-sm text-text">
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
              </div>
            </Card>
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
                              <p className="truncate text-[0.98rem] font-medium text-text">{lesson.title}</p>
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
            <Card variant="sage" padding="md" className="lg:col-span-3">
              <div className="flex flex-wrap items-center gap-3">
                <Sparkles className="h-5 w-5 text-forest" />
                <p className="text-sm font-medium text-forest">
                  Insights are derived from `saved_insights`, `journal_entries`, and `mood_checkins`.
                </p>
              </div>
            </Card>

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
    </PageTransition>
  );
}


