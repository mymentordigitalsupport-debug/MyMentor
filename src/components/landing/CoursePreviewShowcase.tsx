"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown, Clock3, Layers3, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/Button";

type CoursePreview = {
  title: string;
  description: string;
  number: string;
  accent: "forest" | "gold" | "sage";
  audience: string;
  chapters: number;
  lessons: number;
  duration: string;
  summary: string;
  chapterTitles: string[];
  sampleLessons: string[];
};

const courses: CoursePreview[] = [
  {
    title: "Uprooting Drug Abuse",
    description:
      "A biblical and practical framework for understanding addiction, breaking bondage, and restoring people.",
    number: "01",
    accent: "forest",
    audience: "People who want a full recovery journey",
    chapters: 11,
    lessons: 87,
    duration: "Deep, full-length course",
    summary:
      "The flagship pathway. It starts at identity and brokenness, then moves through addiction roots, distorted thinking, spiritual conflict, recovery habits, and restored purpose.",
    chapterTitles: [
      "The Stage of Creation",
      "The Tree of Knowledge of Good and Evil",
      "The Concept of Abuse",
      "The Real Reason People Do Drugs",
      "The Three Stages of Drug Abuse",
      "The Mind Battlefield",
      "Love",
    ],
    sampleLessons: [
      "Understanding Creation and Purpose",
      "The Search for Relief",
      "Recognizing Your Current Stage",
      "Long-Term Mental Recovery",
    ],
  },
  {
    title: "Protecting the Next Generation",
    description:
      "A family-centered journey that helps adults build safer homes and stronger futures for children.",
    number: "02",
    accent: "gold",
    audience: "Parents, caregivers, and guardians",
    chapters: 3,
    lessons: 15,
    duration: "Short, practical course",
    summary:
      "A prevention-focused course that helps adults understand risk, spot social influence early, and build strong household habits that protect teenagers before crisis begins.",
    chapterTitles: [
      "Understanding the Risk",
      "Social Influences and Exposure",
      "Prevention at Home",
    ],
    sampleLessons: [
      "Why Prevention Matters",
      "Peer Influence and Social Belonging",
      "Respect, Boundaries, and Discipline",
      "Creating a Healthy Protective Home",
    ],
  },
  {
    title: "From Addicts to Leaders",
    description:
      "A leadership pathway for moving from destruction to responsibility, character, and service.",
    number: "03",
    accent: "sage",
    audience: "People ready to rebuild life with purpose",
    chapters: 3,
    lessons: 21,
    duration: "Medium-depth transformation course",
    summary:
      "This course picks up where survival ends. It focuses on leadership, inner change, responsibility, family restoration, and becoming someone who can rebuild trust and serve others well.",
    chapterTitles: [
      "Leadership and Recovery",
      "The Individual and Inner Change",
      "Family, Restoration, and Social Renewal",
    ],
    sampleLessons: [
      "Why Recovery Needs Leadership",
      "Discovering Purpose",
      "Understanding Addictive Behavior",
      "Rebuilding Trust and Relationships",
    ],
  },
];

