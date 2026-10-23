import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getArticleActor, isArticleAdmin } from "@/lib/article-access";
import { getAdminArticles, getAuthorApplications, slugifyArticle } from "@/lib/articles";

export async function GET() {
  const actor = await getArticleActor();
  if (!actor.user || !isArticleAdmin(actor.role)) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const [articles, applications] = await Promise.all([getAdminArticles(), getAuthorApplications()]);
  return NextResponse.json({ articles, applications });
}

export async function POST(request: Request) {
  const actor = await getArticleActor();
  if (!actor.user || !isArticleAdmin(actor.role)) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Article service is unavailable." }, { status: 503 });
  const body = await request.json() as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 180) : "";
  const slug = slugifyArticle(typeof body.slug === "string" ? body.slug : title);
  if (!title || !slug) return NextResponse.json({ error: "An article title is required." }, { status: 400 });
  const { data, error } = await admin.from("article_articles").insert({
    author_id: actor.user.id, title, slug,
    excerpt: typeof body.excerpt === "string" ? body.excerpt.trim().slice(0, 500) : "",
    content_markdown: typeof body.contentMarkdown === "string" ? body.contentMarkdown.trim().slice(0, 50000) : "",
    cover_image_url: typeof body.coverImageUrl === "string" && body.coverImageUrl.trim() ? body.coverImageUrl.trim().slice(0, 1000) : null,
    category_id: typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null,
    seo_title: typeof body.seoTitle === "string" && body.seoTitle.trim() ? body.seoTitle.trim().slice(0, 180) : null,
    seo_description: typeof body.seoDescription === "string" && body.seoDescription.trim() ? body.seoDescription.trim().slice(0, 320) : null,
  }).select("id").single();
  return error ? NextResponse.json({ error: error.message }, { status: 409 }) : NextResponse.json({ article: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const actor = await getArticleActor();
  if (!actor.user || !isArticleAdmin(actor.role)) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Article service is unavailable." }, { status: 503 });
  const body = await request.json() as Record<string, unknown>;

  if (body.type === "application") {
    const id = typeof body.id === "string" ? body.id : "";
    const status = body.status === "approved" || body.status === "rejected" ? body.status : null;
    const feedback = typeof body.feedback === "string" ? body.feedback.trim().slice(0, 2000) : "";
    if (!id || !status || (status === "rejected" && !feedback)) return NextResponse.json({ error: "A decision and rejection feedback are required." }, { status: 400 });
    const { data: application, error: findError } = await admin.from("article_author_applications").select("user_id").eq("id", id).maybeSingle();
    if (findError || !application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
    const reviewedAt = new Date().toISOString();
    const { error: applicationError } = await admin.from("article_author_applications").update({ status, reviewed_by: actor.user.id, reviewed_at: reviewedAt, review_feedback: feedback || null, updated_at: reviewedAt }).eq("id", id);
    if (applicationError) return NextResponse.json({ error: applicationError.message }, { status: 400 });
    const { error: profileError } = await admin.from("profiles").update({ role: status === "approved" ? "author" : "author_rejected", updated_at: reviewedAt }).eq("user_id", application.user_id);
    return profileError ? NextResponse.json({ error: profileError.message }, { status: 400 }) : NextResponse.json({ success: true });
  }

  const articleId = typeof body.articleId === "string" ? body.articleId : "";
  const action = body.action === "edit" || body.action === "publish" || body.action === "changes_requested" || body.action === "reject" || body.action === "archive" ? body.action : null;
  const feedback = typeof body.feedback === "string" ? body.feedback.trim().slice(0, 2000) : "";
  if (!articleId || !action || ((action === "changes_requested" || action === "reject") && !feedback)) return NextResponse.json({ error: "A review action and required feedback are missing." }, { status: 400 });
  if (action === "edit") {
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 180) : "";
    const slug = slugifyArticle(typeof body.slug === "string" ? body.slug : title);
    if (!title || !slug) return NextResponse.json({ error: "An article title is required." }, { status: 400 });
    const { error } = await admin.from("article_articles").update({
      title, slug,
      excerpt: typeof body.excerpt === "string" ? body.excerpt.trim().slice(0, 500) : "",
      content_markdown: typeof body.contentMarkdown === "string" ? body.contentMarkdown.trim().slice(0, 50000) : "",
      cover_image_url: typeof body.coverImageUrl === "string" && body.coverImageUrl.trim() ? body.coverImageUrl.trim().slice(0, 1000) : null,
      category_id: typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null,
      seo_title: typeof body.seoTitle === "string" && body.seoTitle.trim() ? body.seoTitle.trim().slice(0, 180) : null,
      seo_description: typeof body.seoDescription === "string" && body.seoDescription.trim() ? body.seoDescription.trim().slice(0, 320) : null,
      updated_at: new Date().toISOString(),
    }).eq("id", articleId);
    return error ? NextResponse.json({ error: error.message }, { status: 409 }) : NextResponse.json({ success: true });
  }
  const now = new Date().toISOString();
  const status = action === "publish" ? "published" : action === "reject" ? "rejected" : action;
  const update: Record<string, unknown> = { status, updated_at: now };
  if (action === "publish") Object.assign(update, { published_at: now, published_by: actor.user.id });
  const { error } = await admin.from("article_articles").update(update).eq("id", articleId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await admin.from("article_reviews").insert({ article_id: articleId, reviewer_id: actor.user.id, action: action === "publish" ? "published" : action === "reject" ? "rejected" : action, feedback: feedback || null });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const actor = await getArticleActor();
  if (!actor.user || !isArticleAdmin(actor.role)) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Article service is unavailable." }, { status: 503 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Article ID is required." }, { status: 400 });
  const { error } = await admin.from("article_articles").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
}
