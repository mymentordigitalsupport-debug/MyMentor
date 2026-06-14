"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface QuizOption {
  text: string;
  is_correct: boolean;
}

interface QuizBlockContent {
  question?: string;
  options?: QuizOption[];
}

interface QuizBlockProps {
  blockId: string;
  content: QuizBlockContent;
  lessonId: string;
  attemptId: string;
  userId: string;
}

export function QuizBlock({ blockId, content, lessonId, attemptId, userId }: QuizBlockProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [answeredAt, setAnsweredAt] = useState(() => Date.now());

  const options = content.options ?? [];

  async function handleReveal() {
    if (selected === null) return;
    setSaving(true);

    const chosenOption = options[selected] ?? null;
    const correctOption = options.find((option) => option.is_correct) ?? null;
    const supabase = createSupabaseBrowserClient();
    const now = new Date().toISOString();

    const { error } = await supabase.from("lesson_quiz_answers").upsert(
      {
        attempt_id: attemptId,
        user_id: userId,
        lesson_id: lessonId,
        block_id: blockId,
        question_text: content.question ?? "Quiz question",
        selected_answer: chosenOption?.text ?? "",
        correct_answer: correctOption?.text ?? null,
        is_correct: Boolean(chosenOption?.is_correct),
        duration_ms: Math.max(0, Date.now() - answeredAt),
        answered_at: now,
        payload: {
          options: options.map((option) => option.text),
        },
      },
      { onConflict: "attempt_id,block_id" }
    );

    if (error) {
      setSaving(false);
      return;
    }

    setRevealed(true);
    setSaving(false);
  }

  return (
    <Card variant="default" padding="md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg" aria-hidden="true">✅</span>
        <p className="text-xs font-medium text-muted uppercase tracking-wide">
          Reflection Check
        </p>
      </div>

      {content.question && (
        <p className="font-medium text-text mb-4 leading-snug">{content.question}</p>
      )}

      <div className="flex flex-col gap-2 mb-4">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = opt.is_correct;

          let stateClass = "border-mist bg-cream hover:border-sage/40";
          if (revealed && isSelected && isCorrect) {
            stateClass = "border-success bg-success/10";
          } else if (revealed && isSelected && !isCorrect) {
            stateClass = "border-danger bg-danger/10";
          } else if (revealed && isCorrect) {
            stateClass = "border-success/40 bg-success/5";
          } else if (isSelected) {
            stateClass = "border-sage bg-sage/10";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (revealed) return;
                setSelected(i);
                setAnsweredAt(Date.now());
              }}
              disabled={revealed}
              className={cn(
                "text-left px-4 py-3 rounded-2xl border-2 text-sm transition-all duration-200",
                stateClass
              )}
            >
              {opt.text}
              {revealed && isCorrect && (
                <span className="ml-2 text-success">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {!revealed && (
        <Button
          onClick={handleReveal}
          variant="secondary"
          size="sm"
          loading={saving}
          disabled={selected === null}
        >
          Check Answer
        </Button>
      )}

      {revealed && (
        <p className="text-sm text-muted">
          {options[selected ?? 0]?.is_correct
            ? "Well done — that's right."
            : "That's okay. Reflection is the goal, not perfection."}
        </p>
      )}
    </Card>
  );
}