function accentClasses(accent: CoursePreview["accent"]) {
  switch (accent) {
    case "gold":
      return {
        halo: "bg-gold/18",
        border: "border-gold/35",
        chip: "border border-gold/30 bg-gold/12 text-forest",
        ghost: "text-gold/18",
        previewHeader:
          "border-gold/35 bg-[linear-gradient(90deg,rgba(199,168,109,0.26)_0%,rgba(199,168,109,0.12)_42%,rgba(251,249,245,0.98)_100%)]",
        previewKicker: "text-forest",
        previewBadge: "border-gold/35 bg-[#f8edd6] text-forest",
        previewToggle: "border-gold/35 bg-[#f6e5be] text-forest",
      };
    case "sage":
      return {
        halo: "bg-sage/18",
        border: "border-sage/35",
        chip: "border border-sage/30 bg-sage/12 text-forest",
        ghost: "text-sage/18",
        previewHeader:
          "border-sage/35 bg-[linear-gradient(90deg,rgba(122,146,114,0.24)_0%,rgba(122,146,114,0.1)_42%,rgba(251,249,245,0.98)_100%)]",
        previewKicker: "text-forest",
        previewBadge: "border-sage/35 bg-[#e6efe2] text-forest",
        previewToggle: "border-sage/35 bg-[#d9e7d3] text-forest",
      };
    default:
      return {
        halo: "bg-forest/10",
        border: "border-forest/20",
        chip: "border border-forest/15 bg-forest/8 text-forest",
        ghost: "text-forest/10",
        previewHeader:
          "border-forest/20 bg-[linear-gradient(90deg,rgba(50,69,59,0.18)_0%,rgba(50,69,59,0.08)_42%,rgba(251,249,245,0.98)_100%)]",
        previewKicker: "text-forest",
        previewBadge: "border-forest/20 bg-[#edf1ee] text-forest",
        previewToggle: "border-forest/25 bg-[#dde4df] text-forest",
      };
  }
}

