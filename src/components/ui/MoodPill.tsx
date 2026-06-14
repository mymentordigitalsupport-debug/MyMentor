"use client";

import { cn } from "@/lib/utils";
import { type MoodOption } from "@/types";

interface MoodPillProps {
  option: MoodOption;
  selected?: boolean;
  onClick?: () => void;
}

export function MoodPill({ option, selected = false, onClick }: MoodPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border",
        "transition-all duration-200 text-sm font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50",
        selected
          ? "bg-sage/20 border-sage text-forest shadow-sm scale-105"
          : "bg-cream border-mist text-muted hover:border-sage/40 hover:text-text"
      )}
      aria-pressed={selected}
    >
      <span className="text-xl leading-none">{option.emoji}</span>
      <span>{option.label}</span>
    </button>
  );
}
