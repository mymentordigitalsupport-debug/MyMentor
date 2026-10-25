"use client";

import { useEffect, useMemo, useState } from "react";
import type { CarouselItem } from "@/components/ui/connected-carousel";
import { CalendlyCarousel } from "@/components/ui/connected-carousel";
import type { ArticleRecord } from "@/lib/articles";

const FALLBACK_COVER = "/assets/images/s1L.jpg";

function articleDate(article: ArticleRecord) {
  const date = article.published_at ?? article.created_at;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function ArticlePreviewSection() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);

  useEffect(() => {
    fetch("/api/articles?limit=12")
      .then((response) => response.ok ? response.json() : { articles: [] })
      .then((result) => setArticles(result.articles ?? []))
      .catch(() => setArticles([]));
  }, []);

  const items = useMemo<CarouselItem[]>(() => articles.map((article) => ({
    id: article.id,
    stat: article.title,
    quote: article.excerpt,
    author: article.author_name ?? "My Mentor contributor",
    role: `${article.category?.name ?? "My Mentor"} · ${articleDate(article)}`,
    defaultImage: article.cover_image_url ?? FALLBACK_COVER,
    selectedImage: article.cover_image_url ?? FALLBACK_COVER,
    alt: `Cover image for ${article.title}`,
  })), [articles]);

  if (!items.length) {
    return <section id="articles" className="flex min-h-[20rem] w-full items-center justify-center bg-[linear-gradient(135deg,rgba(238,244,235,.8),rgba(251,249,245,.98))] px-6 py-16 text-center"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#7a9272]">My Mentor journal</p><h2 className="mt-3 font-serif text-3xl text-[#23392b]">Articles are coming soon.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#68766b]">New reflections and recovery resources will appear here.</p></div></section>;
  }

  return (
    <main id="articles" className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-indigo-100/40 via-background to-orange-100/40 dark:from-background dark:via-background dark:to-background">
      <CalendlyCarousel items={items} autoPlayInterval={6000} pauseOnHover={false} />
    </main>
  );
}
