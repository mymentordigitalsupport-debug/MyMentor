import { Card } from "@/components/ui/Card";

interface WelcomeBlockContent {
  heading?: string;
  message?: string;
}

export function WelcomeBlock({ content }: { content: WelcomeBlockContent }) {
  return (
    <Card variant="sage" padding="lg" className="text-center">
      <div className="text-4xl mb-4" aria-hidden="true">🌱</div>
      {content.heading && (
        <h2 className="font-serif text-2xl text-forest font-semibold mb-3 leading-snug">
          {content.heading}
        </h2>
      )}
      {content.message && (
        <p className="text-muted text-base leading-relaxed">{content.message}</p>
      )}
    </Card>
  );
}
