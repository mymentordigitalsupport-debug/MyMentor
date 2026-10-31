import { Card } from "@/components/ui/Card";

interface DailyActionBlockContent {
  title?: string;
  action?: string;
}

export function DailyActionBlock({ content }: { content: DailyActionBlockContent }) {
  return (
    <Card variant="sage" padding="md">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5 shrink-0" aria-hidden="true">🎯</span>
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
            {content.title ?? "Your Step for Today"}
          </p>
          <p className="text-forest text-base leading-relaxed">
            {content.action}
          </p>
        </div>
      </div>
    </Card>
  );
}