export function CoursePreviewShowcase() {
  const [selectedTitle, setSelectedTitle] = useState(courses[0].title);
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedCourse =
    courses.find((course) => course.title === selectedTitle) ?? courses[0];
  const accent = accentClasses(selectedCourse.accent);

  return (
    <div className="mt-10 space-y-5">
      <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
        {courses.map((course) => {
          const selected = course.title === selectedCourse.title;
          const courseAccent = accentClasses(course.accent);

          return (
            <button
              key={course.title}
              type="button"
              onClick={() => {
                if (course.title === selectedTitle) {
                  setIsExpanded((current) => !current);
                  return;
                }

                setSelectedTitle(course.title);
                setIsExpanded(true);
              }}
              className={`relative h-full overflow-hidden rounded-[2rem] border bg-[linear-gradient(180deg,rgba(251,249,245,0.98),rgba(246,243,237,0.98))] p-6 text-left shadow-[0_22px_55px_-38px_rgba(31,42,36,0.24)] transition duration-300 ${
                selected
                  ? `${courseAccent.border} -translate-y-1`
                  : "border-mist hover:-translate-y-1 hover:border-sage/35"
              }`}
            >
              <div
                className={`absolute right-4 top-4 text-7xl font-semibold tracking-[-0.08em] ${courseAccent.ghost}`}
                aria-hidden="true"
              >
                {course.number}
              </div>
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    Course {course.number}
                  </p>
                  {selected ? (
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${courseAccent.chip}`}>
                      Selected
                    </span>
                  ) : null}
                </div>

                <h3 className="font-serif mt-4 max-w-xs text-3xl font-semibold tracking-[-0.04em] text-forest">
                  {course.title}
                </h3>
                <p className="mt-5 flex-1 text-sm leading-7 text-muted">
                  {course.description}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl border border-mist bg-cream px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                      Chapters
                    </p>
                    <p className="mt-2 text-lg font-semibold text-forest">{course.chapters}</p>
                  </div>
                  <div className="rounded-2xl border border-mist bg-cream px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                      Lessons
                    </p>
                    <p className="mt-2 text-lg font-semibold text-forest">{course.lessons}</p>
                  </div>
                  <div className="rounded-2xl border border-mist bg-cream px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                      Format
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-5 text-forest">
                      {course.duration}
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-5 flex items-center justify-between rounded-2xl border px-4 py-3 ${
                    selected
                      ? "border-gold/35 bg-gold/10 text-forest"
                      : "border-mist bg-cream text-muted"
                  }`}
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                      {selected ? "Preview below" : "Course details"}
                    </p>
                    <p className="mt-1 text-sm font-medium text-current">
                      {selected
                        ? isExpanded
                          ? "Click again to collapse the course layout"
                          : "Click again to open the course layout"
                        : "Click to view the layout before sign-up"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${
                      selected ? "border-gold/35 bg-gold/12 text-forest" : "border-mist bg-sand text-muted"
                    }`}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        selected && isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-[#d7cebf] bg-[linear-gradient(180deg,rgba(251,249,245,0.98),rgba(246,243,237,0.98))] shadow-[0_24px_70px_-48px_rgba(31,42,36,0.22)]">
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className={`flex w-full items-center justify-between gap-4 border-b px-6 py-5 text-left sm:px-8 ${accent.previewHeader}`}
        >
          <div>
            <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${accent.previewKicker}`}>
              Selected Course Preview
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h3 className="font-serif text-2xl font-semibold tracking-[-0.04em] text-forest sm:text-3xl">
                {selectedCourse.title}
              </h3>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${accent.previewBadge}`}>
                Click to {isExpanded ? "collapse" : "expand"}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              See the chapter flow, lesson style, and what someone is actually choosing before sign-up.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/register"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-sage/25 bg-white/78 px-4 text-sm font-semibold text-forest transition hover:border-sage/40 hover:bg-white"
            >
              Sign up
            </Link>
            <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-transform duration-300 ${accent.previewToggle} ${isExpanded ? "rotate-180" : ""}`}>
              <ChevronDown className="h-5 w-5" />
            </span>
          </div>
        </button>

        {isExpanded ? (
          <div className="grid gap-0 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="relative border-b border-mist p-6 sm:p-8 lg:border-b-0 lg:border-r lg:border-mist">
              <div className={`absolute -left-8 top-8 h-28 w-28 rounded-full blur-3xl ${accent.halo}`} />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${accent.chip}`}>
                    Course Layout
                  </span>
                  <span className="rounded-full border border-mist bg-cream px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                    {selectedCourse.audience}
                  </span>
                </div>

                <h3 className="font-serif mt-5 max-w-lg text-4xl font-semibold tracking-[-0.05em] text-forest sm:text-5xl">
                  {selectedCourse.title}
                </h3>
                <p className="mt-5 max-w-xl text-sm leading-7 text-muted">
                  {selectedCourse.summary}
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.4rem] border border-mist bg-cream p-4">
                    <Layers3 className="h-4 w-4 text-sage" />
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Chapters
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-forest">
                      {selectedCourse.chapters}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-mist bg-cream p-4">
                    <ListChecks className="h-4 w-4 text-sage" />
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Lessons
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-forest">
                      {selectedCourse.lessons}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-mist bg-cream p-4">
                    <Clock3 className="h-4 w-4 text-sage" />
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Shape
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-forest">
                      {selectedCourse.duration}
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button asChild variant="primary" size="sm">
                    <Link href="/register">
                      Start This Course
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="border-mist bg-cream text-forest hover:border-sage/35 hover:bg-sand hover:text-forest">
                    <Link href="/register?mode=anonymous">
                      Continue Anonymously
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
                <div className="rounded-[1.6rem] border border-mist bg-[#fffdf9] p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-mist bg-cream">
                      <BookOpen className="h-4 w-4 text-forest" />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                        Chapter Flow
                      </p>
                      <p className="mt-1 text-sm font-semibold text-forest">
                        What the course covers
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {selectedCourse.chapterTitles.map((chapterTitle, index) => (
                      <div
                        key={chapterTitle}
                        className="rounded-2xl border border-mist bg-cream px-4 py-3"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                          Chapter {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-medium text-forest">
                          {chapterTitle}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-mist bg-[#fffdf9] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                    Sample Lessons
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-forest">
                    A quick sense of the journey before sign-up
                  </p>

                  <div className="mt-5 space-y-3">
                    {selectedCourse.sampleLessons.map((lessonTitle, index) => (
                      <div
                        key={lessonTitle}
                        className="flex items-start gap-3 rounded-2xl border border-mist bg-cream px-4 py-3"
                      >
                        <span className={`mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full text-[11px] font-semibold ${accent.chip}`}>
                          {index + 1}
                        </span>
                        <p className="text-sm leading-6 text-text">{lessonTitle}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-mist bg-cream px-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Lesson Rhythm
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      Welcome, teaching, reflection, journaling, action steps, and guided completion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
