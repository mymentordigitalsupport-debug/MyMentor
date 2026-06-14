"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type MoodValue, MOOD_OPTIONS } from "@/types";
import { MoodPill } from "@/components/ui/MoodPill";
import { Card } from "@/components/ui/Card";

interface MoodCheckInBlockContent {
  question?: string;
}

interface MoodCheckInBlockProps {
  content: MoodCheckInBlockContent;
  lessonId: string;
  userId: string;
}

export function MoodCheckInBlock({ content, lessonId, userId }: MoodCheckInBlockProps) {
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(mood: MoodValue) {
    setSelected(mood);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: insertError } = await supabase.from("mood_checkins").insert({
      user_id: userId,
      lesson_id: lessonId,
      mood,
      mood_label: mood,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSaved(true);
  }

  return (
    <Card variant="mist" padding="md">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          🌡
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Mood Check-in</p>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-text">
        {content.question ?? "How are you feeling right now?"}
      </p>

      {saved && selected ? (
        <div className="rounded-2xl border border-sage/20 bg-sage/10 px-4 py-3">
          <p className="text-sm text-forest">Feeling {selected} noted.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {error ? (
            <p className="rounded-2xl border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <div className="grid grid-cols-3 gap-2">
            {MOOD_OPTIONS.map((opt) => (
              <MoodPill
                key={opt.value}
                option={opt}
                selected={selected === opt.value}
                onClick={() => handleSelect(opt.value)}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
