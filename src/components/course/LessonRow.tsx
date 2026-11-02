import Link from "next/link";
import { cn } from "@/lib/utils";
import { PaperSurface, PaperTape } from "@/components/threads/ThreadPaper";
import styles from "@/components/threads/ThreadsCommunity.module.css";

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
    <Link href={`/course/${courseId}/${chapterId}/${lessonId}`} className={styles.conversation}>
      <PaperSurface seed={sortOrder + 130} warm={sortOrder % 2 === 0} />
      {sortOrder % 3 === 0 && <PaperTape className={styles.conversationTape} />}
      <div className={cn(styles.conversationContent, "flex items-start gap-4 py-4")}>
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


