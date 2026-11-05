"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, MessageSquare, Plus, ThumbsUp, Trash2 } from "lucide-react";

type Topic = { id: string; name: string; count: number };
type Entry = { id: string; author_name: string; email: string | null; topic: string; body: string; parent_id: string | null; created_at: string; likes: number };
type BanRecord = { id: string; normalized_email: string; reason: string | null; created_at: string };
type Data = { stats: { threads: number; comments: number; likes: number; bans: number }; topics: Topic[]; entries: Entry[]; bans: BanRecord[]; error?: string };

export function ThreadsModerationPanel() {
  const [data, setData] = useState<Data | null>(null);
  const [topicName, setTopicName] = useState("");
  const [banEmail, setBanEmail] = useState("");
  const [banReason, setBanReason] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/threads", { cache: "no-store" });
    const body = await response.json().catch(() => ({})) as Data;
    if (!response.ok) { setError(body.error ?? "Unable to load Threads."); return; }
    setData(body); setError("");
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function action(action: string, values: Record<string, string> = {}) {
    const response = await fetch("/api/admin/threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...values }) });
    const body = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) { setError(body.error ?? "Action failed."); return false; }
    await load();
    return true;
  }

  if (!data) return <p className="text-sm text-muted">Loading Threads moderation…</p>;
  const cards = [{ label: "Threads", value: data.stats.threads, icon: MessageSquare }, { label: "Comments", value: data.stats.comments, icon: MessageSquare }, { label: "Likes", value: data.stats.likes, icon: ThumbsUp }, { label: "Banned emails", value: data.stats.bans, icon: Ban }];

  return <div className="space-y-6">
    {error && <p className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-mist bg-cream p-5 shadow-sm"><Icon className="h-5 w-5 text-forest" /><p className="mt-4 text-3xl font-bold text-text">{value}</p><p className="mt-1 text-sm text-muted">{label}</p></div>)}</section>
    <section className="rounded-2xl border border-mist bg-cream p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-text">Browse by topic</h2><p className="text-sm text-muted">Create or remove community topics.</p></div><form className="flex gap-2" onSubmit={async (event) => { event.preventDefault(); if (await action("create-topic", { name: topicName })) setTopicName(""); }}><input value={topicName} onChange={(event) => setTopicName(event.target.value)} placeholder="New topic" className="rounded-xl border border-mist bg-white px-3 py-2 text-sm" /><button className="inline-flex items-center gap-1 rounded-xl bg-forest px-3 py-2 text-sm font-semibold text-cream"><Plus size={15} />Add</button></form></div><div className="mt-4 flex flex-wrap gap-2">{data.topics.map((topic) => <span key={topic.id} className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-sage/10 px-3 py-1.5 text-sm text-forest">{topic.name} <b>{topic.count}</b>{topic.name !== "Community" && <button type="button" aria-label={`Delete ${topic.name}`} onClick={() => { if (window.confirm(`Delete ${topic.name}? Existing posts move to Community.`)) void action("delete-topic", { id: topic.id }); }}><Trash2 size={14} /></button>}</span>)}</div></section>
    <section className="rounded-2xl border border-mist bg-cream p-5 shadow-sm"><h2 className="text-lg font-semibold text-text">Ban email from commenting</h2><form className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]" onSubmit={async (event) => { event.preventDefault(); if (await action("ban-email", { email: banEmail, reason: banReason })) { setBanEmail(""); setBanReason(""); } }}><input type="email" value={banEmail} onChange={(event) => setBanEmail(event.target.value)} placeholder="email@example.com" required className="rounded-xl border border-mist bg-white px-3 py-2 text-sm" /><input value={banReason} onChange={(event) => setBanReason(event.target.value)} placeholder="Reason (optional)" className="rounded-xl border border-mist bg-white px-3 py-2 text-sm" /><button className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white">Ban email</button></form>{data.bans.length > 0 && <div className="mt-4 space-y-2">{data.bans.map((ban) => <div key={ban.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sand px-3 py-2 text-sm"><span><b>{ban.normalized_email}</b>{ban.reason ? ` — ${ban.reason}` : ""}</span><button className="text-forest underline" onClick={() => void action("unban-email", { id: ban.id })}>Remove ban</button></div>)}</div>}</section>
    <section className="rounded-2xl border border-mist bg-cream shadow-sm"><div className="border-b border-mist px-5 py-4"><h2 className="text-lg font-semibold text-text">Threads and comments</h2><p className="text-sm text-muted">Delete any article/thread or comment.</p></div><div className="divide-y divide-mist">{data.entries.map((entry) => <article key={entry.id} className="flex gap-4 px-5 py-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-x-3 text-xs text-muted"><b className="text-forest">{entry.parent_id ? "Comment" : "Thread"}</b><span>{entry.topic}</span><span>{entry.author_name}</span>{entry.email && <span>{entry.email}</span>}<span>{entry.likes} likes</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-text">{entry.body || "Attachment only"}</p></div><button type="button" className="self-center rounded-lg p-2 text-danger hover:bg-danger/10" aria-label="Delete entry" onClick={() => { if (window.confirm("Delete this entry?")) void action("delete-entry", { id: entry.id }); }}><Trash2 size={18} /></button></article>)}{data.entries.length === 0 && <p className="px-5 py-8 text-sm text-muted">No Threads activity yet.</p>}</div></section>
  </div>;
}
