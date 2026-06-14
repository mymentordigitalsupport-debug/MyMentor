"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface LessonCompleteCardProps {
  content: { message?: string; encouragement?: string };
  lessonAttemptId: string;
  lessonId: string;
  userId: string;
  nextHref: string;
  backHref: string;
  initiallyCompleted?: boolean;
}

export function LessonCompleteCard({
  content,
  lessonAttemptId,
  lessonId,
  userId,
  nextHref,
  backHref,
  initiallyCompleted = false,
}: LessonCompleteCardProps) {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(initiallyCompleted);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDone(initiallyCompleted);
  }, [initiallyCompleted]);

  async function handleComplete() {
    setCompleting(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const now = new Date().toISOString();

    const { data: updated, error: updateError } = await supabase
      .from("user_lesson_progress")
      .update({
        status: "completed",
        completed_at: now,
        last_opened_at: now,
      })
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .select("id");

    if (updateError) {
      setError(updateError.message);
      setCompleting(false);
      return;
    }

    if (!updated || updated.length === 0) {
      const { error: insertError } = await supabase.from("user_lesson_progress").insert({
        user_id: userId,
        lesson_id: lessonId,
        status: "completed",
        started_at: now,
        completed_at: now,
        last_opened_at: now,
      });

      if (insertError) {
        setError(insertError.message);
        setCompleting(false);
        return;
      }
    }

    await supabase
      .from("lesson_attempts")
      .update({
        status: "completed",
        completed_at: now,
        updated_at: now,
      })
      .eq("id", lessonAttemptId)
      .eq("user_id", userId);

    setDone(true);
    setCompleting(false);
    router.refresh();
  }

  return (
    <Card variant="elevated" padding="lg" className="text-center">
      <div className="text-5xl mb-4" aria-hidden="true">
        {done ? "🎉" : "✨"}
      </div>

      <h3 className="font-serif text-2xl text-forest font-semibold mb-3 leading-snug">
        {done ? "Lesson Complete" : content.message ?? "You made it."}
      </h3>

      <p className="text-muted text-sm leading-relaxed mb-6">
        {done
          ? content.encouragement ?? "One step taken. Keep going."
          : "Mark this lesson complete when you're ready."}
      </p>

      {error ? (
        <p className="mb-4 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-left text-sm text-danger">
          {error}
        </p>
      ) : null}

      {!done ? (
        <Button
          onClick={handleComplete}
          fullWidth
          size="lg"
          loading={completing}
        >
          Mark Complete
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push(nextHref)}
            fullWidth
            size="lg"
          >
            Continue Course
          </Button>
          <Button
            onClick={() => router.push(backHref)}
            variant="ghost"
            fullWidth
          >
            Back to Chapter
          </Button>
        </div>
      )}
    </Card>
  );
}

