"use client";

import { useState } from "react";
import { FilePenLine, Save, X } from "lucide-react";
import type { AdminContentItem } from "@/lib/admin/content";

export function AdminResourceManager({ items }: { items: AdminContentItem[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const begin = (item: AdminContentItem) => { setEditing(item.id); setTitle(item.title); setDescription(item.description ?? ""); setMessage(""); };
  async function save(item: AdminContentItem) {
    setBusy(true);
    const response = await fetch("/api/admin/resources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resourceId: item.storagePath ? undefined : item.id, path: item.storagePath, title, description, category: item.details[0] }) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    setBusy(false);
    if (!response.ok) { setMessage(data.error ?? "Unable to save."); return; }
    window.location.reload();
  }
  return <div className="space-y-4">{message && <p className="text-sm text-danger">{message}</p>}{items.map((item) => <article key={item.id} className="rounded-2xl border border-mist bg-cream p-5 shadow-sm"><div className="flex flex-col gap-4 md:flex-row md:justify-between"><div className="min-w-0 flex-1">{editing === item.id ? <div className="space-y-3"><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} className="w-full rounded-lg border border-mist bg-white px-3 py-2 text-lg font-semibold text-text" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} placeholder="Optional description" className="min-h-20 w-full rounded-lg border border-mist bg-white px-3 py-2 text-sm" /></div> : <><h2 className="text-lg font-semibold text-text">{item.title}</h2><p className="mt-2 text-sm text-muted">{item.description ?? "No description."}</p></>}<div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">{item.details.map((detail) => <span key={detail} className="rounded-full bg-mist px-2 py-1">{detail}</span>)}</div></div>{editing === item.id ? <div className="flex gap-2"><button type="button" disabled={busy || !title.trim()} onClick={() => void save(item)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-forest px-3 text-sm font-semibold text-cream disabled:opacity-50"><Save size={15} />Save</button><button type="button" onClick={() => setEditing(null)} className="grid h-10 w-10 place-items-center rounded-lg border border-mist"><X size={16} /></button></div> : <button type="button" onClick={() => begin(item)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-forest px-3 text-sm font-semibold text-cream"><FilePenLine size={15} />Edit details</button>}</div></article>)}</div>;
}
