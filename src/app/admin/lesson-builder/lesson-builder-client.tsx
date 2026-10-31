"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  Film,
  Lightbulb,
  ListTodo,
  MessageSquareQuote,
  Pencil,
  Save,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatShortDate } from "@/lib/utils";

type SectionKey = "welcome" | "teaching" | "video" | "reflection" | "action" | "encouragement";

type LessonRow = {
  id: string;
  title: string;
  estimated_minutes: number | null;
  sort_order: number;
  is_published: boolean;
  chapter_id: string;
  updated_at: string;
  chapters: {
    title: string;
    course_versions: {
      guidance_path: string;
      title: string;
      courses: {
        title: string;
        slug: string;
      } | null;
    } | null;
  } | null;
};

type BlockRow = {
  id: string;
  lesson_id: string;
  block_type: string;
  content: Record<string, unknown>;
  sort_order: number;
};

type TemplateState = {
  welcomeMessage: string;
  teachingContent: string;
  scriptureReference: string;
  mentorQuote: string;
  videoUrl: string;
  videoCaption: string;
  reflectionPrompt: string;
  savedInsightPrompt: string;
  dailyAction: string;
  actionPlan: string;
  encouragementMessage: string;
  nextStep: string;
};

const SECTION_ORDER: Array<{
  key: SectionKey;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  subtitle: string;
}> = [
  { key: "welcome", title: "Welcome Message", icon: Sparkles, subtitle: "Gentle opening and frame the lesson." },
  { key: "teaching", title: "Teaching Content", icon: BookOpen, subtitle: "The core explanation and teaching text." },
  { key: "video", title: "Mentor Video", icon: Film, subtitle: "Attach a video and short caption." },
  { key: "reflection", title: "Reflection", icon: MessageSquareQuote, subtitle: "Prompt the learner to reflect and save insight." },
  { key: "action", title: "Daily Action", icon: ListTodo, subtitle: "Simple practice step for the day." },
  { key: "encouragement", title: "Encouragement", icon: Lightbulb, subtitle: "Close the lesson with hope and a next step." },
];

function getSectionFromInput(value?: string): SectionKey {
  switch (value) {
    case "welcome":
      return "welcome";
    case "teaching":
      return "teaching";
    case "video":
      return "video";
    case "reflection":
      return "reflection";
    case "action":
      return "action";
    case "encouragement":
      return "encouragement";
    default:
      return "welcome";
  }
}

