import Link from "next/link";
import { cn } from "@/lib/utils";

interface LessonRowProps {
  courseId: string;
  chapterId: string;
  lessonId: string;
  title: string;
  description: string | null;
  estimatedMinutes: number | null;
  sortOrder: number;
  isCompleted: boolean;
}

export function LessonRow({
  courseId,
  chapterId,
  lessonId,
  title,
  description,
  estimatedMinutes,
  sortOrder,
  isCompleted,
}: LessonRowProps) {
  return (
    <Link href={`/course/${courseId}/${chapterId}/${lessonId}`}>
      <div
        className={cn(
          "flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200",
          "hover:shadow-sm hover:border-sage/40",
          isCompleted
            ? "bg-sage/5 border-sage/20"
            : "bg-cream border-mist"
        )}
      >
        {/* Lesson number / check */}
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-medium shrink-0 mt-0.5",
            isCompleted
              ? "bg-sage text-cream"
              : "bg-mist text-muted"
          )}
          aria-hidden="true"
        >
          {isCompleted ? "✓" : sortOrder}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-medium leading-snug mb-0.5",
              isCompleted ? "text-muted line-through" : "text-text"
            )}
          >
            {title}
          </p>
          {description && (
            <p className="text-xs text-muted leading-relaxed">{description}</p>
          )}
        </div>

        {estimatedMinutes && (
          <span className="text-xs text-muted shrink-0 mt-1">
            {estimatedMinutes}m
          </span>
        )}
      </div>
    </Link>
  );
}


