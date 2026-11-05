import Link from "next/link";
import { formatShortDate, truncate } from "@/lib/utils";
import { type JournalEntry, MOOD_OPTIONS } from "@/types";
import { PaperSurface, PaperTape } from "@/components/threads/ThreadPaper";
import styles from "@/components/threads/ThreadsCommunity.module.css";
import { MoodImage } from "@/components/ui/MoodImage";

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const moodOption = MOOD_OPTIONS.find((m) => m.value === entry.mood);

  return (
    <Link href={`/journal/${entry.id}`} className={styles.conversation}>
      <PaperSurface seed={Number.parseInt(entry.id.replace(/\D/g, "").slice(-4), 10) || 7} />
      <PaperTape className={styles.conversationTape} />
      <article className={styles.conversationContent}>
        <div className={styles.conversationMeta}>
          <span className={styles.topicBadge}>Private reflection</span>
          <p className={styles.postAge}>{formatShortDate(entry.created_at)}</p>
          {moodOption && (
            <span className="inline-flex" aria-label={`Mood: ${moodOption.label}`}><MoodImage mood={moodOption.value} size={25} /></span>
          )}
        </div>

        {entry.title && (
          <h3>{entry.title}</h3>
        )}

        <p className={styles.conversationBody}>
          {truncate(entry.body, 120)}
        </p>
      </article>
    </Link>
  );
}
