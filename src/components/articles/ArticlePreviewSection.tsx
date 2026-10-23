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

  if (!items.length) return null;

  return (
    <main id="articles" className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-indigo-100/40 via-background to-orange-100/40 dark:from-background dark:via-background dark:to-background">
      <CalendlyCarousel items={items} autoPlayInterval={6000} pauseOnHover={false} />
    </main>
  );
}
