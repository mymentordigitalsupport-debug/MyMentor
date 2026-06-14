"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LessonBlock } from "@/components/lesson/LessonBlock";
import { LessonCompleteCard } from "@/components/lesson/LessonCompleteCard";
import { cn } from "@/lib/utils";
import type { BlockType } from "@/types";

type LessonContentBlockRow = {
  id: string;
  block_type: string;
  content: Record<string, unknown>;
  sort_order: number;
};

type LessonReaderProps = {
  courseId: string;
  courseVersionId: string | null;
  chapterId: string;
  chapterTitle: string;
  lessonId: string;
  lessonAttemptId: string;
  lessonTitle: string;
  lessonSubtitle: string | null;
  estimatedMinutes: number | null;
  blocks: LessonContentBlockRow[];
  nextHref: string;
  backHref: string;
  isCompleted: boolean;
  userId: string;
};

const STEP_LABELS: Record<string, string> = {
  welcome: "Welcome",
  reading: "Teaching",
  video: "Video",
  mentor_note: "Reflection quote",
  pause_reflect: "Pause & reflect",
  journal_prompt: "Journal",
  mood_checkin: "Mood check-in",
  quiz: "Reflection check",
  daily_action: "Action",
  complete: "Complete",
};

function getStepLabel(blockType: string) {
  return STEP_LABELS[blockType] ?? blockType;
}

export function LessonReader({
  courseId,
  courseVersionId,
  chapterId,
  chapterTitle,
  lessonId,
  lessonAttemptId,
  lessonTitle,
  lessonSubtitle,
  estimatedMinutes,
  blocks,
  nextHref,
  backHref,
  isCompleted,
  userId,
}: LessonReaderProps) {
  const orderedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.sort_order - b.sort_order),
    [blocks]
  );
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setStepIndex(0);
  }, [lessonId]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const activeBlock = orderedBlocks[stepIndex];
    if (!activeBlock) return;
    const enteredAt = new Date().toISOString();

    async function logCurrentStepDuration() {
      const leftAt = new Date().toISOString();
      const durationMs = Math.max(0, new Date(leftAt).getTime() - new Date(enteredAt).getTime());

      await supabase.from("lesson_step_events").insert({
        attempt_id: lessonAttemptId,
        user_id: userId,
        lesson_id: lessonId,
        block_id: activeBlock.id,
        step_key: activeBlock.block_type,
        step_order: stepIndex + 1,
        event_type: "viewed",
        entered_at: enteredAt,
        left_at: leftAt,
        duration_ms: durationMs,
        payload: {
          block_type: activeBlock.block_type,
          block_title: getStepLabel(activeBlock.block_type),
          course_id: courseId,
          course_version_id: courseVersionId,
          chapter_id: chapterId,
          chapter_title: chapterTitle,
        },
      });
    }

    return () => {
      void logCurrentStepDuration();
    };
  }, [chapterId, chapterTitle, courseId, courseVersionId, lessonAttemptId, lessonId, orderedBlocks, stepIndex, userId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  const currentBlock = orderedBlocks[stepIndex] ?? null;
  const totalSteps = orderedBlocks.length;
  const isFinalStep = stepIndex === totalSteps - 1;
  const stepProgress = totalSteps > 1 ? Math.round((stepIndex / (totalSteps - 1)) * 100) : 100;

  const stepSummary = orderedBlocks.map((block, index) => ({
    id: block.id,
    title: getStepLabel(block.block_type),
    active: index === stepIndex,
    complete: index < stepIndex,
    final: index === totalSteps - 1,
  }));

  function goNext() {
    setStepIndex((current) => Math.min(current + 1, totalSteps - 1));
  }

  function goBack() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  if (!currentBlock) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-6">
        <Card variant="mist" padding="lg" className="text-center">
          <p className="text-sm text-muted">No lesson content is available yet.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 py-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card
          variant="elevated"
          padding="lg"
          className="overflow-hidden border-[#e4d9c8] bg-[linear-gradient(180deg,rgba(251,249,245,0.98)_0%,rgba(247,242,233,0.96)_100%)] shadow-[0_24px_58px_-36px_rgba(31,42,36,0.22)]"
        >
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <Link href={backHref} className="text-sm text-muted transition hover:text-text">
                  ← {chapterTitle}
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="sage">{getStepLabel(currentBlock.block_type)}</Badge>
                  <Badge variant="muted">
                    Step {stepIndex + 1} of {totalSteps}
                  </Badge>
                  {estimatedMinutes ? <Badge variant="muted">{estimatedMinutes} min</Badge> : null}
                </div>
              </div>

              <div className="hidden text-right md:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
                  One section at a time
                </p>
                <p className="mt-2 text-sm text-muted">
                  Move forward only after you have taken this section in.
                </p>
              </div>
            </div>

            <div>
              <h1
                className="text-[clamp(2rem,3vw,3.4rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-forest"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {lessonTitle}
              </h1>
              {lessonSubtitle ? (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{lessonSubtitle}</p>
              ) : null}
            </div>

            <ProgressBar
              value={stepProgress}
              label={`Step ${stepIndex + 1} of ${totalSteps}`}
              showPercent
              size="sm"
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentBlock.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="min-h-[420px]"
              >
                {currentBlock.block_type === "complete" ? (
                  <div className="flex h-full items-center">
                    <LessonCompleteCard
                      content={
                        (currentBlock.content as { message?: string; encouragement?: string }) ?? {}
                      }
                      lessonAttemptId={lessonAttemptId}
                      lessonId={lessonId}
                      userId={userId}
                      nextHref={nextHref}
                      backHref={backHref}
                      initiallyCompleted={isCompleted}
                    />
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-[#eadfcf] bg-white/90 p-1 shadow-[0_12px_30px_-26px_rgba(31,42,36,0.18)]">
                    <LessonBlock
                      blockId={currentBlock.id}
                      blockType={currentBlock.block_type as BlockType}
                      content={currentBlock.content}
                      lessonId={lessonId}
                      attemptId={lessonAttemptId}
                      userId={userId}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eadfcf] pt-4">
              <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
                Back
              </Button>

              {!isFinalStep ? (
                <Button onClick={goNext}>
                  Next
                </Button>
              ) : (
                <span className="text-sm text-muted">Final step</span>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card variant="default" padding="md" className="sticky top-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Lesson path</p>
            <div className="mt-4 space-y-2">
              {stepSummary.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3 transition",
                    step.active
                      ? "border-sage bg-sage/10"
                      : step.complete
                        ? "border-[#e5ddd0] bg-[#fbf9f5]"
                        : "border-mist bg-white"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-forest">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {step.active ? "Current step" : step.complete ? "Completed in this session" : "Upcoming"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      step.active
                        ? "bg-sage/15 text-forest"
                        : step.complete
                          ? "bg-forest/10 text-forest"
                          : "bg-mist text-muted"
                    )}
                  >
                    {step.active ? "Now" : step.complete ? "Done" : "Next"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="mist" padding="md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Why this layout works</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              The lesson moves forward one section at a time so the learner stays focused on the current thought instead of
              scanning the entire lesson at once.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
