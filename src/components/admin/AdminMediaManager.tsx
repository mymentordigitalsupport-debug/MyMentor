"use client";

import { useState, type ChangeEvent } from "react";
import { Trash2, Upload } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AdminContentItem } from "@/lib/admin/content";

function readableMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*#{1,6}\s*/gm, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>]/g, "")
    .replace(/^\s*[-+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function countAudioSections(markdown: string) {
  const matches = [...markdown.matchAll(/^\s*(?:\*\*)?Lesson\s+\d+\s*:?[ \t]*(.*?)(?:\*\*)?\s*$/gim)];
  return matches.filter((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    return readableMarkdown(markdown.slice(start, end));
  }).length;
}

export function AdminMediaManager({ items }: { items: AdminContentItem[] }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [sectionCount, setSectionCount] = useState(0);
  const [guidancePath, setGuidancePath] = useState<"christian" | "religious">("christian");

  async function inspectMarkdown(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    let count = 0;
    for (const file of files) {
      const markdown = await file.text();
      count += countAudioSections(markdown);
    }
    setSectionCount(count);
    setMessage(files.length && !count ? "No Lesson sections found. No credits will be used." : "");
  }

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

  async function generate(form: HTMLFormElement) {
    const data = new FormData(form);
    const files = Array.from(data.getAll("files")).filter((value): value is File => value instanceof File && value.size > 0);
    if (!files.length || !sectionCount) return;
    if (!confirm(`Generate ${sectionCount} separate ${guidancePath === "christian" ? "Christian" : "Religious"} audio files? This will use ElevenLabs credits.`)) return;
    setBusy(true);
    setMessage("");
    try {
      for (const file of files) {
        const payload = new FormData();
        payload.set("file", file);
        payload.set("title", file.name.replace(/\.md$/i, ""));
        payload.set("guidancePath", guidancePath);
        const response = await fetch("/api/admin/media", { method: "POST", body: payload });
        const result = await response.json().catch(() => ({})) as Record<string, string>;
        if (!response.ok) throw new Error(result.error ?? `Unable to generate ${file.name}.`);
      }
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Audio generation failed.");
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
    <form onSubmit={(event) => { event.preventDefault(); void generate(event.currentTarget); }} className="grid gap-3 rounded-2xl border border-gold/30 bg-[#fffaf0] p-5 md:grid-cols-2">
      <h2 className="text-lg font-semibold text-text md:col-span-2">Generate audio from Markdown</h2>
      <p className="text-sm leading-6 text-muted md:col-span-2">Each Lesson section becomes a separate MP3 audio file. Markdown formatting is removed before conversion.</p>
      <label className="grid gap-1 text-sm font-semibold text-text md:col-span-2">Guidance path<select name="guidancePath" value={guidancePath} onChange={(event) => setGuidancePath(event.target.value as "christian" | "religious")} className="rounded-xl border border-mist bg-white px-3 py-2.5 font-normal"><option value="christian">Christian</option><option value="religious">Religious</option></select></label>
      <input name="files" required multiple type="file" accept=".md,text/markdown" onChange={(event) => void inspectMarkdown(event)} className="rounded-xl border border-mist bg-white px-3 py-2.5 md:col-span-2" />
      {sectionCount > 0 ? <p className="rounded-xl bg-gold/10 px-4 py-3 text-sm font-semibold text-forest md:col-span-2">Ready: {sectionCount} separate {guidancePath === "christian" ? "Christian" : "Religious"} audio files. Generation starts only after confirmation.</p> : null}
      <button disabled={busy || sectionCount === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 font-semibold text-cream disabled:opacity-50 md:col-span-2"><Upload size={16} />{sectionCount ? `Generate ${sectionCount} audio files` : "Select Markdown files"}</button>
    </form>
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
