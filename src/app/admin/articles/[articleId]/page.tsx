import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/articles/ArticleEditor";
import { getAdminArticles, getArticleCategories } from "@/lib/articles";

export const metadata = { title: "Edit Article" };
export default async function AdminArticlePage({ params }: { params: Promise<{ articleId: string }> }) {
  const [{ articleId }, articles, categories] = await Promise.all([params, getAdminArticles(), getArticleCategories()]);
  const article = articles.find((item) => item.id === articleId);
  if (!article) notFound();
  return <><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">{article.status.replace(/_/g, " ")}</p><h1 className="mt-2 text-3xl font-semibold text-forest">Edit article</h1></div><ArticleEditor article={article} categories={categories} mode="admin" /></>;
}
