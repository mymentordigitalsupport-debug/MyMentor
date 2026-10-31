"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Cloud, CloudRain, Heart, Leaf, LoaderCircle, ShieldCheck, Smile, Sun, Sunrise } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type MoodValue, MOOD_OPTIONS } from "@/types";
import { PaperSurface, PaperTape } from "@/components/threads/ThreadPaper";

interface MoodCheckInProps {
  userId: string;
  latestMood: MoodValue | null;
  latestMoodAt: string | null;
  latestNote: string | null;
  moodHistory: Array<{ id: string; mood: MoodValue; created_at: string; note: string | null }>;
  todayCheckinId: string | null;
}

const moodIcons = { low: CloudRain, heavy: Cloud, uncertain: Smile, hopeful: Sunrise, steady: Leaf, strong: Sun };

export function MoodCheckIn({ userId, latestMood, latestNote, todayCheckinId }: MoodCheckInProps) {
  const router = useRouter();
  const noteId = useId();
  const [selected, setSelected] = useState<MoodValue | null>(latestMood);
  const [note, setNote] = useState(latestMood ? latestNote ?? "" : "");
  const [saved, setSaved] = useState(Boolean(latestMood));
  const [saving, setSaving] = useState(false);
  const [checkinId, setCheckinId] = useState(todayCheckinId);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!selected || saving) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const payload = { mood: selected, mood_label: selected, note: note.trim() || null };
      if (checkinId) {
        const result = await supabase.from("mood_checkins").update(payload).eq("id", checkinId).eq("user_id", userId);
        if (result.error) throw result.error;
      } else {
        const result = await supabase.from("mood_checkins").insert({ user_id: userId, ...payload }).select("id").single();
        if (result.error) throw result.error;
        setCheckinId(result.data.id);
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Your check-in couldn’t be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="daily-check-in" className="member-panel member-mood-panel" aria-labelledby="mood-title">
      <PaperSurface seed={18} /><PaperTape className="member-mood-tape" />
      <div className="member-panel-heading">
        <div><p className="member-eyebrow"><Heart size={13} /> A MOMENT FOR YOU</p><h2 id="mood-title">How’s your heart today?</h2></div>
        <span className={`member-status ${saved ? "member-status-saved" : ""}`}>{saved ? <><Check size={12} /> Checked in</> : "Daily check-in"}</span>
      </div>
      <p className="member-panel-description">Whatever you’re feeling, there’s room for it here.</p>
      <div className="member-moods" role="group" aria-label="Choose your mood">
        {MOOD_OPTIONS.map((option) => {
          const Icon = moodIcons[option.value];
          return <button key={option.value} type="button" className={`member-mood-choice ${selected === option.value ? "member-mood-selected" : ""}`} aria-pressed={selected === option.value} disabled={saving} onClick={() => { setSelected(option.value); setSaved(false); setError(null); }}><span><Icon size={23} strokeWidth={1.5} /></span>{option.label}</button>;
        })}
      </div>
      <label className="member-note-label" htmlFor={noteId}>A little more on your mind? <span>Optional</span></label>
      <textarea id={noteId} className="member-mood-note" value={note} disabled={saving} maxLength={2000} onChange={(event) => { setNote(event.target.value); setSaved(false); }} rows={2} placeholder="Let it out. This space is yours." />
      {error && <p className="member-form-error" role="alert">{error}</p>}
      <div className="member-mood-footer">
        <span className="member-private-note"><ShieldCheck size={14} /> Only visible to you</span>
        <button type="button" className="member-action member-action-forest" onClick={handleSave} disabled={!selected || saving || saved}>
          {saving ? <><LoaderCircle className="member-spin" size={15} /> Saving</> : saved ? <><Check size={15} /> Saved for today</> : <>{checkinId ? "Update check-in" : "Save check-in"}<Check size={15} /></>}
        </button>
      </div>
      <span className="member-sr-only" role="status">{saved ? "Your mood check-in is saved." : ""}</span>
    </section>
  );
}
