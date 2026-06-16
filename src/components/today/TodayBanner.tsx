"use client";

import { ChevronLeft, ChevronRight, MessageSquareQuote, SunMedium } from "lucide-react";
import { useState } from "react";
import { type MoodValue } from "@/types";

interface TodayBannerProps {
  greeting: string;
  userName: string;
  latestMood: MoodValue | null;
  course: {
    courseTitle: string;
    progressPercent: number;
    chaptersCompleted: number;
    totalChapters: number;
    lessonsCompleted: number;
    totalLessons: number;
    currentChapter: string;
    currentLessonTitle: string;
    currentLessonSubtitle: string | null;
    currentLessonMinutes: number | null;
    currentLessonHref: string;
  };
}

const slideText = [
  "One honest step is enough for today.",
  "Your progress is real, even when it feels slow.",
] as const;

export function TodayBanner({ greeting, userName, latestMood, course }: TodayBannerProps) {
  const [slideIndex, setSlideIndex] = useState(0);

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[32px] border border-[#d7ccbc] bg-[#20362d] shadow-[0_24px_60px_-36px_rgba(20,28,24,0.42)]">
        <div className="relative grid min-h-[300px] lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(199,168,109,0.18),transparent_34%)]" />
            <div className="absolute -left-10 top-10 h-36 w-36 rounded-full bg-[#7a9272]/18 blur-3xl" />
            <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-[#c7a86d]/10 blur-3xl" />
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3 text-[#fbf9f5]/92">
                <SunMedium className="h-6 w-6" />
                <p className="text-[1rem] font-medium tracking-[-0.02em]">
                  {greeting}, {userName}
                </p>
              </div>

              <h1
                className="mt-5 max-w-2xl text-[clamp(2.5rem,4.6vw,4.5rem)] leading-[0.94] tracking-[-0.07em] text-[#fbf9f5]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Your next step is ready when you are.
              </h1>

              <p className="mt-5 max-w-xl text-[19px] leading-8 text-[#fbf9f5]/84 sm:text-[21px]">
                {course.courseTitle}.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2.5 text-[13px] text-[#fbf9f5]/86">
                  <MessageSquareQuote className="h-4 w-4" />
                  {slideText[slideIndex]}
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-end justify-end p-6 sm:p-8">
            <div className="relative w-full max-w-[350px] overflow-hidden rounded-[28px] border border-white/10 bg-[#fbf9f5]/8 p-5 backdrop-blur-sm">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.04)_100%)]" />
              <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-between">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="relative -top-[10px] rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fbf9f5]">
                      Today
                    </span>
                    <p className="mb-[7px] text-[11px] font-medium uppercase tracking-[0.22em] text-[#fbf9f5]/58">
                      Chapter 1 - The Stage of Creation
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2
                    className="text-[1.35rem] leading-[1.08] tracking-[-0.04em] text-[#fbf9f5]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {course.currentLessonTitle}
                  </h2>
                  <p className="text-sm leading-[19px] text-[#fbf9f5]/80">
                    {course.currentLessonSubtitle ?? "Continue from where you left off."}
                  </p>
                </div>

                <div className="relative top-[8px] rounded-[22px] border border-white/10 bg-white/7 p-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#fbf9f5]/56">Progress</p>
                      <p className="mt-1 text-[1.2rem] font-semibold text-[#fbf9f5]">
                        {course.progressPercent}%
                      </p>
                    </div>
                    <div className="h-2 flex-1 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-[#c7a86d]"
                        style={{ width: `${Math.max(course.progressPercent, 12)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="relative overflow-hidden rounded-[26px] border border-[#e5ddd0] bg-[#fbf9f5] p-5 shadow-[0_14px_30px_-24px_rgba(31,42,36,0.18)]">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-sage/10 blur-2xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Lessons complete</p>
          <p className="mt-4 text-[2.1rem] leading-none font-semibold text-text">
            {course.lessonsCompleted}
          </p>
          <p className="mt-2 text-sm text-muted">of {course.totalLessons}</p>
        </div>
        <div className="relative overflow-hidden rounded-[26px] border border-[#e5ddd0] bg-[#fbf9f5] p-5 shadow-[0_14px_30px_-24px_rgba(31,42,36,0.18)]">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-gold/12 blur-2xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Chapters complete</p>
          <p className="mt-4 text-[2.1rem] leading-none font-semibold text-text">
            {course.chaptersCompleted}
          </p>
          <p className="mt-2 text-sm text-muted">of {course.totalChapters}</p>
        </div>
        <div className="relative overflow-hidden rounded-[26px] border border-[#e5ddd0] bg-[#fbf9f5] p-5 shadow-[0_14px_30px_-24px_rgba(31,42,36,0.18)]">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-forest/10 blur-2xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Current lesson</p>
          <p className="mt-4 text-[1.4rem] leading-tight font-semibold text-text">
            {course.currentLessonMinutes ?? 8} min
          </p>
          <p className="mt-2 text-sm text-muted">{course.currentChapter}</p>
        </div>
        <div className="relative overflow-hidden rounded-[26px] border border-[#e5ddd0] bg-[#fbf9f5] p-5 shadow-[0_14px_30px_-24px_rgba(31,42,36,0.18)]">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-sage/10 blur-2xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Mood</p>
          <p className="mt-4 text-[1.4rem] leading-tight font-semibold text-text capitalize">
            {latestMood ?? "not logged"}
          </p>
          <p className="mt-2 text-sm text-muted">Last check-in</p>
        </div>
      </div>
    </section>
  );
}

