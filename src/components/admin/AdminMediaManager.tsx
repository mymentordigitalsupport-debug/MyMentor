"use client";

import { useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AdminContentItem } from "@/lib/admin/content";

export function AdminMediaManager({ items }: { items: AdminContentItem[] }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function api(body: Record<string, unknown>) {
    const response = await fetch("/api/admin/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({})) as Record<string, string>;
    if (!response.ok) throw new Error(data.error ?? "Audio operation failed.");
    return data;
  }

  async function upload(form: HTMLFormElement) {
    const data = new FormData(form);
    const file = data.get("file");
    const title = String(data.get("title") ?? "").trim();
    if (!(file instanceof File) || !title) return;
    setBusy(true);
    setMessage("");
    try {
      const signed = await api({ action: "createUpload", filename: file.name });
      const supabase = createSupabaseBrowserClient();
      const result = await supabase.storage.from("media").uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });
      if (result.error) throw result.error;
      await api({ action: "create", title, path: signed.path });
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this audio track?")) return;
    setBusy(true);
    try {
      await api({ action: "delete", id: id.replace(/^audio-/, "") });
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
      setBusy(false);
    }
  }

  return <div className="space-y-5">
    <form onSubmit={(event) => { event.preventDefault(); void upload(event.currentTarget); }} className="grid gap-3 rounded-2xl border border-mist bg-cream p-5 md:grid-cols-2">
      <h2 className="text-lg font-semibold text-text md:col-span-2">Add audio</h2>
      <input name="title" required maxLength={180} placeholder="Audio title" className="rounded-xl border border-mist bg-white px-3 py-2.5" />
      <input name="file" required type="file" accept="audio/*,.m4a" className="rounded-xl border border-mist bg-white px-3 py-2.5" />
      <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 font-semibold text-cream disabled:opacity-50 md:col-span-2"><Upload size={16} />Upload audio</button>
    </form>
    {message ? <p role="alert" className="text-sm text-danger">{message}</p> : null}
    {items.map((item) => <article key={item.id} className="rounded-2xl border border-mist bg-cream p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0 flex-1"><h2 className="font-semibold text-text">{item.title}</h2>{item.description ? <audio controls preload="none" src={item.description} className="mt-3 w-full" /> : <p className="mt-2 text-sm text-danger">Audio file unavailable.</p>}<p className="mt-2 text-xs text-muted">{item.details.join(" · ")}</p></div><button type="button" disabled={busy} onClick={() => void remove(item.id)} aria-label={`Delete ${item.title}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-danger/30 text-danger"><Trash2 size={16} /></button></div></article>)}
    {!items.length ? <p className="rounded-2xl border border-mist bg-cream p-5 text-sm text-muted">No audio uploaded.</p> : null}
  </div>;
}
