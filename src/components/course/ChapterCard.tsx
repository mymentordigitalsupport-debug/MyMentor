import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { percent } from "@/lib/utils";

interface ChapterCardProps {
  courseId: string;
  chapterId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessonsCompleted: number;
  lessonsTotal: number;
}

export function ChapterCard({
  courseId,
  chapterId,
  title,
  description,
  sortOrder,
  lessonsCompleted,
  lessonsTotal,
}: ChapterCardProps) {
  const pct = percent(lessonsCompleted, lessonsTotal);
  const isComplete = lessonsTotal > 0 && lessonsCompleted === lessonsTotal;

  return (
    <Link href={`/course/${courseId}/${chapterId}`}>
      <Card
        variant="default"
        className={`hover:shadow-md transition-all duration-200 ${
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
            <h3 className="font-medium text-text mb-1 leading-snug">{title}</h3>
            {description && (
              <p className="text-xs text-muted leading-relaxed mb-3">{description}</p>
            )}
            <div className="flex items-center gap-3">
              <ProgressBar value={pct} size="sm" className="flex-1" />
              <span className="text-xs text-muted shrink-0">
                {lessonsCompleted}/{lessonsTotal}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}


