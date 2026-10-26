"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Compass, Search, UserRound } from "lucide-react";
import { RichChatText } from "./RichChatText";
import type { ChatMessageData } from "./types";

type PublishedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category?: { name: string } | null;
};

export function ChatMessage({ message }: { message: ChatMessageData }) {
  const member = message.role === "member";
  if (message.role === "guide" && message.animate) return <AnimatedGuideMessage message={message} />;
  return <div className={`flex gap-2.5 ${member ? "justify-end" : "justify-start"}`}><span className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full ${member ? "order-2 bg-[#e4d2a4] text-[#483a20]" : "overflow-hidden bg-[#25412f]"}`}>{member ? <UserRound className="h-3.5 w-3.5" /> : <img src="/assets/ai-avatar.png" alt="My Mentor Guide" className="h-full w-full object-contain" />}</span><div className={`max-w-[82%] ${member ? "order-1" : ""}`}><div className={`rounded-2xl px-3.5 py-3 text-sm leading-6 shadow-[0_8px_18px_-16px_rgba(24,42,30,.4)] ${member ? "rounded-tr-md bg-[#31563d] text-[#fffdf8]" : "rounded-tl-md border border-[#dde4d8] bg-white text-[#2b3d31]"}`}><p>{message.text}</p>{message.preview ? <p className="mt-2 border-t border-[#d8e1d2] pt-2 text-[11px] font-semibold uppercase tracking-[.12em] text-[#687e6c]">Preview only · AI not connected</p> : null}</div>{message.articleFinder ? <ArticleFinder /> : null}{message.card ? <NavigationCard card={message.card} /> : null}<p className={`mt-1 px-1 text-[10px] text-[#879087] ${member ? "text-right" : ""}`}>{message.time}</p></div></div>;
}

function AnimatedGuideMessage({ message }: { message: ChatMessageData }) {
  const [displayed, setDisplayed] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let shown = 0;
    const timer = window.setInterval(() => {
      shown = Math.min(message.text.length, shown + Math.max(1, Math.ceil(message.text.length / 90)));
      setDisplayed(message.text.slice(0, shown));
      if (shown === message.text.length) {
        window.clearInterval(timer);
        setComplete(true);
      }
    }, 18);
    return () => window.clearInterval(timer);
  }, [message.text]);

  return <div className="flex gap-2.5"><span className="mt-1 h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#25412f]"><img src="/assets/ai-avatar.png" alt="My Mentor Guide" className="h-full w-full object-contain" /></span><div className="max-w-[82%]"><div className="rounded-2xl rounded-tl-md border border-[#dde4d8] bg-white px-3.5 py-3 text-sm leading-6 text-[#2b3d31] shadow-[0_8px_18px_-16px_rgba(24,42,30,.4)]"><RichChatText value={displayed} />{displayed.length < message.text.length ? <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-current align-[-2px]" aria-hidden="true" /> : null}</div>{complete && message.card ? <NavigationCard card={message.card} /> : null}<p className="mt-1 px-1 text-[10px] text-[#879087]">{message.time}</p></div></div>;
}

function ArticleFinder() {
  const [articles, setArticles] = useState<PublishedArticle[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/articles?limit=12").then((response) => response.ok ? response.json() : { articles: [] }).then((data) => {
      if (active) setArticles(Array.isArray(data.articles) ? data.articles : []);
    }).catch(() => { if (active) setArticles([]); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => [...new Set(articles.map((article) => article.category?.name).filter(Boolean) as string[])], [articles]);
  const results = useMemo(() => articles.filter((article) => {
    const titleMatches = article.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    return titleMatches && (category === "all" || article.category?.name === category);
  }), [articles, category, query]);

  return <div className="mt-2 rounded-2xl border border-[#cddbc6] bg-[#f8fbf5] p-3"><div className="flex gap-2"><label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#d4dfce] bg-white px-2.5 py-2 text-[#6a7d6b] focus-within:border-[#8fac83]"><Search className="h-3.5 w-3.5 shrink-0" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search article titles" className="min-w-0 flex-1 bg-transparent text-xs text-[#294332] outline-none placeholder:text-[#879487]" aria-label="Search article titles" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} className="max-w-[110px] rounded-xl border border-[#d4dfce] bg-white px-2 text-xs text-[#35533e] outline-none focus:border-[#8fac83]" aria-label="Filter articles by topic"><option value="all">All topics</option>{categories.map((name) => <option key={name} value={name}>{name}</option>)}</select></div><div className="mt-3 space-y-2">{loading ? <p className="px-1 py-2 text-xs text-[#728071]">Loading articles...</p> : null}{!loading && results.slice(0, 3).map((article) => <Link key={article.id} href={`/articles/${article.slug}`} className="block rounded-xl border border-[#dce6d7] bg-white px-3 py-2.5 transition hover:border-[#8fac83] hover:bg-[#fcfdfb]"><span className="block truncate text-xs font-semibold text-[#294332]">{article.title}</span><span className="mt-1 block line-clamp-2 text-[11px] leading-4 text-[#6b786c]">{article.excerpt}</span>{article.category?.name ? <span className="mt-1.5 inline-block text-[10px] font-semibold text-[#698167]">{article.category.name}</span> : null}</Link>)}{!loading && results.length === 0 ? <p className="px-1 py-2 text-xs text-[#728071]">No matching published articles.</p> : null}</div><Link href="/#articles" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#456441] hover:text-[#25412f]">View all articles <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>;
}

function NavigationCard({ card }: { card: NonNullable<ChatMessageData["card"]> }) {
  const content = <><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e5eddc] text-[#456441]"><Compass className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold uppercase tracking-[.15em] text-[#7a8d75]">{card.eyebrow}</span><span className="mt-1 block text-sm font-semibold text-[#243a2c]">{card.title}</span><span className="mt-1 block text-xs leading-5 text-[#627166]">{card.description}</span></span>{card.href ? <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#456441]" /> : null}</>;
  return card.href ? <Link href={card.href} className="mt-2 flex gap-3 rounded-2xl border border-[#cddbc6] bg-[#f8fbf5] p-3.5 transition hover:border-[#8fac83] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fac83]"><span className="sr-only">{card.actionLabel}</span>{content}</Link> : <div className="mt-2 flex gap-3 rounded-2xl border border-dashed border-[#cddbc6] bg-[#f8fbf5] p-3.5">{content}</div>;
}
