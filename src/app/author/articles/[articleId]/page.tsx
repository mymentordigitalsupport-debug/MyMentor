import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/articles/ArticleEditor";
import { getArticleActor } from "@/lib/article-access";
import { getArticleCategories, getAuthorArticles } from "@/lib/articles";

export default async function AuthorArticlePage({ params }: { params: Promise<{ articleId: string }> }) {
  const [{ articleId }, actor, categories] = await Promise.all([params, getArticleActor(), getArticleCategories()]);
  const articles = actor.user ? await getAuthorArticles(actor.user.id) : [];
  const article = articles.find((item) => item.id === articleId);
  if (!article) notFound();
  return <><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">{article.status.replace(/_/g, " ")}</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-forest">{article.title}</h1></div><ArticleEditor article={article} categories={categories} mode="author" /></>;
}
