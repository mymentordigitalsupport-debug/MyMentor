import { Card } from "@/components/ui/Card";

interface TodayStatCardProps {
  title: string;
  subtitle: string;
  icon: string;
  action?: string;
  value?: string;
}

export function TodayStatCard({
  title,
  subtitle,
  icon,
  action,
  value,
}: TodayStatCardProps) {
  return (
    <Card variant="default" padding="md" className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <span className="text-2xl" aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className="font-serif text-sm font-semibold text-forest leading-snug">
        {title}
      </h3>
      <p className="text-xs text-muted leading-relaxed">{subtitle}</p>
      {value && (
        <p className="text-xs font-medium text-forest mt-1">{value}</p>
      )}
      {action && (
        <button className="text-xs font-medium text-sage hover:text-forest transition-colors mt-1 text-left">
          {action}
        </button>
      )}
    </Card>
  );
}
