"use client";

import { useState } from "react";
import { FilePenLine, Save, Trash2, Upload, X } from "lucide-react";
import type { AdminContentItem } from "@/lib/admin/content";

export function AdminResourceManager({ items }: { items: AdminContentItem[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("reading");
  const [published, setPublished] = useState(false);
  const [order, setOrder] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function begin(item: AdminContentItem) {
    setEditing(item.id);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setCategory(["book", "reading", "worksheet", "support"].includes(item.details[0]) ? item.details[0] : "reading");
    setPublished(item.status === "Published");
    setOrder(Number(item.details.find((value) => value.startsWith("Order "))?.replace("Order ", "")) || 0);
    setMessage("");
  }

  async function request(body: Record<string, unknown> | FormData) {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/resources", {
      method: "POST",
      ...(body instanceof FormData ? { body } : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setMessage(data.error ?? "Unable to save.");
      return false;
    }
    window.location.reload();
    return true;
  }

  async function upload(form: HTMLFormElement) {
    await request(new FormData(form));
  }

  return <div className="space-y-5">
    <form onSubmit={(event) => { event.preventDefault(); void upload(event.currentTarget); }} className="grid gap-3 rounded-2xl border border-mist bg-cream p-5 md:grid-cols-2">
      <h2 className="text-lg font-semibold text-text md:col-span-2">Upload document</h2>
      <input name="title" required maxLength={180} placeholder="Member-facing title" className="rounded-xl border border-mist bg-white px-3 py-2.5" />
      <select name="category" className="rounded-xl border border-mist bg-white px-3 py-2.5"><option value="book">Book</option><option value="reading">Reading</option><option value="worksheet">Worksheet</option><option value="support">Support guide</option></select>
      <textarea name="description" maxLength={500} placeholder="Optional description" className="rounded-xl border border-mist bg-white px-3 py-2.5 md:col-span-2" />
      <input name="file" required type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" className="rounded-xl border border-mist bg-white px-3 py-2.5" />
      <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 font-semibold text-cream disabled:opacity-50"><Upload size={16} />Upload as draft</button>
    </form>
    {message && <p className="text-sm text-danger" role="alert">{message}</p>}
    {items.map((item) => {
      const storageOnly = item.id.startsWith("storage:");
      return <article key={item.id} className="rounded-2xl border border-mist bg-cream p-5 shadow-sm"><div className="flex flex-col gap-4 md:flex-row md:justify-between"><div className="min-w-0 flex-1">{editing === item.id ? <div className="grid gap-3 md:grid-cols-2"><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} className="rounded-lg border border-mist bg-white px-3 py-2 font-semibold" /><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-mist bg-white px-3 py-2"><option value="reading">Reading</option><option value="worksheet">Worksheet</option><option value="support">Support guide</option></select><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} placeholder="Optional description" className="min-h-20 rounded-lg border border-mist bg-white px-3 py-2 text-sm md:col-span-2" /><label className="text-sm">Order<input type="number" min={0} value={order} onChange={(event) => setOrder(Number(event.target.value))} className="ml-2 w-24 rounded-lg border border-mist px-2 py-1" /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />Published to members</label></div> : <><h2 className="text-lg font-semibold text-text">{item.title}</h2><p className="mt-2 text-sm text-muted">{item.description ?? "No description."}</p></>}<div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">{item.status ? <span className="rounded-full bg-mist px-2 py-1">{item.status}</span> : null}{item.details.map((detail) => <span key={detail} className="rounded-full bg-mist px-2 py-1">{detail}</span>)}</div></div>{editing === item.id ? <div className="flex gap-2"><button type="button" disabled={busy || !title.trim()} onClick={() => void request({ resourceId: storageOnly ? undefined : item.id, path: item.storagePath, title, description, category, isPublished: published, sortOrder: order })} className="inline-flex h-10 items-center gap-2 rounded-lg bg-forest px-3 text-sm font-semibold text-cream disabled:opacity-50"><Save size={15} />Save</button><button type="button" onClick={() => setEditing(null)} className="grid h-10 w-10 place-items-center rounded-lg border border-mist"><X size={16} /></button></div> : <div className="flex gap-2"><button type="button" onClick={() => begin(item)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-forest px-3 text-sm font-semibold text-cream"><FilePenLine size={15} />Edit</button><button type="button" aria-label={`Delete ${item.title}`} onClick={() => { if (confirm("Delete this resource and its stored file?")) void request({ action: "delete", resourceId: storageOnly ? undefined : item.id, path: item.storagePath }); }} className="grid h-10 w-10 place-items-center rounded-lg border border-danger/30 text-danger"><Trash2 size={16} /></button></div>}</div></article>;
    })}
  </div>;
}
