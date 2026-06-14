"use client";

import { useState } from "react";
import { type MoodValue, MOOD_OPTIONS } from "@/types";
import { MoodPill } from "@/components/ui/MoodPill";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface StepMoodBaselineProps {
  onComplete: (mood: MoodValue | null) => void;
  saving: boolean;
}

export function StepMoodBaseline({ onComplete, saving }: StepMoodBaselineProps) {
  const [selected, setSelected] = useState<MoodValue | null>(null);

  async function handleComplete() {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && selected) {
      await supabase
        .from("profiles")
        .update({
          mood_baseline: selected,
        })
        .eq("user_id", user.id);
    }
    
    onComplete(selected);
  }

  async function handleSkip() {
    onComplete(null);
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-10">
      <h2 className="font-serif text-2xl text-forest font-semibold mb-2">
        How are you feeling right now?
      </h2>
      <p className="text-muted text-sm mb-8 leading-relaxed">
        There is no wrong answer. This helps us understand where you are
        starting from.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {MOOD_OPTIONS.map((opt) => (
          <MoodPill
            key={opt.value}
            option={opt}
            selected={selected === opt.value}
            onClick={() => setSelected(opt.value)}
          />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <Button
          onClick={handleComplete}
          fullWidth
          size="lg"
          loading={saving}
          disabled={!selected}
        >
          Begin My Course
        </Button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={saving}
          className="text-sm text-muted hover:text-text transition-colors text-center disabled:opacity-50"
        >
          Skip this step
        </button>
      </div>
    </div>
  );
}

