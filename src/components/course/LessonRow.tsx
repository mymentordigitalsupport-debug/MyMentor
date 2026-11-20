import Link from "next/link";
import { LockKeyhole } from "lucide-react";
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
  isLocked?: boolean;
  lockMessage?: string;
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
  isLocked = false,
  lockMessage,
}: LessonRowProps) {
  const content = (
    <div
      className={cn(styles.conversation, isLocked && "cursor-not-allowed opacity-70")}
      aria-disabled={isLocked || undefined}
    >
      <PaperSurface seed={sortOrder + 130} warm={sortOrder % 2 === 0} />
      {sortOrder % 3 === 0 ? <PaperTape className={styles.conversationTape} /> : null}
      <div className={cn(styles.conversationContent, "flex items-start gap-4 py-4")}>
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-medium shrink-0 mt-0.5",
            isLocked
              ? "bg-mist text-forest"
              : isCompleted
                ? "bg-sage text-cream"
                : "bg-mist text-muted",
          )}
          aria-hidden="true"
        >
          {isLocked ? <LockKeyhole className="h-4 w-4" /> : isCompleted ? "✓" : sortOrder}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-medium leading-snug mb-0.5",
              isCompleted && !isLocked ? "text-muted line-through" : "text-text",
            )}
          >
            {title}
          </p>
          {description ? <p className="text-xs text-muted leading-relaxed">{description}</p> : null}
          {isLocked ? (
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-forest">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              {lockMessage ?? "Locked until the previous lesson is finished"}
            </p>
          ) : null}
        </div>

        {isLocked ? (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-forest/15 bg-mist px-3 py-1 text-xs font-semibold text-forest sm:inline-flex">
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
            Locked
          </span>
        ) : estimatedMinutes ? (
          <span className="text-xs text-muted shrink-0 mt-1">{estimatedMinutes}m</span>
        ) : null}
      </div>
    </div>
  );

  return isLocked ? content : (
    <Link href={`/course/${courseId}/${chapterId}/${lessonId}`} className="block">
      {content}
    </Link>
  );
}
