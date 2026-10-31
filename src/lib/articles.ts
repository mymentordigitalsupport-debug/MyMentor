import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const ARTICLE_STATUSES = [
  "draft",
  "pending_review",
  "changes_requested",
  "rejected",
  "published",
  "archived",
] as const;

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export type ArticleRecord = {
  id: string;
  author_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  cover_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: ArticleStatus;
  submitted_at: string | null;
  published_at: string | null;
  published_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  category?: { id: string; name: string; slug: string } | null;
  author_name?: string;
};

export type ArticleCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export function slugifyArticle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function articleStatusLabel(status: ArticleStatus) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function requireArticleAdminClient() {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase admin client is not configured.");
  return client;
}

async function addArticleDetails(articles: ArticleRecord[]) {
  if (!articles.length) return articles;

  const admin = requireArticleAdminClient();
  const authorIds = [...new Set(articles.map((article) => article.author_id))];
  const categoryIds = [...new Set(articles.map((article) => article.category_id).filter(Boolean))] as string[];
  const [applicationsResult, categoriesResult] = await Promise.all([
    admin.from("article_author_applications").select("user_id, public_name").in("user_id", authorIds),
    categoryIds.length
      ? admin.from("article_categories").select("id, name, slug").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (applicationsResult.error) throw applicationsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;

  const authors = new Map((applicationsResult.data ?? []).map((item) => [item.user_id, item.public_name]));
  const categories = new Map((categoriesResult.data ?? []).map((item) => [item.id, item]));
  return articles.map((article) => ({
    ...article,
    author_name: authors.get(article.author_id) ?? "My Mentor contributor",
    category: article.category_id ? categories.get(article.category_id) ?? null : null,
  }));
}

export async function getArticleCategories(): Promise<ArticleCategory[]> {
  const admin = requireArticleAdminClient();
  const { data, error } = await admin.from("article_categories").select("id, name, slug, description").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedArticles(limit?: number) {
  const admin = requireArticleAdminClient();
  let query = admin
    .from("article_articles")
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return addArticleDetails((data ?? []) as ArticleRecord[]);
}

export async function getPublishedArticleBySlug(slug: string) {
  const admin = requireArticleAdminClient();
  const { data, error } = await admin
    .from("article_articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  const [article] = await addArticleDetails(data ? [data as ArticleRecord] : []);
  return article ?? null;
}

export async function getAuthorArticles(authorId: string) {
  const admin = requireArticleAdminClient();
  const { data, error } = await admin
    .from("article_articles")
    .select("*")
    .eq("author_id", authorId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return addArticleDetails((data ?? []) as ArticleRecord[]);
}

export async function getAdminArticles() {
  const admin = requireArticleAdminClient();
  const { data, error } = await admin
    .from("article_articles")
    .select("*")
    .is("deleted_at", null)
    .order("submitted_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return addArticleDetails((data ?? []) as ArticleRecord[]);
}

export async function getAuthorApplication(userId: string) {
  const admin = requireArticleAdminClient();
  const { data, error } = await admin
    .from("article_author_applications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAuthorApplications() {
  const admin = requireArticleAdminClient();
  const { data, error } = await admin
    .from("article_author_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