function textFromContent(content: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = content[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return "";
}

function createTemplateState(lesson: LessonRow, blocks: BlockRow[]): TemplateState {
  const welcomeBlocks = blocks.filter((block) => block.block_type === "welcome");
  const teachingBlocks = blocks.filter((block) => ["reading", "mentor_note", "scripture", "quote"].includes(block.block_type));
  const videoBlocks = blocks.filter((block) => ["mentor_video", "audio"].includes(block.block_type));
  const reflectionBlocks = blocks.filter((block) => ["pause_reflect", "reflection_prompt", "journal_prompt", "quiz"].includes(block.block_type));
  const actionBlocks = blocks.filter((block) => block.block_type === "daily_action");
  const encouragementBlocks = blocks.filter((block) => ["encouragement", "complete"].includes(block.block_type));

  return {
    welcomeMessage:
      textFromContent(welcomeBlocks[0]?.content ?? {}, ["message", "text", "body"]) || `Welcome to ${lesson.title}.`,
    teachingContent:
      teachingBlocks.map((block) => textFromContent(block.content, ["body", "text", "message", "content"])).filter(Boolean).join("\n\n") ||
      `Teaching content for ${lesson.title}.`,
    scriptureReference: textFromContent(teachingBlocks[0]?.content ?? {}, ["scripture", "reference", "verse"]) || "Romans 12:2",
    mentorQuote: textFromContent(teachingBlocks[0]?.content ?? {}, ["quote", "mentorQuote", "mentor_quote"]) || "Small steps create lasting change.",
    videoUrl: textFromContent(videoBlocks[0]?.content ?? {}, ["url", "videoUrl", "source"]) || "",
    videoCaption: textFromContent(videoBlocks[0]?.content ?? {}, ["caption", "text", "body"]) || "Add a short mentor video here.",
    reflectionPrompt:
      textFromContent(reflectionBlocks[0]?.content ?? {}, ["prompt", "question", "text", "body"]) ||
      "What is one thing you noticed today?",
    savedInsightPrompt:
      textFromContent(reflectionBlocks[0]?.content ?? {}, ["savedInsightPrompt", "saved_insight_prompt", "followUp"]) ||
      "Write one insight you want to remember.",
    dailyAction:
      textFromContent(actionBlocks[0]?.content ?? {}, ["action", "task", "body", "text"]) ||
      "Complete one small practice action today.",
    actionPlan: textFromContent(actionBlocks[0]?.content ?? {}, ["plan", "nextStep", "actionPlan"]) || "Repeat this action tomorrow and note what changed.",
    encouragementMessage:
      textFromContent(encouragementBlocks[0]?.content ?? {}, ["message", "text", "body"]) ||
      `You do not need to fix everything today in ${lesson.title}.`,
    nextStep: textFromContent(encouragementBlocks[0]?.content ?? {}, ["nextStep", "next_step", "action"]) || "Continue into the next lesson when ready.",
  };
}

function PreviewSection({
  title,
  icon: Icon,
  body,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  body: React.ReactNode;
}) {
  return (
    <Card variant="mist" padding="sm">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cream text-text">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-text">{title}</p>
        </div>
      </div>
      <div className="mt-3 text-sm leading-6 text-text">{body}</div>
    </Card>
  );
}

export function LessonBuilderClient({
  lessons,
  blocks,
  initialLessonId,
  initialSectionKey,
  initialPreview,
}: {
  lessons: LessonRow[];
  blocks: BlockRow[];
  initialLessonId?: string;
  initialSectionKey?: string;
  initialPreview?: boolean;
}) {
  const defaultLessonId = lessons[0]?.id ?? "";
  const [lessonId, setLessonId] = React.useState(initialLessonId ?? defaultLessonId);
  const lesson = React.useMemo(
    () => lessons.find((item) => item.id === lessonId) ?? lessons[0],
    [lessons, lessonId]
  );
  const lessonBlocks = React.useMemo(
    () =>
      blocks
        .filter((block) => block.lesson_id === lesson?.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [blocks, lesson?.id]
  );
  const [selectedSectionKey, setSelectedSectionKey] = React.useState<SectionKey>(
    getSectionFromInput(initialSectionKey)
  );
  const [previewMode, setPreviewMode] = React.useState(Boolean(initialPreview));
  const lessonTemplate = React.useMemo<TemplateState | null>(
    () => (lesson ? createTemplateState(lesson, lessonBlocks) : null),
    [lesson, lessonBlocks]
  );
  const [template, setTemplate] = React.useState<TemplateState | null>(lessonTemplate);

  React.useEffect(() => {
    setTemplate(lessonTemplate);
  }, [lessonTemplate]);

  if (!lesson || !template) {
    return (
      <Card variant="default" padding="lg">
        <p className="text-sm text-muted">No lessons available for the lesson builder.</p>
      </Card>
    );
  }

  const completion = Object.values(template).filter((value) => value.trim().length > 0).length;
  const currentSection = SECTION_ORDER.find((section) => section.key === selectedSectionKey) ?? SECTION_ORDER[0];

  const previewSections = [
    { title: "Welcome Message", icon: Sparkles, body: template.welcomeMessage },
    {
      title: "Teaching Content",
      icon: BookOpen,
      body: (
        <>
          <p>{template.teachingContent}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">Scripture reference</p>
          <p className="mt-1 font-semibold text-text">{template.scriptureReference}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">Mentor quote</p>
          <p className="mt-1 italic text-text">{template.mentorQuote}</p>
        </>
      ),
    },
    {
      title: "Mentor Video",
      icon: Film,
      body: (
        <>
          <p>{template.videoCaption}</p>
          <p className="mt-2 text-xs text-muted">{template.videoUrl || "No video URL attached."}</p>
        </>
      ),
    },
    {
      title: "Reflection",
      icon: MessageSquareQuote,
      body: (
        <>
          <p>{template.reflectionPrompt}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">Saved insight prompt</p>
          <p className="mt-1 text-text">{template.savedInsightPrompt}</p>
        </>
      ),
    },
    {
      title: "Daily Action",
      icon: ListTodo,
      body: (
        <>
          <p>{template.dailyAction}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">Action plan</p>
          <p className="mt-1 text-text">{template.actionPlan}</p>
        </>
      ),
    },
    {
      title: "Encouragement",
      icon: Lightbulb,
      body: (
        <>
          <p>{template.encouragementMessage}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">Next step</p>
          <p className="mt-1 text-text">{template.nextStep}</p>
        </>
      ),
    },
  ];

  const isPublished = lesson.is_published;
  const lessonPath = lesson.chapters?.course_versions?.courses?.title ?? "Untitled course";
  const ChapterName = lesson.chapters?.title ?? "Untitled Chapter";

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="forest">Live data</Badge>
          <div>
            <h1 className="text-2xl font-semibold text-text">Lesson Builder</h1>
            <p className="text-sm text-muted">
              Build a lesson with fixed sections instead of a free-form add-block workflow.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={() => setPreviewMode((value) => !value)}>
            <Eye className="h-4 w-4" />
            {previewMode ? "Exit Preview" : "Preview Mode"}
          </Button>
          <Button variant="secondary" size="sm">
            <Save className="h-4 w-4" />
            Save as Draft
          </Button>
          <Button variant="primary" size="sm">
            <CheckCircle2 className="h-4 w-4" />
            Publish Lesson
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/lessons">
              <ArrowRight className="h-4 w-4" />
              Back to Lessons
            </Link>
          </Button>
        </div>
      </section>

      <Card variant="default" padding="lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-text">{lesson.title}</h2>
              <Badge variant={isPublished ? "sage" : "muted"}>{isPublished ? "Published" : "Draft"}</Badge>
              <Badge variant="forest">{lesson.chapters?.course_versions?.guidance_path ?? "N/A"}</Badge>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-muted">
              <span>{lessonPath}</span>
              <span>·</span>
              <span>{ChapterName}</span>
              <span>·</span>
              <span>Lesson {lesson.sort_order}</span>
              <span>·</span>
              <span>{lesson.estimated_minutes ?? 0} min</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="sage">Updated {formatShortDate(lesson.updated_at)}</Badge>
              <Badge variant={previewMode ? "gold" : "muted"}>
                {previewMode ? "Preview mode on" : "Preview mode off"}
              </Badge>
              <Badge variant="forest">
                {completion} / {Object.keys(template).length} sections filled
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[480px]">
            <Card variant="mist" padding="sm">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Sections</p>
              <p className="mt-2 text-2xl font-semibold text-text">{SECTION_ORDER.length}</p>
            </Card>
            <Card variant="mist" padding="sm">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Blocks</p>
              <p className="mt-2 text-2xl font-semibold text-text">{lessonBlocks.length}</p>
            </Card>
            <Card variant="mist" padding="sm">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Source</p>
              <p className="mt-2 text-2xl font-semibold text-text">DB</p>
            </Card>
          </div>
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Lesson template</p>
              <h2 className="mt-1 text-lg font-semibold text-text">Sections</h2>
            </div>
            <Sparkles className="h-5 w-5 text-sage" />
          </div>

          <div className="mt-5 space-y-3">
            {SECTION_ORDER.map((section) => {
              const active = selectedSectionKey === section.key;
              const filled = Boolean(
                (section.key === "welcome" && template.welcomeMessage) ||
                  (section.key === "teaching" && template.teachingContent) ||
                  (section.key === "video" && template.videoCaption) ||
                  (section.key === "reflection" && template.reflectionPrompt) ||
                  (section.key === "action" && template.dailyAction) ||
                  (section.key === "encouragement" && template.encouragementMessage)
              );
              const Icon = section.icon;

              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setSelectedSectionKey(section.key)}
                  className={[
                    "flex w-full items-start gap-3 rounded-3xl border p-4 text-left transition-colors",
                    active ? "border-sage/40 bg-sage/10" : "border-mist/70 bg-cream hover:border-sage/20",
                  ].join(" ")}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mist text-text">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-text">{section.title}</p>
                      <Badge variant={filled ? "sage" : "muted"}>{filled ? "Filled" : "Empty"}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted">{section.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-3xl border border-mist/70 bg-cream p-4 text-sm text-muted">
            The builder is section-based. There is no free-form add-block list here.
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Editing panel</p>
              <h2 className="mt-1 text-lg font-semibold text-text">
                {previewMode ? "Lesson Preview" : currentSection.title}
              </h2>
            </div>
            <Badge variant="forest">{currentSection.subtitle}</Badge>
          </div>

          {previewMode ? (
            <div className="mt-5 space-y-4">
              <Card variant="default" padding="lg" className="bg-sand/50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Lesson preview</p>
                    <h3 className="mt-1 text-xl font-semibold text-text">{lesson.title}</h3>
                  </div>
                  <Badge variant="sage">What the learner sees</Badge>
                </div>

                <div className="mt-5 space-y-3">
                  {previewSections.map((section) => (
                    <PreviewSection key={section.title} title={section.title} icon={section.icon} body={section.body} />
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Input
                  label="Select lesson"
                  value={lessonId}
                  onChange={(event) => setLessonId(event.target.value)}
                  list="live-lessons"
                  hint="Use a lesson ID from the live list."
                />
                <datalist id="live-lessons">
                  {lessons.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </datalist>
                <Card variant="mist" padding="sm">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Course</p>
                  <p className="mt-2 text-sm font-semibold text-text">{lessonPath}</p>
                </Card>
                <Card variant="mist" padding="sm">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Chapter</p>
                  <p className="mt-2 text-sm font-semibold text-text">{ChapterName}</p>
                </Card>
              </div>

              {selectedSectionKey === "welcome" && (
                <div className="mt-5 space-y-4">
                  <Input
                    label="Welcome Message"
                    value={template.welcomeMessage}
                    onChange={(event) =>
                      setTemplate((current) => (current ? { ...current, welcomeMessage: event.target.value } : current))
                    }
                  />
                </div>
              )}

              {selectedSectionKey === "teaching" && (
                <div className="mt-5 space-y-4">
                  <Textarea
                    label="Teaching Content"
                    value={template.teachingContent}
                    onChange={(event) =>
                      setTemplate((current) => (current ? { ...current, teachingContent: event.target.value } : current))
                    }
                    hint="Write the main lesson content here."
                  />
                  <Input
                    label="Scripture Reference"
                    value={template.scriptureReference}
                    onChange={(event) =>
                      setTemplate((current) => (current ? { ...current, scriptureReference: event.target.value } : current))
                    }
                  />
                  <Input
                    label="Mentor Quote"
                    value={template.mentorQuote}
                    onChange={(event) =>
                      setTemplate((current) => (current ? { ...current, mentorQuote: event.target.value } : current))
                    }
                  />
                </div>
              )}

              {selectedSectionKey === "video" && (
                <div className="mt-5 space-y-4">
                  <Input
                    label="Mentor Video URL"
                    value={template.videoUrl}
                    onChange={(event) =>
                      setTemplate((current) => (current ? { ...current, videoUrl: event.target.value } : current))
                    }
                    placeholder="https://..."
                  />
                  <Textarea
                    label="Video Caption"
                    value={template.videoCaption}
                    onChange={(event) =>
                      setTemplate((current) => (current ? { ...current, videoCaption: event.target.value } : current))
                    }
                  />
                </div>
              )}

              {selectedSectionKey === "reflection" && (
                <div className="mt-5 space-y-4">
                  <Textarea
                    label="Reflection Prompt"
                    value={template.reflectionPrompt}
                    onChange={(event) =>
                      setTemplate((current) => (current ? { ...current, reflectionPrompt: event.target.value } : current))
                    }
                  />
                  <Input
                    label="Saved Insight Prompt"
                    value={template.savedInsightPrompt}
                    onChange={(event) =>
                      setTemplate((current) => (current ? { ...current, savedInsightPrompt: event.target.value } : current))
                    }
                  />
                </div>
              )}

              {selectedSectionKey === "action" && (
                <div className="mt-5 space-y-4">
                  <Textarea
                    label="Daily Action"
                    value={template.dailyAction}
                    onChange={(event) =>
                      setTemplate((current) => (current ? { ...current, dailyAction: event.target.value } : current))
                    }
                  />
                  <Input
                    label="Action Plan"
                    value={template.actionPlan}
                    onChange={(event) =>
                      setTemplate((current) => (current ? { ...current, actionPlan: event.target.value } : current))
                    }
                  />
                </div>
              )}

              {selectedSectionKey === "encouragement" && (
                <div className="mt-5 space-y-4">
                  <Textarea
                    label="Encouragement"
                    value={template.encouragementMessage}
                    onChange={(event) =>
                      setTemplate((current) => (current ? { ...current, encouragementMessage: event.target.value } : current))
                    }
                  />
                  <Input
                    label="Next Step"
                    value={template.nextStep}
                    onChange={(event) =>
                      setTemplate((current) => (current ? { ...current, nextStep: event.target.value } : current))
                    }
                  />
                </div>
              )}
            </>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedSectionKey("welcome")}>
              <Pencil className="h-4 w-4" />
              Reset Section
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPreviewMode((value) => !value)}>
              <Eye className="h-4 w-4" />
              {previewMode ? "Exit Preview" : "Preview"}
            </Button>
          </div>
        </Card>
      </section>

      <Card variant="default" padding="lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">Template summary</h2>
            <p className="text-sm text-muted">
              This is the full lesson flow the coach is building manually before publish.
            </p>
          </div>
          <Badge variant="gold">No AI generation</Badge>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            `Welcome: ${template.welcomeMessage || "empty"}`,
            `Teaching: ${template.teachingContent || "empty"}`,
            `Video: ${template.videoUrl || "empty"}`,
            `Reflection: ${template.reflectionPrompt || "empty"}`,
            `Daily action: ${template.dailyAction || "empty"}`,
            `Encouragement: ${template.encouragementMessage || "empty"}`,
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-mist bg-cream p-4 text-sm text-muted">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

