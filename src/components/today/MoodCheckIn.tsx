"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type MoodValue, MOOD_OPTIONS } from "@/types";
import { MoodPill } from "@/components/ui/MoodPill";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatShortDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface MoodCheckInProps {
  userId: string;
  latestMood: MoodValue | null;
  latestMoodAt: string | null;
  latestNote: string | null;
  moodHistory: Array<{
    id: string;
    mood: MoodValue;
    created_at: string;
    note: string | null;
  }>;
  todayCheckinId: string | null;
}

export function MoodCheckIn({
  userId,
  latestMood,
  latestMoodAt,
  latestNote,
  moodHistory,
  todayCheckinId,
}: MoodCheckInProps) {
  const [selected, setSelected] = useState<MoodValue | null>(latestMood);
  const [note, setNote] = useState<string>(latestNote ?? "");
  const [saved, setSaved] = useState(!!latestMood);
  const [saving, setSaving] = useState(false);

  const moodCounts = moodHistory.reduce<Record<MoodValue, number>>(
    (counts, item) => {
      counts[item.mood] = (counts[item.mood] ?? 0) + 1;
      return counts;
    },
    { low: 0, heavy: 0, uncertain: 0, hopeful: 0, steady: 0, strong: 0 }
  );
  const topMood = (Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null) as MoodValue | null;
  const checkinsThisWeek = moodHistory.length;
  const canSave = Boolean(selected);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);

    const supabase = createSupabaseBrowserClient();
    const payload = {
      mood: selected,
      mood_label: selected,
      note: note.trim() || null,
    };

    if (todayCheckinId) {
      await supabase.from("mood_checkins").update(payload).eq("id", todayCheckinId);
    } else {
      await supabase.from("mood_checkins").insert({
        user_id: userId,
        ...payload,
      });
    }

    setSaved(true);
    setSaving(false);
  }

  return (
    <Card variant="mist" padding="md" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Mood check-in</p>
          <h3 className="mt-2 text-sm font-semibold text-text">How am I today?</h3>
        </div>
        <Badge variant="sage">{saved && selected ? "Saved" : "Draft"}</Badge>
      </div>

      <p className="text-xs leading-6 text-muted">
        {saved && selected
          ? `You marked yourself as ${selected}. Update it any time today.`
          : "Choose the mood that fits best right now, add a note if you want, and save it once."}
      </p>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-mist bg-cream p-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Today</p>
          <p className="mt-2 text-sm font-semibold text-forest capitalize">{selected ?? "unset"}</p>
        </div>
        <div className="rounded-2xl border border-mist bg-cream p-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">This week</p>
          <p className="mt-2 text-sm font-semibold text-forest">{checkinsThisWeek}</p>
        </div>
        <div className="rounded-2xl border border-mist bg-cream p-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Common</p>
          <p className="mt-2 text-sm font-semibold text-forest capitalize">{topMood ?? "none"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#eadfcf] bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {latestMoodAt ? `Last saved ${formatShortDate(latestMoodAt)}` : "No check-in saved yet"}
          </p>
          <p className="text-xs font-medium text-forest">
            {todayCheckinId ? "Updating today's entry" : "Saving today's entry"}
          </p>
        </div>
        {latestNote && (
          <p className="mt-2 text-xs leading-6 text-muted italic">
            &ldquo;{latestNote}&rdquo;
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MOOD_OPTIONS.map((opt) => (
          <MoodPill
            key={opt.value}
            option={opt}
            selected={selected === opt.value}
            onClick={() => {
              setSelected(opt.value);
              setSaved(false);
            }}
          />
        ))}
      </div>

      <Textarea
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
          setSaved(false);
        }}
        rows={3}
        placeholder="Optional custom feeling or short note"
        className="text-sm"
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] leading-5 text-muted">
          {saving
            ? "Saving..."
            : "This updates only today's mood card and keeps the rest of your history intact."}
        </p>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSave}
          loading={saving}
          disabled={!canSave}
        >
          {todayCheckinId ? "Update mood" : "Save mood"}
        </Button>
      </div>
    </Card>
  );
}
