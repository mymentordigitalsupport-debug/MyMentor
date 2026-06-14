"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface JournalPromptBlockContent {
  prompt?: string;
}

interface JournalPromptBlockProps {
  content: JournalPromptBlockContent;
  lessonId: string;
  userId: string;
}

export function JournalPromptBlock({ content, lessonId, userId }: JournalPromptBlockProps) {
  const [entry, setEntry] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!entry.trim()) return;
    setSaving(true);
    setError(null);

    const trimmedEntry = entry.trim();
    const supabase = createSupabaseBrowserClient();
    const { error: insertError } = await supabase.from("journal_entries").insert({
      user_id: userId,
      lesson_id: lessonId,
      entry_text: trimmedEntry,
      body: trimmedEntry,
      title: content.prompt?.slice(0, 60) ?? "Lesson Reflection",
      is_private: false,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
  }

  return (
    <Card variant="default" padding="md">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          📓
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Journal Prompt</p>
      </div>

      {content.prompt ? (
        <p className="mb-4 font-serif text-lg font-medium leading-snug text-forest">{content.prompt}</p>
      ) : null}

      {!saved ? (
        <div className="flex flex-col gap-3">
          <Textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write your thoughts here..."
            rows={5}
          />
          {error ? (
            <p className="rounded-2xl border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              variant="primary"
              size="sm"
              loading={saving}
              disabled={!entry.trim()}
              className="flex-1"
            >
              Save to Journal
            </Button>
            <Button onClick={() => setSaved(true)} variant="ghost" size="sm">
              Skip
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-sage/20 bg-sage/10 px-4 py-3">
          <p className="text-sm text-forest">Saved to your journal.</p>
        </div>
      )}
    </Card>
  );
}
