import Link from "next/link";
import type { Metadata } from "next";
import { PublicNavigation } from "@/components/landing/PublicNavigation";
import { getPublishedArticles } from "@/lib/articles";

export const revalidate = 300;
export const metadata: Metadata = { title: "Articles", description: "Recovery, support, prevention, and wellbeing articles from My Mentor." };

export default async function ArticlesPage() {
  const articles = await getPublishedArticles().catch(() => []);
  return <main className="min-h-screen bg-cream"><PublicNavigation /><section className="mx-auto max-w-6xl px-6 pb-20 pt-32 sm:px-10"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">My Mentor journal</p><h1 className="font-serif mt-4 text-5xl font-semibold tracking-[-0.06em] text-forest sm:text-6xl">Articles for the road ahead.</h1><p className="mt-5 max-w-2xl text-base leading-8 text-muted">Thoughtful guidance on recovery, support, healing, and personal growth.</p><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <Link key={article.id} href={`/articles/${article.slug}`} className="rounded-[28px] border border-mist bg-[#fbf8f1] p-6 transition hover:border-sage hover:shadow-md"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{article.category?.name ?? "My Mentor"}</p><h2 className="mt-3 text-2xl font-semibold leading-8 text-forest">{article.title}</h2><p className="mt-3 text-sm leading-6 text-muted">{article.excerpt}</p><p className="mt-6 text-xs font-medium text-muted">By {article.author_name}</p></Link>)}</div>{!articles.length && <p className="mt-12 rounded-3xl border border-dashed border-mist p-8 text-muted">New articles will appear here soon.</p>}</section></main>;
}
