import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { percent } from "@/lib/utils";

interface ProgressSummaryProps {
  lessonsCompleted: number;
  lessonsTotal: number;
  courseName: string;
}

export function ProgressSummary({
  lessonsCompleted,
  lessonsTotal,
  courseName,
}: ProgressSummaryProps) {
  const pct = percent(lessonsCompleted, lessonsTotal);

  return (
    <Card variant="default" padding="md">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-text">Your Progress</p>
        <span className="text-xs text-muted">{lessonsCompleted} / {lessonsTotal} lessons</span>
      </div>
      <p className="text-xs text-muted mb-3 truncate">{courseName}</p>
      <ProgressBar value={pct} showPercent size="md" />
    </Card>
  );
}
