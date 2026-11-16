"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { AdminContentItem } from "@/lib/admin/content";

type ContentType = "course" | "chapter" | "lesson";

export function ContentEditor({ item, type }: { item: AdminContentItem; type: ContentType }) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const published = item.status === "Published";

  async function save(nextPublished = published) {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id: item.id, title, description, published: nextPublished }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Unable to save content.");
      setMessage(nextPublished ? "Saved and published." : "Saved as draft.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save content.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="mt-6 border-t border-mist pt-6"><h2 className="text-lg font-semibold text-text">Edit content</h2><div className="mt-4 grid gap-4"><label className="grid gap-1 text-sm font-semibold text-text">Title<input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-xl border border-mist bg-cream px-3 py-2.5 font-normal outline-none focus:border-sage" /></label>{type !== "lesson" ? <label className="grid gap-1 text-sm font-semibold text-text">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="rounded-xl border border-mist bg-cream px-3 py-2.5 font-normal outline-none focus:border-sage" /></label> : null}<div className="flex flex-wrap gap-3"><Button onClick={() => void save()} loading={busy}>Save</Button><Button variant="secondary" onClick={() => void save(!published)} loading={busy}>{published ? "Save as draft" : "Publish"}</Button></div>{message ? <p className="text-sm text-forest" role="status">{message}</p> : null}</div></div>;
}
