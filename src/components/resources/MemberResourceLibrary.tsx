"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, ExternalLink, FileText, Headphones, HeartHandshake } from "lucide-react";
import type { Resource } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { PaperPin, PaperSurface } from "@/components/threads/ThreadPaper";
import styles from "@/components/threads/ThreadsCommunity.module.css";

const iconForCategory = {
  worksheet: BookOpen,
  audio: Headphones,
  video: HeartHandshake,
  reading: BookOpen,
  support: HeartHandshake,
};

function fileExtension(url: string) {
  try {
    return new URL(url).pathname.split(".").pop()?.toLowerCase() ?? "";
  } catch {
    return url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  }
}

export function MemberResourceLibrary({ resources }: { resources: Resource[] }) {
  const [selected, setSelected] = useState<Resource | null>(null);
  const extension = useMemo(() => selected?.url ? fileExtension(selected.url) : "", [selected]);
  const officeUrl = selected?.url && ["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(extension)
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selected.url)}`
    : null;

  return <>
    <section className={`${styles.feed} mt-8`} aria-label="Member resources">
      {resources.map((resource, index) => {
        const Icon = iconForCategory[resource.category] ?? BookOpen;
        return <article key={resource.id} className={styles.conversation} data-decoration={index % 3}><PaperSurface seed={60 + index} warm={index === 1} /><PaperPin className={index % 2 ? styles.conversationPinRight : styles.conversationPinLeft} /><div className={styles.conversationContent}><div className={styles.conversationMeta}><span className={styles.topicBadge}>{resource.category}</span></div><h3><Icon className="mr-3 inline-block h-5 w-5 text-[#637d50]" />{resource.title}</h3>{resource.description ? <p className={styles.conversationBody}>{resource.description}</p> : null}{resource.url ? <button type="button" onClick={() => setSelected(resource)} className={`${styles.greenButton} mt-5`}>Open resource <ArrowUpRight size={16} /></button> : null}</div></article>;
      })}
      {!resources.length ? <article className={styles.conversation}><PaperSurface seed={60} warm /><div className={styles.conversationContent}><h3>Your resources are being prepared.</h3><p className={styles.conversationBody}>Please check back shortly.</p></div></article> : null}
    </section>

    <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} className="flex !h-[calc(100dvh-2rem)] !w-[calc(100vw-2rem)] !max-w-none flex-col overflow-hidden !p-0">
      <div className="flex items-center justify-between gap-4 border-b border-mist px-6 py-4 pr-16">
        <div className="min-w-0"><p className="truncate font-semibold text-text">{selected?.title}</p><p className="mt-1 text-xs capitalize text-muted">{selected?.category}</p></div>
        {selected?.url ? <a href={selected.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-forest underline underline-offset-4">Open separately <ExternalLink size={13} /></a> : null}
      </div>
      <div className="min-h-0 flex-1 bg-[#e9e6dc]">
        {selected?.url && extension === "pdf" ? <iframe title={selected.title} src={selected.url} className="h-full w-full border-0" /> : null}
        {selected?.url && officeUrl ? <iframe title={selected.title} src={officeUrl} className="h-full w-full border-0" /> : null}
        {selected?.url && ["mp3", "wav", "m4a", "ogg"].includes(extension) ? <div className="flex h-full items-center justify-center p-8"><audio controls src={selected.url} className="w-full max-w-xl" /></div> : null}
        {selected?.url && ["mp4", "webm", "mov"].includes(extension) ? <div className="flex h-full items-center justify-center p-5"><video controls src={selected.url} className="max-h-full max-w-full" /></div> : null}
        {selected?.url && !["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "mp3", "wav", "m4a", "ogg", "mp4", "webm", "mov"].includes(extension) ? <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center"><FileText className="h-10 w-10 text-forest" /><p className="max-w-sm text-sm leading-6 text-muted">This file type cannot be previewed in the browser.</p><a href={selected.url} target="_blank" rel="noopener noreferrer" className={styles.greenButton}>Open file <ExternalLink size={16} /></a></div> : null}
      </div>
    </Modal>
  </>;
}
