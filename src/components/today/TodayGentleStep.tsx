"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { type Lesson } from "@/types";

interface TodayGentleStepProps {
  lesson: Lesson & {
    ChapterId: string;
    courseId: string;
    courseVersionId: string;
    ChapterName: string;
  };
}

export function TodayGentleStep({ lesson }: TodayGentleStepProps) {
  const href = `/course/${lesson.courseId}/${lesson.ChapterId}/${lesson.id}`;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-text">Today&apos;s Gentle Step</h2>

      <Card variant="elevated" className="overflow-hidden p-0">
        <div className="flex gap-4">
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sage/20 to-forest/20">
            <span className="text-3xl" aria-hidden="true">
              *
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-between py-4 pr-4">
            <div>
              <Badge variant="sage" className="mb-2">
                {lesson.ChapterName}
              </Badge>
              <h3 className="mb-1 font-serif text-sm font-semibold leading-snug text-forest">
                {lesson.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted">{lesson.description}</p>
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs text-muted">
              {lesson.estimated_minutes && (
                <>
                  <span>{lesson.estimated_minutes} min</span>
                  <span>&bull;</span>
                </>
              )}
              <span>Lesson</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-mist/40 px-4 py-3">
          <Link href={href} className="flex-1">
            <Button variant="primary" size="sm" fullWidth>
              Start Session
            </Button>
          </Link>
          <button className="flex-shrink-0 px-3 py-2 text-xs text-muted transition-colors hover:text-text">
            Audio
          </button>
        </div>
      </Card>
    </div>
  );
}
