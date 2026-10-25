"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type MoodValue, MOOD_OPTIONS } from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { MoodPill } from "@/components/ui/MoodPill";

interface JournalEditorProps {
  userId: string;
}

export function JournalEditor({ userId }: JournalEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<MoodValue | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!body.trim()) return;
    setSaving(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { data, error: saveError } = await supabase
      .from("journal_entries")
      .insert({
        user_id: userId,
        title: title.trim() || null,
        body: body.trim(),
        entry_text: body.trim(),
        mood: mood ?? null,
        mood_label: mood ?? null,
        is_private: true,
      })
      .select("id")
      .single();

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    if (data) {
      router.push(`/journal/${data.id}`);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Give this entry a name…"
      />

      <Textarea
        label="Your reflection"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write freely. This is your private space…"
        rows={8}
      />

      <div>
        <p className="text-sm font-medium text-text mb-3">How are you feeling?</p>
        <div className="grid grid-cols-3 gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <MoodPill
              key={opt.value}
              option={opt}
              selected={mood === opt.value}
              onClick={() => setMood(mood === opt.value ? null : opt.value)}
            />
          ))}
        </div>
      </div>

      {error ? <p className="rounded-2xl border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <Button
        onClick={handleSave}
        fullWidth
        size="lg"
        loading={saving}
        disabled={!body.trim()}
      >
        Save Entry
      </Button>
    </div>
  );
}
