"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { type Lesson } from "@/types";
import Image from "next/image";

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
      <h2 className="text-sm font-medium text-text">Today's Gentle Step</h2>
      
      <Card variant="elevated" className="overflow-hidden p-0">
        <div className="flex gap-4">
          {/* Lesson image/thumbnail */}
          <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-sage/20 to-forest/20 rounded-2xl overflow-hidden flex items-center justify-center">
            <span className="text-3xl" aria-hidden="true">
              🧘
            </span>
          </div>

          {/* Lesson content */}
          <div className="flex-1 py-4 pr-4 flex flex-col justify-between">
            <div>
              <Badge variant="sage" className="mb-2">
                {lesson.ChapterName}
              </Badge>
              <h3 className="font-serif text-sm font-semibold text-forest leading-snug mb-1">
                {lesson.title}
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                {lesson.description}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-3 mt-3 text-xs text-muted">
              {lesson.estimated_minutes && (
                <>
                  <span>⏱️ {lesson.estimated_minutes} min</span>
                  <span>•</span>
                </>
              )}
              <span>📚 Lesson</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-mist/40 px-4 py-3 flex gap-2">
          <Link href={href} className="flex-1">
            <Button variant="primary" size="sm" fullWidth>
              Start Session
            </Button>
          </Link>
          <button className="px-3 py-2 text-xs text-muted hover:text-text transition-colors flex-shrink-0">
            🔊
          </button>
        </div>
      </Card>
    </div>
  );
}
