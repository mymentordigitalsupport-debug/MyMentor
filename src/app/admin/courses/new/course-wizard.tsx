"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type ChapterShell = {
  name: string;
  description: string;
};

type LessonShell = {
  title: string;
};

const steps = [
  "Course Details",
  "Guidance Paths",
  "Chapter Count",
  "Chapter Names",
  "Lesson Shells",
];

const DEMO_Chapter_NAMES = [
  "The Stage of Creation",
  "The Tree of Knowledge",
  "The Concept of Abuse",
  "Family Support Foundations",
  "Breaking the Cycle",
  "Healing the Household",
  "Truth and Responsibility",
  "Moving Forward",
];

const DEMO_LESSON_COUNTS = 2;

function createDemoLessonTitles(count: number) {
  return Array.from({ length: count }, (_, lessonIndex) => ({
    title: `Lesson ${lessonIndex + 1}`,
  }));
}

function createChapterShells(count: number): ChapterShell[] {
  return Array.from({ length: count }, (_, index) => ({
    name: `Chapter ${index + 1}`,
    description: "",
  }));
}

function createLessonShells(count: number): LessonShell[] {
  return Array.from({ length: count }, (_, index) => ({
    title: `Lesson ${index + 1}`,
  }));
}

export function CourseWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [courseName, setCourseName] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [coverImage, setCoverImage] = React.useState("");
  const [christianGuided, setChristianGuided] = React.useState(true);
  const [generalGuidance, setGeneralGuidance] = React.useState(true);
  const [ChapterCount, setChapterCount] = React.useState(8);
  const [Chapters, setChapters] = React.useState<ChapterShell[]>(createChapterShells(8));
  const [lessonsPerChapter, setLessonsPerChapter] = React.useState(4);
  const [lessonShells, setLessonShells] = React.useState<Record<number, LessonShell[]>>(() => {
    const initial: Record<number, LessonShell[]> = {};
    for (let index = 0; index < 8; index += 1) {
      initial[index] = createLessonShells(4);
    }
    return initial;
  });
  const [selectedChapterIndex, setSelectedChapterIndex] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setChapters((current) => {
      const next = createChapterShells(ChapterCount);
      return next.map((shell, index) => ({
        ...shell,
        name: current[index]?.name ?? shell.name,
        description: current[index]?.description ?? shell.description,
      }));
    });
    setLessonShells((current) => {
      const next: Record<number, LessonShell[]> = {};
      for (let index = 0; index < ChapterCount; index += 1) {
        const existing = current[index] ?? createLessonShells(lessonsPerChapter);
        next[index] = Array.from({ length: lessonsPerChapter }, (_, lessonIndex) => ({
          title: existing[lessonIndex]?.title ?? `Lesson ${lessonIndex + 1}`,
        }));
      }
      return next;
    });
    setSelectedChapterIndex((current) => Math.min(current, Math.max(ChapterCount - 1, 0)));
  }, [ChapterCount, lessonsPerChapter]);

  const totalLessons = ChapterCount * lessonsPerChapter;
  const readyPaths = [christianGuided ? "Christian Guided" : null, generalGuidance ? "Religious Guidance" : null].filter(Boolean);

  function fillDemoCourse() {
    const nextChapterCount = DEMO_Chapter_NAMES.length;
    const nextLessonsPerChapter = DEMO_LESSON_COUNTS;

    setCourseName("Uprooting Drug Abuse");
    setSubtitle("A structured healing Course through awareness, truth, and recovery");
    setDescription(
      "A practical Course that moves from understanding the problem to building new habits, support, and hope."
    );
    setCoverImage("https://placehold.co/1200x630?text=Uprooting+Drug+Abuse");
    setChristianGuided(true);
    setGeneralGuidance(true);
    setChapterCount(nextChapterCount);
    setLessonsPerChapter(nextLessonsPerChapter);
    setChapters(
      DEMO_Chapter_NAMES.map((name) => ({
        name,
        description: `Demo Chapter for ${name}.`,
      }))
    );
    setLessonShells(
      Object.fromEntries(
        Array.from({ length: nextChapterCount }, (_, ChapterIndex) => [
          ChapterIndex,
          createDemoLessonTitles(nextLessonsPerChapter),
        ])
      )
    );
    setSelectedChapterIndex(0);
    setStep(5);
  }

  function handlePrimaryAction() {
    if (step < 5) {
      setStep((value) => Math.min(5, value + 1));
      return;
    }

    void handleCreateCourse();
  }

  const completion = [
    courseName,
    subtitle,
    description,
    coverImage,
    readyPaths.length > 0,
    ChapterCount > 0,
    Chapters.every((Chapter) => Chapter.name.trim().length > 0),
    lessonShells[selectedChapterIndex]?.every((lesson) => lesson.title.trim().length > 0) ?? false,
  ].filter(Boolean).length;

  const selectedLessons = lessonShells[selectedChapterIndex] ?? [];

  async function handleCreateCourse() {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseName,
          subtitle,
          description,
          coverImageUrl: coverImage,
          christianGuided,
          generalGuidance,
          ChapterNames: Chapters,
          lessonsPerChapter,
          lessonTitles: lessonShells,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Failed to create Course");
      }

      const payload = (await response.json()) as { course?: { id?: string } };
      if (payload.course?.id) {
        router.push(`/admin/courses/${payload.course.id}`);
        router.refresh();
      }
    } catch (error) {
      // Keep the demo flow simple: the browser console carries the exact failure reason.
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="forest">Manual flow</Badge>
          <div>
            <h1 className="text-2xl font-semibold text-text">Course Wizard</h1>
            <p className="text-sm text-muted">
              Build the Course structure manually first. No AI generation. No hidden shortcuts.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/courses">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
          <Button variant="secondary" size="sm" onClick={fillDemoCourse}>
            Auto-fill Demo
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setStep((value) => Math.max(1, value - 1))}>
            Previous
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrimaryAction}>
            {step === 5 ? "Create Course Draft" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Wizard progress</p>
              <h2 className="mt-1 text-lg font-semibold text-text">Steps</h2>
            </div>
            <CheckCircle2 className="h-5 w-5 text-sage" />
          </div>

          <div className="mt-5 space-y-3">
            {steps.map((label, index) => {
              const active = step === index + 1;
              const done = step > index + 1;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStep(index + 1)}
                  className={[
                    "flex w-full items-center gap-3 rounded-3xl border p-4 text-left transition-colors",
                    active
                      ? "border-sage/40 bg-sage/10"
                      : "border-mist/70 bg-cream hover:border-sage/20",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold",
                      done ? "bg-sage text-cream" : active ? "bg-forest text-cream" : "bg-mist text-text",
                    ].join(" ")}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-text">{label}</p>
                    <p className="text-xs text-muted">
                      {index === 0 && "Course name, subtitle, description, and cover image."}
                      {index === 1 && "Choose Christian Guided and/or Religious Guidance."}
                      {index === 2 && "Set the number of empty Chapters the system creates."}
                      {index === 3 && "Rename each generated Chapter shell."}
                      {index === 4 && "Rename lesson shells for the selected Chapter."}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Current step</p>
              <h2 className="mt-1 text-lg font-semibold text-text">{steps[step - 1]}</h2>
            </div>
            <Badge variant="gold">
              {completion} / 8 ready
            </Badge>
          </div>

          {step === 1 && (
            <div className="mt-5 grid gap-4">
              <Input
                label="Course Name"
                value={courseName}
                onChange={(event) => setCourseName(event.target.value)}
                placeholder="Uprooting Drug Abuse"
              />
              <Input
                label="Subtitle"
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder="A guided recovery Course"
              />
              <Textarea
                label="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A simple description that explains what this Course is for."
              />
              <Input
                label="Cover Image"
                value={coverImage}
                onChange={(event) => setCoverImage(event.target.value)}
                placeholder="https://..."
                hint="Use a direct file URL or placeholder while demo data is in place."
              />
            </div>
          )}

          {step === 2 && (
            <div className="mt-5 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setChristianGuided((value) => !value)}
                  className={[
                    "rounded-3xl border p-4 text-left transition-colors",
                    christianGuided ? "border-sage/40 bg-sage/10" : "border-mist/70 bg-cream",
                  ].join(" ")}
                >
                  <p className="font-semibold text-text">Christian Guided?</p>
                  <p className="mt-1 text-sm text-muted">
                    {christianGuided ? "Included" : "Not included"}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setGeneralGuidance((value) => !value)}
                  className={[
                    "rounded-3xl border p-4 text-left transition-colors",
                    generalGuidance ? "border-sage/40 bg-sage/10" : "border-mist/70 bg-cream",
                  ].join(" ")}
                >
                  <p className="font-semibold text-text">Religious Guidance?</p>
                  <p className="mt-1 text-sm text-muted">
                    {generalGuidance ? "Included" : "Not included"}
                  </p>
                </button>
              </div>
              <Card variant="mist" padding="sm">
                <p className="text-sm text-muted">
                  The system will create separate versions for every path you enable here.
                </p>
              </Card>
            </div>
          )}

          {step === 3 && (
            <div className="mt-5 grid gap-4">
              <Input
                type="number"
                min={1}
                max={12}
                label="How many Chapters?"
                value={ChapterCount}
                onChange={(event) => setChapterCount(Number(event.target.value) || 1)}
                hint={`${ChapterCount} empty Chapters will be created automatically.`}
              />
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: ChapterCount }, (_, index) => (
                  <Card key={index} variant="mist" padding="sm">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Chapter shell</p>
                    <p className="mt-2 text-sm font-semibold text-text">Chapter {index + 1}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text">Name the Chapters</p>
                  <p className="text-xs text-muted">
                    The system created the shells. Now give each Chapter a real name.
                  </p>
                </div>
                <Badge variant="forest">{ChapterCount} Chapters</Badge>
              </div>

              <div className="space-y-3">
                {Chapters.map((Chapter, index) => (
                  <div key={index} className="rounded-3xl border border-mist/70 bg-cream p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_1.3fr]">
                      <Input
                        label={`Chapter ${index + 1} name`}
                        value={Chapter.name}
                        onChange={(event) => {
                          const value = event.target.value;
                          setChapters((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, name: value } : item
                            )
                          );
                        }}
                        placeholder={`Chapter ${index + 1}`}
                      />
                      <Textarea
                        label="Chapter description"
                        value={Chapter.description}
                        onChange={(event) => {
                          const value = event.target.value;
                          setChapters((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, description: value } : item
                            )
                          );
                        }}
                        placeholder="Short description for this Chapter."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                <Input
                  type="number"
                  min={1}
                  max={12}
                  label="Lessons per Chapter"
                  value={lessonsPerChapter}
                  onChange={(event) => setLessonsPerChapter(Number(event.target.value) || 1)}
                  hint="The system will create this many lesson shells in every Chapter."
                />
                <Card variant="mist" padding="sm">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Total lessons</p>
                  <p className="mt-2 text-2xl font-semibold text-text">{totalLessons}</p>
                </Card>
              </div>

              <div className="flex flex-wrap gap-2">
                {Chapters.map((Chapter, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedChapterIndex(index)}
                    className={[
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      selectedChapterIndex === index
                        ? "border-sage bg-sage/10 text-forest"
                        : "border-mist bg-cream text-text",
                    ].join(" ")}
                  >
                    {Chapter.name || `Chapter ${index + 1}`}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {selectedLessons.map((lesson, index) => (
                  <div key={index} className="rounded-3xl border border-mist/70 bg-cream p-4">
                    <Input
                      label={`Lesson ${index + 1}`}
                      value={lesson.title}
                      onChange={(event) => {
                        const value = event.target.value;
                        setLessonShells((current) => ({
                          ...current,
                          [selectedChapterIndex]: (current[selectedChapterIndex] ?? createLessonShells(lessonsPerChapter)).map(
                            (item, lessonIndex) =>
                              lessonIndex === index ? { ...item, title: value } : item
                          ),
                        }));
                      }}
                      placeholder={`Lesson ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStep((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrimaryAction}
            >
              {step === 5 ? "Create Course Draft" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCreateCourse} loading={isSubmitting}>
              <Plus className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Course Draft"}
            </Button>
          </div>
        </Card>
      </section>

      <Card variant="default" padding="lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">What will be created</h2>
            <p className="text-sm text-muted">
              Course, selected guidance versions, empty Chapter shells, and lesson shells are created first.
            </p>
          </div>
          <Badge variant="gold">
            {ChapterCount} Chapters · {totalLessons} lessons
          </Badge>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Card variant="mist" padding="sm">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Course</p>
            <p className="mt-2 text-sm font-semibold text-text">
              {courseName || "Course name pending"}
            </p>
          </Card>
          <Card variant="mist" padding="sm">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Paths</p>
            <p className="mt-2 text-sm font-semibold text-text">
              {readyPaths.length ? readyPaths.join(" / ") : "None selected"}
            </p>
          </Card>
          <Card variant="mist" padding="sm">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Coverage</p>
            <p className="mt-2 text-sm font-semibold text-text">
              {Chapters.filter((Chapter) => Chapter.name.trim().length > 0).length}/{ChapterCount} Chapters named
            </p>
          </Card>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Chapters.map((Chapter, index) => (
            <Card key={index} variant="default">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Chapter {index + 1}</p>
                  <p className="mt-1 font-semibold text-text">
                    {Chapter.name || `Chapter ${index + 1}`}
                  </p>
                </div>
                <Badge variant="forest">{lessonShells[index]?.length ?? lessonsPerChapter} lessons</Badge>
              </div>
              <p className="mt-2 text-sm text-muted">
                {Chapter.description || "No description added yet."}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-4 rounded-3xl border border-mist/70 bg-cream p-4 text-sm leading-6 text-muted">
          No AI will create the Course content at this stage. This wizard only creates the structure so a coach can
          move manually from Course to Chapter to lesson to lesson builder.
        </div>
      </Card>
    </div>
  );
}


