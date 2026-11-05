"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpenText, Filter, HeartPulse, Lightbulb, MessageSquareQuote, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { AdminReflectionRecord } from "@/lib/admin/content";
import { formatShortDate } from "@/lib/utils";

const CATEGORIES = ["All", "Prompt", "Journal", "Insight", "Mood"] as const;
type Category = (typeof CATEGORIES)[number];

const categoryIcon = {
  Prompt: MessageSquareQuote,
  Journal: BookOpenText,
  Insight: Lightbulb,
  Mood: HeartPulse,
};

function wordCount(value: string | null) {
  return value?.trim() ? value.trim().split(/\s+/).length : 0;
}

export function ReflectionsAdminPanel({ records }: { records: AdminReflectionRecord[] }) {
  const [category, setCategory] = useState<Category>("All");
  const [lesson, setLesson] = useState("All lessons");
  const [query, setQuery] = useState("");

  const lessons = useMemo(
    () => [...new Set(records.map((record) => record.lessonTitle))].sort((a, b) => a.localeCompare(b)),
    [records]
  );
  const stats = useMemo(() => ({
    prompts: records.filter((record) => record.category === "Prompt").length,
    journals: records.filter((record) => record.category === "Journal").length,
    insights: records.filter((record) => record.category === "Insight").length,
    moods: records.filter((record) => record.category === "Mood").length,
    members: new Set(records.filter((record) => record.memberId).map((record) => record.memberId)).size,
  }), [records]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return records.filter((record) => {
      if (category !== "All" && record.category !== category) return false;
      if (lesson !== "All lessons" && record.lessonTitle !== lesson) return false;
      if (!normalized) return true;
      return [record.title, record.content, record.lessonTitle, record.memberName, record.subtype]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized));
    });
  }, [category, lesson, query, records]);

  return (
    <div className="space-y-6">
      <section>
        <Badge variant="forest">Live data</Badge>
        <h1 className="mt-3 text-2xl font-semibold text-text">Reflections</h1>
        <p className="mt-1 text-sm text-muted">Review lesson prompts and member journal, insight, and mood responses.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Lesson prompts", stats.prompts],
          ["Journal responses", stats.journals],
          ["Saved insights", stats.insights],
          ["Mood check-ins", stats.moods],
          ["Members reflected", stats.members],
        ].map(([label, value]) => (
          <Card key={String(label)} variant="mist" padding="sm">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
          </Card>
        ))}
      </section>

      <Card variant="default" padding="md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search response, member, lesson, or prompt" className="w-full rounded-xl border border-mist bg-cream py-2.5 pl-10 pr-3 text-sm text-text outline-none transition focus:border-sage" />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted"><Filter className="h-4 w-4" /><span className="sr-only">Filter by lesson</span><select value={lesson} onChange={(event) => setLesson(event.target.value)} className="rounded-xl border border-mist bg-cream px-3 py-2.5 text-sm text-text outline-none focus:border-sage"><option>All lessons</option>{lessons.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={category === item ? "rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-cream" : "rounded-full border border-mist bg-cream px-3 py-1.5 text-xs font-semibold text-muted hover:border-sage"}>{item}{item !== "All" ? ` (${records.filter((record) => record.category === item).length})` : ` (${records.length})`}</button>)}
        </div>
      </Card>

      <p className="text-sm text-muted">{filtered.length} record{filtered.length === 1 ? "" : "s"} shown</p>

      <section className="space-y-3">
        {filtered.map((record) => {
          const Icon = categoryIcon[record.category];
          return <Card key={record.id} variant="default" padding="lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-sage/15 text-forest"><Icon className="h-4 w-4" /></span><Badge variant={record.isResponse ? "sage" : "forest"}>{record.subtype}</Badge><span className="text-xs text-muted">{formatShortDate(record.recordedAt)}</span></div>
                <h2 className="mt-3 text-lg font-semibold text-text">{record.title}</h2>
                {record.content ? <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-text">{record.content}</p> : <p className="mt-3 text-sm italic text-muted">No written response.</p>}
                <div className="mt-4 flex flex-wrap gap-2"><Badge variant="muted">{record.lessonTitle}</Badge>{record.memberName ? <Badge variant="muted">{record.memberName}</Badge> : null}{record.content ? <Badge variant="muted">{wordCount(record.content)} words</Badge> : null}</div>
              </div>
              {record.memberId ? <Link href={`/admin/users/${record.memberId}`} className="shrink-0 text-sm font-semibold text-forest underline underline-offset-4">Open member</Link> : null}
            </div>
          </Card>;
        })}
        {filtered.length === 0 ? <Card variant="default" padding="lg"><p className="text-sm text-muted">No reflections match these filters.</p></Card> : null}
      </section>
    </div>
  );
}
