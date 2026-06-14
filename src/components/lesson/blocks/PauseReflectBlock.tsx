"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface PauseReflectBlockContent {
  question?: string;
  context?: string;
}

interface PauseReflectBlockProps {
  content: PauseReflectBlockContent;
  lessonId: string;
  userId: string;
}

export function PauseReflectBlock({ content, lessonId, userId }: PauseReflectBlockProps) {
  const [response, setResponse] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!response.trim()) return;
    setSaving(true);
    setError(null);

    const trimmedResponse = response.trim();
    const supabase = createSupabaseBrowserClient();
    const { error: insertError } = await supabase.from("saved_insights").insert({
      user_id: userId,
      lesson_id: lessonId,
      insight_text: trimmedResponse,
      text: trimmedResponse,
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
    <Card variant="mist" padding="md">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          ⏸
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Pause &amp; Reflect</p>
      </div>

      {content.question ? (
        <p className="mb-2 font-serif text-lg font-medium leading-snug text-forest">{content.question}</p>
      ) : null}

      {content.context ? (
        <p className="mb-4 text-sm italic leading-relaxed text-muted">{content.context}</p>
      ) : null}

      {!saved ? (
        <div className="flex flex-col gap-3">
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Take a moment to reflect..."
            rows={3}
          />
          {error ? (
            <p className="rounded-2xl border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button
            onClick={handleSave}
            variant="secondary"
            size="sm"
            loading={saving}
            disabled={!response.trim()}
          >
            Save Insight
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-sage/20 bg-sage/10 px-4 py-3">
          <p className="text-sm text-forest">Insight saved.</p>
        </div>
      )}
    </Card>
  );
}
