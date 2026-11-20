import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { percent } from "@/lib/utils";
import { PaperPin, PaperSurface, PaperTape } from "@/components/threads/ThreadPaper";
import styles from "@/components/threads/ThreadsCommunity.module.css";
import { LockKeyhole } from "lucide-react";

interface ChapterCardProps {
  courseId: string;
  chapterId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  isLocked?: boolean;
  lockedUntilChapter?: number;
}

export function ChapterCard({
  courseId,
  chapterId,
  title,
  description,
  sortOrder,
  lessonsCompleted,
  lessonsTotal,
  isLocked = false,
  lockedUntilChapter,
}: ChapterCardProps) {
  const pct = percent(lessonsCompleted, lessonsTotal);
  const isComplete = lessonsTotal > 0 && lessonsCompleted === lessonsTotal;

  const content = (
    <div
      className={`${styles.conversation} ${isLocked ? "cursor-not-allowed opacity-70" : ""}`}
      aria-disabled={isLocked || undefined}
    >
      <PaperSurface seed={sortOrder + 140} warm={sortOrder % 2 === 0} />
      {sortOrder % 3 === 0 ? <PaperTape className={styles.conversationTape} /> : <PaperPin className={styles.conversationPinLeft} />}
      <Card
        variant="default"
        className={`relative z-[1] border-0 bg-transparent shadow-none hover:shadow-none transition-all duration-200 ${
          isComplete ? "border-sage/40 bg-sage/5" : ""
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-semibold shrink-0 ${
              isComplete ? "bg-sage text-cream" : "bg-mist text-muted"
            }`}
            aria-hidden="true"
          >
            {isComplete ? "✓" : sortOrder}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h3 className="font-medium text-text leading-snug">{title}</h3>
              {isLocked ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-mist px-3 py-1 text-xs font-semibold text-forest">
                  <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                  Locked
                </span>
              ) : null}
            </div>
            {description && (
              <p className="text-xs text-muted leading-relaxed mb-3">{description}</p>
            )}
            {isLocked ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-forest">
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Locked until Chapter {lockedUntilChapter} is finished
              </p>
            ) : (
              <div className="flex items-center gap-3">
                <ProgressBar value={pct} size="sm" className="flex-1" />
                <span className="text-xs text-muted shrink-0">
                  {lessonsCompleted}/{lessonsTotal}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  return isLocked ? content : (
    <Link href={`/course/${courseId}/${chapterId}`} className="block">
      {content}
    </Link>
  );
}


