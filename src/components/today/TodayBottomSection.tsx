import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function TodayBottomSection() {
  return (
    <div className="space-y-3">
      <Card variant="gold" padding="md">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">
            🌸
          </span>
          <div className="flex-1">
            <h3 className="font-serif text-sm font-semibold text-forest mb-1">
              Encouragement
            </h3>
            <p className="text-xs text-forest italic mb-3">
              "You don't have to be perfect to make progress."
            </p>
            <p className="text-xs text-muted">— You've got this.</p>
          </div>
        </div>
      </Card>

      <Card variant="default" padding="md">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">
            💬
          </span>
          <div className="flex-1">
            <h3 className="font-serif text-sm font-semibold text-forest mb-1">
              Need to talk?
            </h3>
            <p className="text-xs text-muted mb-3">
              Message a mentor or join a support circle.
            </p>
            <Button variant="secondary" size="sm">
              Connect
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
