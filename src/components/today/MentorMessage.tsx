import { Card } from "@/components/ui/Card";

const MESSAGES = [
  "You do not need to solve your whole life today. One step is enough.",
  "Healing is not linear. Every honest moment counts.",
  "The fact that you showed up today matters more than you know.",
  "Progress is not always visible. Trust the process.",
  "You are not defined by your struggle. You are defined by your courage.",
  "Small steps, taken consistently, create lasting change.",
  "Be gentle with yourself today. You are doing the work.",
];

function getDailyMessage(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000
  );
  return MESSAGES[dayOfYear % MESSAGES.length] ?? MESSAGES[0]!;
}

export function MentorMessage() {
  const message = getDailyMessage();

  return (
    <Card variant="gold" padding="md">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5" aria-hidden="true">💬</span>
        <div>
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-2">
            From your mentor
          </p>
          <p className="text-sm text-forest leading-relaxed italic">
            &ldquo;{message}&rdquo;
          </p>
        </div>
      </div>
    </Card>
  );
}
