import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { type Lesson } from "@/types";

interface TodayLessonCardProps {
  lesson: Lesson & {
    ChapterId: string;
    courseId: string;
    courseVersionId: string;
    ChapterName: string;
  };
  isCompleted: boolean;
}

export function TodayLessonCard({ lesson, isCompleted }: TodayLessonCardProps) {
  const href = `/course/${lesson.courseId}/${lesson.ChapterId}/${lesson.id}`;

  return (
    <Card variant="elevated" className="overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-sage to-forest -mx-6 -mt-6 mb-6" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <Badge variant="sage">{lesson.ChapterName}</Badge>
        {lesson.estimated_minutes && (
          <span className="text-xs text-muted">{lesson.estimated_minutes} min</span>
        )}
      </div>

      <h2 className="font-serif text-xl text-forest font-semibold mb-2 leading-snug">
        {lesson.title}
      </h2>

      {lesson.description && (
        <p className="text-muted text-sm leading-relaxed mb-5">
          {lesson.description}
        </p>
      )}

      <Link href={href}>
        <Button
          variant={isCompleted ? "secondary" : "primary"}
          fullWidth
        >
          {isCompleted ? "Review Lesson" : "Start Session"}
        </Button>
      </Link>
    </Card>
  );
}
