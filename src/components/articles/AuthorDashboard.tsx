"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpenText, Clock3, Eye, FilePenLine, MessageCircle, Plus, Send, Sparkles, X } from "lucide-react";
import { ArticleBody } from "@/components/articles/ArticleBody";
import type { ArticleRecord, ArticleStatus } from "@/lib/articles";

type Props = { articles: ArticleRecord[]; feedback: Record<string, string> };
const statusNames: Record<ArticleStatus, string> = { draft: "Draft", pending_review: "In review", changes_requested: "Changes requested", rejected: "Rejected", published: "Published", archived: "Archived" };
const statusStyles: Record<ArticleStatus, string> = { draft: "bg-[#f0e9dc] text-[#695c48]", pending_review: "bg-[#f5ead0] text-[#7f6228]", changes_requested: "bg-[#f5e6da] text-[#8c553b]", rejected: "bg-[#f4e2dd] text-[#8d4f43]", published: "bg-[#dce9d9] text-[#31553a]", archived: "bg-[#e9e8e2] text-[#65685f]" };
const dateLabel = (value: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
const readTime = (value: string) => `${Math.max(1, Math.ceil(value.trim().split(/\s+/).filter(Boolean).length / 200))} min read`;

export function AuthorDashboard({ articles, feedback }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [preview, setPreview] = useState<ArticleRecord | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<ArticleRecord | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const count = (status: ArticleStatus) => articles.filter((article) => article.status === status).length;
  const overview = [
    { label: "Drafts", value: count("draft"), number: "01" },
    { label: "In review", value: count("pending_review"), number: "02" },
    { label: "Changes requested", value: count("changes_requested"), number: "03" },
    { label: "Published", value: count("published"), number: "04" },
  ];
  async function submit(article: ArticleRecord) {
    setSubmitting(article.id);
    setError("");
    try {
      const response = await fetch(`/api/author/articles/${article.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "submit" }) });
      if (!response.ok) { const result = await response.json(); throw new Error(result.error ?? "Unable to submit article."); }
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to submit article."); }
    finally { setSubmitting(null); }
  }

  return (
    <div>
      <motion.section initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, ease: [.22, 1, .36, 1] }} className="relative isolate overflow-hidden rounded-[28px] bg-[#1b3227] px-6 py-10 text-[#f9f5e9] shadow-[0_28px_75px_-45px_#12251b] sm:px-10 sm:py-14 lg:px-14">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-40 h-[450px] w-[450px] rounded-full border border-[#d5bd89]/20 bg-[radial-gradient(circle,#b2a0753b_0%,transparent_67%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.12] [background-image:radial-gradient(#e6d4aa_0.5px,transparent_0.5px)] [background-size:7px_7px]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.32em] text-[#dcc594]"><Sparkles className="h-3.5 w-3.5" /> Author workspace <span className="ml-3 text-[#dcc594]/50">/ 001</span></p><h1 className="mt-7 font-serif text-[clamp(3.5rem,8vw,7.5rem)] leading-[.9] tracking-[-.075em]">Your <em className="font-normal text-[#d9bf87]">articles.</em></h1><p className="mt-7 max-w-xl text-sm leading-7 text-[#d4dbd0] sm:text-base">A considered space for your ideas. Shape a draft, share it with the editorial team, and bring your words into the world.</p><div className="mt-8 flex items-center gap-4 border-t border-white/15 pt-5 text-xs text-[#d3d8cf]"><BookOpenText className="h-4 w-4 text-[#d9bf87]" /><span><strong className="text-white">{articles.length}</strong> {articles.length === 1 ? "article" : "articles"} in your collection</span></div></div>
          <motion.div whileHover={reduceMotion ? undefined : { y: -4 }} whileTap={reduceMotion ? undefined : { scale: .98 }}><Link href="/author/articles/new" className="group inline-flex min-h-14 items-center gap-5 rounded-full bg-[#d8bd83] px-6 text-sm font-semibold text-[#1d3125] shadow-[0_15px_30px_-18px_#ddc792] transition-colors hover:bg-[#ead4a6]">New article <span className="grid h-8 w-8 place-items-center rounded-full bg-[#20382a] text-[#f8efd8] transition-transform group-hover:rotate-90"><Plus className="h-4 w-4" /></span></Link></motion.div>
        </div>
      </motion.section>

      <motion.section aria-label="Article overview" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .12 }} className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-[#d8d0c2] bg-[#d8d0c2] shadow-[0_16px_35px_-30px_#4e523c] lg:grid-cols-4">
        {overview.map((item) => <div key={item.label} className="bg-[#fffdf8] p-5 sm:p-6"><div className="flex items-start justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#7b806f]">{item.label}</span><span className="font-serif text-xs italic text-[#ad9b7f]">{item.number}</span></div><p className="mt-4 font-serif text-4xl leading-none tracking-[-.06em] text-[#203b2c]" aria-label={`${item.value} ${item.label.toLowerCase()}`}>{item.value}</p></div>)}
      </motion.section>

      <section className="mt-14" aria-labelledby="library-heading"><div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#cfc7b6] pb-5"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#9b845d]">The editorial library</p><h2 id="library-heading" className="mt-2 font-serif text-4xl tracking-[-.05em] text-[#203b2c] sm:text-5xl">Your collection</h2></div><span className="flex items-center gap-2 text-xs text-[#6c7468]"><ArrowDownRight className="h-4 w-4" /> Latest updates</span></div>
        {error && <p role="alert" className="mb-5 rounded-xl border border-[#d8a79b] bg-[#f8ebe6] p-4 text-sm text-[#874334]">{error}</p>}
        {articles.length ? <div className="grid gap-6 lg:grid-cols-2">{articles.map((article) => {
          const published = article.status === "published";
          const editable = ["draft", "changes_requested", "rejected"].includes(article.status);
          const cardImage = article.cover_image_url;
          return <motion.article key={article.id} initial={false} whileHover={reduceMotion ? undefined : { y: -5 }} className={`group relative overflow-hidden rounded-[26px] border bg-[#fffdf9] shadow-[0_18px_45px_-35px_rgba(24,43,31,.35)] transition-[border-color,box-shadow] duration-300 hover:shadow-[0_30px_65px_-37px_rgba(24,43,31,.45)] ${published ? "border-[#c5b182] lg:first:col-span-2" : "border-[#d7d0c3] hover:border-[#baa779]"}`}>
            <div className={`relative overflow-hidden ${published ? "h-64 sm:h-80" : "h-56"}`}>{cardImage ? <img src={cardImage} alt={`Cover for ${article.title}`} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transform-none" /> : <div className="relative flex h-full items-end bg-[radial-gradient(circle_at_75%_25%,#81967b_0%,transparent_36%),linear-gradient(130deg,#203e2d,#314d39_55%,#9a8256)] p-7"><span className="font-serif text-3xl italic text-[#fff6df]">My Mentor Journal</span><span aria-hidden="true" className="absolute right-8 top-7 text-7xl font-light text-white/15">M.</span></div>}<div className="absolute inset-0 bg-gradient-to-t from-[#10271a]/75 via-[#10271a]/10 to-transparent" /><span className={`absolute left-5 top-5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] shadow-[0_2px_8px_rgba(0,0,0,.18)] ${statusStyles[article.status]}`}>{statusNames[article.status]}</span>{published && <span className="absolute bottom-5 left-6 text-[10px] font-semibold uppercase tracking-[.22em] text-[#fff9ed] [text-shadow:0_1px_8px_rgba(0,0,0,.8)]">Published story · My Mentor</span>}</div>
            <div className="p-6 sm:p-7"><div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[.12em] text-[#7b6038]"><span>{article.category?.name ?? "Uncategorised"}</span><span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#a98b57]" /><span>{readTime(article.content_markdown)}</span></div><h3 className="mt-3 font-serif text-3xl leading-tight tracking-[-.045em] text-[#173325] sm:text-4xl">{article.title || "Untitled article"}</h3><p className="mt-3 text-sm leading-6 text-[#4e5c51]">{article.excerpt || "A story is taking shape. Add an excerpt to introduce it to readers."}</p><div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#e5dfd3] pt-4 text-xs text-[#4e5c51]"><Clock3 className="h-3.5 w-3.5" />{published && article.published_at ? `Published ${dateLabel(article.published_at)}` : `Updated ${dateLabel(article.updated_at)}`}<span className="ml-auto text-[#735c38]">{article.status === "pending_review" ? "Awaiting editorial review" : article.status === "changes_requested" ? "Editorial changes requested" : article.status === "rejected" ? "Editorial decision recorded" : published ? "Live on My Mentor" : "Ready when you are"}</span></div>
              <div className="mt-5 flex flex-wrap gap-2">{editable && <Link href={`/author/articles/${article.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#203b2c] px-4 text-xs font-semibold text-white transition hover:bg-[#365640]"><FilePenLine className="h-3.5 w-3.5" />Edit</Link>}{published ? <Link href={`/articles/${article.slug}`} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#203b2c] px-4 text-xs font-semibold text-white transition hover:bg-[#365640]"><Eye className="h-3.5 w-3.5" />View live <ArrowUpRight className="h-3.5 w-3.5" /></Link> : <button type="button" onClick={() => setPreview(article)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d5cbbc] px-4 text-xs font-semibold text-[#324b39] transition hover:border-[#8b9b84]"><Eye className="h-3.5 w-3.5" />Preview</button>}{editable && <button type="button" disabled={submitting === article.id} onClick={() => void submit(article)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d5cbbc] px-4 text-xs font-semibold text-[#324b39] transition hover:border-[#8b9b84] disabled:opacity-50"><Send className="h-3.5 w-3.5" />{submitting === article.id ? "Submitting…" : "Submit for review"}</button>}{feedback[article.id] && <button type="button" onClick={() => setFeedbackFor(article)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d5cbbc] px-4 text-xs font-semibold text-[#324b39] transition hover:border-[#8b9b84]"><MessageCircle className="h-3.5 w-3.5" />View feedback</button>}</div>
            </div>
          </motion.article>;
        })}</div> : <div className="relative overflow-hidden rounded-[26px] border border-dashed border-[#c9baa1] bg-[#fffdf9] px-6 py-16 text-center sm:py-20"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e9e4d8] text-[#53694e]"><FilePenLine className="h-6 w-6" /></div><h3 className="mt-6 font-serif text-3xl text-[#203b2c]">Your first story starts here.</h3><p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#667066]">This is your space to develop ideas and share thoughtful writing with My Mentor readers.</p><Link href="/author/articles/new" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#203b2c] px-6 text-sm font-semibold text-white transition hover:bg-[#365640]">Create your first draft <ArrowRight className="h-4 w-4" /></Link></div>}
      </section>
      {(preview || feedbackFor) && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10251b]/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setPreview(null); setFeedbackFor(null); } }}><section role="dialog" aria-modal="true" aria-label={preview ? `Preview ${preview.title}` : `Editorial feedback for ${feedbackFor?.title}`} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[24px] bg-[#fffdf8] p-6 shadow-2xl sm:p-9"><div className="flex justify-between gap-4"><p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#967a51]">{preview ? "Article preview" : "Editorial feedback"}</p><button type="button" onClick={() => { setPreview(null); setFeedbackFor(null); }} className="grid h-10 w-10 place-items-center rounded-full border border-[#ddd3c1]" aria-label="Close"><X className="h-4 w-4" /></button></div>{preview ? <><h2 className="mt-5 font-serif text-4xl text-[#203b2c]">{preview.title}</h2><p className="mt-3 text-sm text-[#667066]">{preview.excerpt}</p>{preview.cover_image_url && <img src={preview.cover_image_url} alt="" className="mt-6 aspect-video w-full rounded-xl object-cover" />}<div className="mt-7"><ArticleBody markdown={preview.content_markdown} /></div></> : <><h2 className="mt-5 font-serif text-3xl text-[#203b2c]">{feedbackFor?.title}</h2><p className="mt-5 whitespace-pre-wrap rounded-xl bg-[#f4efe5] p-5 text-sm leading-7 text-[#435447]">{feedbackFor ? feedback[feedbackFor.id] : ""}</p>{feedbackFor && ["changes_requested", "rejected"].includes(feedbackFor.status) && <Link href={`/author/articles/${feedbackFor.id}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#203b2c]">Open article <ArrowRight className="h-4 w-4" /></Link>}</>}</section></div>}
    </div>
  );
}
