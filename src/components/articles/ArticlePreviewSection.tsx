"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { ArticleRecord } from "@/lib/articles";

export function ArticlePreviewSection() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  useEffect(() => {
    fetch("/api/articles?limit=3")
      .then((response) => response.ok ? response.json() : { articles: [] })
      .then((result) => setArticles(result.articles ?? []))
      .catch(() => setArticles([]));
  }, []);
  if (!articles.length) return null;
  return (
    <section id="articles" className="texture-noise w-full overflow-hidden border-y border-[#cbc1b2] bg-[#f4efe6] text-text shadow-[0_24px_90px_-55px_rgba(31,42,36,0.3)]">
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">From the journal</p><h2 className="font-serif mt-3 text-4xl font-semibold tracking-[-0.05em] text-forest sm:text-5xl">Guidance worth returning to.</h2></div><Link href="/articles" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline">View all articles <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">{articles.map((article) => <Link key={article.id} href={`/articles/${article.slug}`} className="group overflow-hidden rounded-[24px] border border-[#d8cfbf] bg-[#fbf8f1] transition hover:-translate-y-0.5 hover:border-sage hover:shadow-sm">{article.cover_image_url ? <img src={article.cover_image_url} alt={`Cover image for ${article.title}`} className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.02]" /> : <div className="flex aspect-[16/9] items-end bg-[linear-gradient(145deg,#dce6dc,#b9a36f)] p-5"><span className="text-xs font-semibold uppercase tracking-[0.2em] text-forest/80">My Mentor Journal</span></div>}<div className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{article.category?.name ?? "My Mentor"}</p><h3 className="mt-3 text-xl font-semibold leading-7 text-forest">{article.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{article.excerpt}</p><p className="mt-5 text-xs font-medium text-muted">By {article.author_name}</p></div></Link>)}</div>
      </div>
    </section>
  );
}
