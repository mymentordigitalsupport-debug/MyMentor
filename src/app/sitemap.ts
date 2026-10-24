import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/articles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const articles = await getPublishedArticles().catch(() => []);
  return [{ url: site, lastModified: new Date() }, ...articles.map((article) => ({ url: `${site}/articles/${article.slug}`, lastModified: new Date(article.updated_at) }))];
}
