import Link from "next/link";
import { formatShortDate, truncate } from "@/lib/utils";
import { type JournalEntry, MOOD_OPTIONS } from "@/types";

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const moodOption = MOOD_OPTIONS.find((m) => m.value === entry.mood);

  return (
    <Link href={`/journal/${entry.id}`}>
      <div className="bg-cream border border-mist rounded-2xl p-5 hover:border-sage/40 hover:shadow-sm transition-all duration-200">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs text-muted">{formatShortDate(entry.created_at)}</p>
          {moodOption && (
            <span className="text-sm" aria-label={`Mood: ${moodOption.label}`}>
              {moodOption.emoji}
            </span>
          )}
        </div>

        {entry.title && (
          <p className="font-medium text-text mb-1 leading-snug">{entry.title}</p>
        )}

        <p className="text-sm text-muted leading-relaxed">
          {truncate(entry.body, 120)}
        </p>
      </div>
    </Link>
  );
}
