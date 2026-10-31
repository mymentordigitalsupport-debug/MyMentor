import { ArticleEditor } from "@/components/articles/ArticleEditor";
import { getArticleCategories } from "@/lib/articles";

export const metadata = { title: "New Article" };
export default async function AdminNewArticlePage() {
  return <><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Admin article</p><h1 className="mt-2 text-3xl font-semibold text-forest">Create article</h1></div><ArticleEditor categories={await getArticleCategories()} mode="admin" /></>;
}
