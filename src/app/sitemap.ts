import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/articles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mymentor.digital").replace(/\/$/, "");
  const articles = await getPublishedArticles().catch(() => []);
  const publicPages = ["/", "/about", "/privacy", "/terms", "/threads"];

  return [
    ...publicPages.map((path) => ({ url: `${site}${path === "/" ? "" : path}` })),
    ...articles.map((article) => ({
      url: `${site}/articles/${article.slug}`,
      lastModified: new Date(article.updated_at),
    })),
  ];
}
