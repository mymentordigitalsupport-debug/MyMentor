import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getArticleActor, isApprovedAuthor } from "@/lib/article-access";
import { getAuthorArticles, slugifyArticle } from "@/lib/articles";

function articleFields(payload: Record<string, unknown>) {
  const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 180) : "";
  const requestedSlug = typeof payload.slug === "string" ? payload.slug : title;
  return {
    title,
    slug: slugifyArticle(requestedSlug),
    excerpt: typeof payload.excerpt === "string" ? payload.excerpt.trim().slice(0, 500) : "",
    content_markdown: typeof payload.contentMarkdown === "string" ? payload.contentMarkdown.trim().slice(0, 50000) : "",
    cover_image_url: typeof payload.coverImageUrl === "string" && payload.coverImageUrl.trim() ? payload.coverImageUrl.trim().slice(0, 1000) : null,
    category_id: typeof payload.categoryId === "string" && payload.categoryId ? payload.categoryId : null,
    seo_title: typeof payload.seoTitle === "string" && payload.seoTitle.trim() ? payload.seoTitle.trim().slice(0, 180) : null,
    seo_description: typeof payload.seoDescription === "string" && payload.seoDescription.trim() ? payload.seoDescription.trim().slice(0, 320) : null,
  };
}

export async function GET() {
  const actor = await getArticleActor();
  if (!actor.user || !isApprovedAuthor(actor.role)) return NextResponse.json({ error: "Author access required." }, { status: 403 });
  return NextResponse.json({ articles: await getAuthorArticles(actor.user.id) });
}

export async function POST(request: Request) {
  const actor = await getArticleActor();
  if (!actor.user || !isApprovedAuthor(actor.role)) return NextResponse.json({ error: "Author access required." }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Article service is unavailable." }, { status: 503 });
  try {
    const fields = articleFields(await request.json());
    if (!fields.title || !fields.slug) return NextResponse.json({ error: "An article title is required." }, { status: 400 });
    const { data, error } = await admin.from("article_articles").insert({ ...fields, author_id: actor.user.id }).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ article: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create article." }, { status: 400 });
  }
}
