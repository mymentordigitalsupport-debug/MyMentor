import { AuthorDashboard } from "@/components/articles/AuthorDashboard";
import { getArticleActor } from "@/lib/article-access";
import { getAuthorArticles } from "@/lib/articles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AuthorDashboardPage() {
  const actor = await getArticleActor();
  const articles = actor.user ? await getAuthorArticles(actor.user.id) : [];
  const reviewIds = articles.filter((article) => ["changes_requested", "rejected"].includes(article.status)).map((article) => article.id);
  const admin = createSupabaseAdminClient();
  const reviews = admin && reviewIds.length
    ? (await admin.from("article_reviews").select("article_id,feedback,created_at").in("article_id", reviewIds).not("feedback", "is", null).order("created_at", { ascending: false })).data ?? []
    : [];
  const feedback: Record<string, string> = {};
  for (const review of reviews) if (!feedback[review.article_id]) feedback[review.article_id] = review.feedback as string;
  return <AuthorDashboard articles={articles} feedback={feedback} />;
}
