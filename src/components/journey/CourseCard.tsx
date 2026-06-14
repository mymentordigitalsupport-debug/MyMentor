import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { percent } from "@/lib/utils";

interface CourseCardProps {
  courseId: string;
  title: string;
  description: string | null;
  guidancePath: string;
  lessonsCompleted: number;
  lessonsTotal: number;
}

export function CourseCard({
  courseId,
  title,
  description,
  guidancePath,
  lessonsCompleted,
  lessonsTotal,
}: CourseCardProps) {
  const pct = percent(lessonsCompleted, lessonsTotal);

  return (
    <Link href={`/course/${courseId}`}>
      <Card variant="elevated" className="hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant={guidancePath === "christian" ? "gold" : "sage"}>
            {guidancePath === "christian" ? "Christian Guided" : "Religious Guidance"}
          </Badge>
          {pct > 0 && (
            <span className="text-xs text-muted">{pct}% complete</span>
          )}
        </div>

        <h3 className="font-serif text-xl text-forest font-semibold mb-2 leading-snug">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-muted leading-relaxed mb-4">{description}</p>
        )}

        {lessonsTotal > 0 && (
          <ProgressBar value={pct} size="sm" />
        )}
      </Card>
    </Link>
  );
}
