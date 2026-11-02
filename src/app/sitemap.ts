import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/articles";
import { PUBLIC_SITE_URL } from "@/lib/public-site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles().catch(() => []);
  const publicPages = ["/", "/about", "/privacy", "/terms", "/threads"];

  return [
    ...publicPages.map((path) => ({ url: `${PUBLIC_SITE_URL}${path === "/" ? "" : path}` })),
    ...articles.map((article) => ({
      url: `${PUBLIC_SITE_URL}/articles/${article.slug}`,
      lastModified: new Date(article.updated_at),
    })),
  ];
}
