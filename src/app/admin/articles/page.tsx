import { AdminArticleManager } from "@/components/articles/AdminArticleManager";
import { getAdminArticles, getAuthorApplications } from "@/lib/articles";

export const metadata = { title: "Articles" };
export default async function AdminArticlesPage() {
  const [articles, applications] = await Promise.all([getAdminArticles(), getAuthorApplications()]);
  return <AdminArticleManager articles={articles} applications={applications} />;
}
