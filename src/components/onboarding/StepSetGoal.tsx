"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface StepSetGoalProps {
  value: string;
  onChange: (goal: string) => void;
}

const GOAL_SUGGESTIONS = [
  "Find freedom from dependency",
  "Rebuild trust with my family",
  "Understand why I struggle",
  "Take one healthy step each day",
  "Find peace within myself",
];

export function StepSetGoal({ value, onChange }: StepSetGoalProps) {
  const [goal, setGoal] = useState(value);

  async function handleContinue() {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from("profiles")
        .update({
          personal_goal: goal.trim() || null,
        })
        .eq("user_id", user.id);
    }
    
    onChange(goal);
  }

  async function handleSkip() {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from("profiles")
        .update({
          personal_goal: null,
        })
        .eq("user_id", user.id);
    }
    
    onChange("");
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-10">
      <h2 className="font-serif text-2xl text-forest font-semibold mb-2">
        What is your goal for doing this course?
      </h2>
      <p className="text-muted text-sm mb-6 leading-relaxed">
        Setting a personal intention helps anchor your course. This is just
        for you — no one else sees it.
      </p>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mb-6">
        {GOAL_SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setGoal(s)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-all duration-150 ${
              goal === s
                ? "bg-sage/20 border-sage text-forest"
                : "bg-cream border-mist text-muted hover:border-sage/40 hover:text-text"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <Textarea
        label="Or write your own"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="In your own words, what does healing look like for you?"
        rows={4}
      />

      <div className="mt-auto pt-8 flex flex-col gap-3">
        <Button onClick={handleContinue} fullWidth size="lg" disabled={!goal.trim()}>
          Continue
        </Button>
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-muted hover:text-text transition-colors text-center"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

