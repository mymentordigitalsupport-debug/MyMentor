"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  showPercent?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showPercent = false,
  size = "md",
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm text-muted">{label}</span>}
          {showPercent && (
            <span className="text-sm font-medium text-forest">{clamped}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-mist rounded-full overflow-hidden",
          size === "sm" ? "h-1.5" : "h-2.5"
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-sage rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
