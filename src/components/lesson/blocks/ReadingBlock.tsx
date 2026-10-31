import { Card } from "@/components/ui/Card";

interface ReadingBlockContent {
  title?: string;
  body?: string;
}

export function ReadingBlock({ content }: { content: ReadingBlockContent }) {
  const paragraphs = content.body?.split("\n\n") ?? [];

  return (
    <Card variant="default" padding="lg">
      {content.title && (
        <h3 className="font-serif text-xl text-forest font-semibold mb-4">
          {content.title}
        </h3>
      )}
      <div className="flex flex-col gap-4">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-text text-base leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </Card>
  );
}
