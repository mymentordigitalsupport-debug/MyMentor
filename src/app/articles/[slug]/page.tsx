import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicNavigation } from "@/components/landing/PublicNavigation";
import { ArticleBody } from "@/components/articles/ArticleBody";
import { getPublishedArticleBySlug } from "@/lib/articles";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = await getPublishedArticleBySlug((await params).slug).catch(() => null);
  if (!article) return { title: "Article not found" };
  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: { type: "article", title: article.seo_title || article.title, description: article.seo_description || article.excerpt, images: article.cover_image_url ? [article.cover_image_url] : [] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getPublishedArticleBySlug((await params).slug).catch(() => null);
  if (!article) notFound();
  const structuredData = JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.excerpt, datePublished: article.published_at, dateModified: article.updated_at, author: { "@type": "Person", name: article.author_name }, publisher: { "@type": "Organization", name: "My Mentor" } }).replace(/</g, "\\u003c");
  return <main className="min-h-screen bg-cream"><PublicNavigation /><article className="mx-auto max-w-3xl px-6 pb-20 pt-32 sm:px-10"><Link href="/#articles" className="text-sm font-semibold text-forest hover:underline">← Back to the journal</Link><p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-sage">{article.category?.name ?? "My Mentor"}</p><h1 className="font-serif mt-4 text-5xl font-semibold leading-[1.04] tracking-[-0.06em] text-forest sm:text-6xl">{article.title}</h1><p className="mt-6 text-lg leading-8 text-muted">{article.excerpt}</p><p className="mt-6 text-sm text-muted">By {article.author_name} · {article.published_at ? new Date(article.published_at).toLocaleDateString() : ""}</p>{article.cover_image_url && <img src={article.cover_image_url} alt="" className="mt-10 aspect-[16/8] w-full rounded-[28px] object-cover" />}<div className="mt-12"><ArticleBody markdown={article.content_markdown} /></div></article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} /></main>;
}
