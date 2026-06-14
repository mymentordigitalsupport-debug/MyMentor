"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useInViewReveal } from "@/hooks/useInViewReveal";

type SectionRevealProps = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
};

export function SectionReveal({ children, className, delayMs = 0 }: SectionRevealProps) {
  const { ref, isVisible } = useInViewReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        "transform-gpu transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        className
      )}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
