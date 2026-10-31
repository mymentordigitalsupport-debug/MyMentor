"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageSquareQuote, Play } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface GuidanceItem {
  id: string;
  label: string;
  title: string;
  body: string;
  actionLabel?: string;
  href?: string;
}

interface TodayGuidanceCardProps {
  items: GuidanceItem[];
}

export function TodayGuidanceCard({ items }: TodayGuidanceCardProps) {
  const [index, setIndex] = useState(0);
  const safeItems = items.length > 0 ? items : [{
    id: "fallback",
    label: "Daily encouragement",
    title: "Small steps count.",
    body: "Keep going. The next step does not need to be dramatic to be meaningful.",
    actionLabel: "Reflect",
    href: "/today",
  }];
  const current = safeItems[index % safeItems.length];

  return (
    <Card variant="gold" padding="md" className="overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
            Mentor guidance
          </p>
          <h3 className="mt-2 text-sm font-semibold text-text">Why should I keep going?</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((value) => (value === 0 ? safeItems.length - 1 : value - 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#eadfcf] bg-white text-muted transition hover:border-sage hover:text-forest"
            aria-label="Previous guidance"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((value) => (value + 1) % safeItems.length)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#eadfcf] bg-white text-muted transition hover:border-sage hover:text-forest"
            aria-label="Next guidance"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-[#eadfcf] bg-[#fbf9f5] p-5 shadow-[0_10px_24px_-22px_rgba(31,42,36,0.2)]">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="gold">{current.label}</Badge>
          <span className="inline-flex items-center gap-1 rounded-full border border-mist bg-white px-2.5 py-1 text-[10px] font-medium text-muted">
            <MessageSquareQuote className="h-3.5 w-3.5" />
            {index + 1}/{safeItems.length}
          </span>
        </div>

        <h4 className="mt-4 font-serif text-[1.35rem] leading-tight tracking-[-0.04em] text-forest">
          {current.title}
        </h4>

        <p className="mt-3 text-sm leading-7 text-text/90">{current.body}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {current.href ? (
            <Button asChild variant="secondary" size="sm">
              <Link href={current.href}>
                {current.actionLabel ?? "Reflect"}
                <Play className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" size="sm">
              {current.actionLabel ?? "Reflect"}
            </Button>
          )}
          <span className="text-xs text-muted">
            Keep the pace steady. Small repetitions are what change the shape of a day.
          </span>
        </div>
      </div>
    </Card>
  );
}
