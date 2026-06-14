import { Card } from "@/components/ui/Card";

type CenteredPagePlaceholderProps = {
  title: string;
  description: string;
};

export function CenteredPagePlaceholder({ title, description }: CenteredPagePlaceholderProps) {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-10">
      <Card
        variant="default"
        padding="lg"
        className="w-full max-w-2xl text-center shadow-[0_18px_50px_-36px_rgba(31,42,36,0.22)]"
      >
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-forest">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">{description}</p>
      </Card>
    </div>
  );
}
