import { ArticleEditor } from "@/components/articles/ArticleEditor";
import { getArticleCategories } from "@/lib/articles";

export default async function NewAuthorArticlePage() {
  return <><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">New draft</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-forest">Write an article</h1></div><ArticleEditor categories={await getArticleCategories()} mode="author" /></>;
}
