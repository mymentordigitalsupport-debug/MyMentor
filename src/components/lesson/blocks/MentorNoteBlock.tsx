import { Card } from "@/components/ui/Card";

interface MentorNoteBlockContent {
  note?: string;
}

export function MentorNoteBlock({ content }: { content: MentorNoteBlockContent }) {
  return (
    <Card variant="gold" padding="md">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5 shrink-0" aria-hidden="true">💬</span>
        <div>
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-2">
            Mentor&apos;s Note
          </p>
          <p className="text-forest text-base leading-relaxed italic">
            &ldquo;{content.note}&rdquo;
          </p>
        </div>
      </div>
    </Card>
  );
}
