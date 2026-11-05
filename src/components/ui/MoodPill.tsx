"use client";

import { cn } from "@/lib/utils";
import { type MoodOption } from "@/types";
import { MoodImage } from "@/components/ui/MoodImage";

interface MoodPillProps {
  option: MoodOption;
  selected?: boolean;
  onClick?: () => void;
}

export function MoodPill({ option, selected = false, onClick }: MoodPillProps) {
  return (
    <button
      type="button"
      data-profile-exempt
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
      <MoodImage mood={option.value} size={34} />
      <span>{option.label}</span>
    </button>
  );
}
