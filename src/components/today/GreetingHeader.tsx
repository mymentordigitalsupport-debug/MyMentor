import { getGreeting } from "@/lib/utils";

interface GreetingHeaderProps {
  displayName: string;
}

export function GreetingHeader({ displayName }: GreetingHeaderProps) {
  const greeting = getGreeting();

  return (
    <div className="pt-10 pb-2">
      <p className="text-muted text-sm mb-1">{greeting}</p>
      <h1 className="font-serif text-3xl text-forest font-semibold leading-snug">
        {displayName} <span aria-hidden="true">🌱</span>
      </h1>
      <p className="text-muted text-sm mt-2 leading-relaxed">
        You&apos;ve already taken a meaningful step today.
      </p>
    </div>
  );
}
