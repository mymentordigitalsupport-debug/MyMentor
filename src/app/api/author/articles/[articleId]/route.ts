import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getArticleActor, isApprovedAuthor } from "@/lib/article-access";
import { slugifyArticle } from "@/lib/articles";

type Context = { params: Promise<{ articleId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const actor = await getArticleActor();
  if (!actor.user || !isApprovedAuthor(actor.role)) return NextResponse.json({ error: "Author access required." }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Article service is unavailable." }, { status: 503 });
  const { articleId } = await params;
  const body = await request.json() as Record<string, unknown>;
  const { data: current, error: currentError } = await admin.from("article_articles").select("id,status,author_id").eq("id", articleId).maybeSingle();
  if (currentError || !current || current.author_id !== actor.user.id) return NextResponse.json({ error: "Article not found." }, { status: 404 });

  if (body.action === "submit") {
    if (!['draft', 'changes_requested', 'rejected'].includes(current.status)) return NextResponse.json({ error: "This article cannot be submitted from its current status." }, { status: 409 });
    const { error } = await admin.from("article_articles").update({ status: "pending_review", submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", articleId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await admin.from("article_reviews").insert({ article_id: articleId, reviewer_id: actor.user.id, action: "submitted" });
    return NextResponse.json({ success: true });
  }

  if (!['draft', 'changes_requested', 'rejected'].includes(current.status)) return NextResponse.json({ error: "Only drafts or returned articles can be edited." }, { status: 409 });
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 180) : "";
  const slug = slugifyArticle(typeof body.slug === "string" ? body.slug : title);
  if (!title || !slug) return NextResponse.json({ error: "An article title is required." }, { status: 400 });
  const update = {
    title, slug,
    excerpt: typeof body.excerpt === "string" ? body.excerpt.trim().slice(0, 500) : "",
    content_markdown: typeof body.contentMarkdown === "string" ? body.contentMarkdown.trim().slice(0, 50000) : "",
    cover_image_url: typeof body.coverImageUrl === "string" && body.coverImageUrl.trim() ? body.coverImageUrl.trim().slice(0, 1000) : null,
    category_id: typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null,
    seo_title: typeof body.seoTitle === "string" && body.seoTitle.trim() ? body.seoTitle.trim().slice(0, 180) : null,
    seo_description: typeof body.seoDescription === "string" && body.seoDescription.trim() ? body.seoDescription.trim().slice(0, 320) : null,
    status: current.status === "rejected" ? "draft" : current.status,
    updated_at: new Date().toISOString(),
  };
  const { error } = await admin.from("article_articles").update(update).eq("id", articleId);
  return error ? NextResponse.json({ error: error.message }, { status: 409 }) : NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: Context) {
  const actor = await getArticleActor();
  if (!actor.user || !isApprovedAuthor(actor.role)) return NextResponse.json({ error: "Author access required." }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Article service is unavailable." }, { status: 503 });
  const { articleId } = await params;
  const { error } = await admin.from("article_articles").update({ deleted_at: new Date().toISOString() }).eq("id", articleId).eq("author_id", actor.user.id).in("status", ["draft", "changes_requested", "rejected"]);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
}
