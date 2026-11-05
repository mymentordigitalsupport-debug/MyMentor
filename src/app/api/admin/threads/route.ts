import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/admin/guards";
import { hasTrustedOrigin } from "@/lib/security";

function cleanEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, 254) : "";
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
}

async function requireAdmin() {
  const session = await requireAdminSession();
  if (!session.user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.role !== "admin") return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  const admin = createSupabaseAdminClient();
  if (!admin) return { response: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };
  return { admin, user: session.user };
}

export async function GET() {
  const access = await requireAdmin();
  if (access.response) return access.response;
  const { admin } = access;
  const [{ data: entries, error: entriesError }, { data: topics, error: topicsError }, { data: votes, error: votesError }, { data: commenters }, { data: bans }] = await Promise.all([
    admin.from("threads_entries").select("id,author_id,author_name,commenter_id,parent_id,post_id,topic_id,body,media_path,created_at").order("created_at", { ascending: false }).limit(500),
    admin.from("threads_topics").select("id,name,slug,position,created_at").order("position"),
    admin.from("threads_votes").select("entry_id,value").limit(10_000),
    admin.from("threads_commenters").select("id,email,normalized_email,name"),
    admin.from("threads_comment_bans").select("id,normalized_email,reason,created_at").order("created_at", { ascending: false }),
  ]);
  if (entriesError || topicsError || votesError) return NextResponse.json({ error: "Run supabase/threads_moderation.sql first." }, { status: 500 });
  const topicMap = new Map((topics ?? []).map((topic) => [topic.id, topic.name]));
  const commenterMap = new Map((commenters ?? []).map((commenter) => [commenter.id, commenter]));
  const reactionMap = new Map<string, number>();
  for (const vote of votes ?? []) reactionMap.set(vote.entry_id, (reactionMap.get(vote.entry_id) ?? 0) + vote.value);
  const rows = (entries ?? []).map((entry) => ({
    ...entry,
    topic: topicMap.get(entry.topic_id) ?? "Community",
    email: entry.commenter_id ? commenterMap.get(entry.commenter_id)?.email ?? null : null,
    likes: reactionMap.get(entry.id) ?? 0,
  }));
  return NextResponse.json({
    stats: { threads: rows.filter((entry) => !entry.parent_id).length, comments: rows.filter((entry) => entry.parent_id).length, likes: [...reactionMap.values()].filter((value) => value > 0).reduce((sum, value) => sum + value, 0), bans: bans?.length ?? 0 },
    topics: (topics ?? []).map((topic) => ({ ...topic, count: rows.filter((entry) => !entry.parent_id && entry.topic_id === topic.id).length })),
    entries: rows,
    bans: bans ?? [],
  });
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const access = await requireAdmin();
  if (access.response) return access.response;
  const { admin, user } = access;
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!input || typeof input.action !== "string") return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  if (input.action === "delete-entry") {
    const id = typeof input.id === "string" ? input.id : "";
    const { data: entry } = await admin.from("threads_entries").select("media_path").eq("id", id).maybeSingle();
    const { error } = await admin.from("threads_entries").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Unable to delete entry." }, { status: 400 });
    if (entry?.media_path) await admin.storage.from("threads_media").remove([entry.media_path]);
    return NextResponse.json({ ok: true });
  }

  if (input.action === "create-topic") {
    const name = typeof input.name === "string" ? input.name.trim().slice(0, 50) : "";
    const slug = slugify(name);
    if (!name || !slug) return NextResponse.json({ error: "Enter a valid topic name." }, { status: 400 });
    const { data: last } = await admin.from("threads_topics").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
    const { error } = await admin.from("threads_topics").insert({ name, slug, position: (last?.position ?? 0) + 10 });
    if (error) return NextResponse.json({ error: "Topic already exists." }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (input.action === "delete-topic") {
    const id = typeof input.id === "string" ? input.id : "";
    const { data: fallback } = await admin.from("threads_topics").select("id").eq("slug", "community").single();
    if (!fallback || fallback.id === id) return NextResponse.json({ error: "Community cannot be deleted." }, { status: 400 });
    await admin.from("threads_entries").update({ topic_id: fallback.id }).eq("topic_id", id);
    const { error } = await admin.from("threads_topics").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Unable to delete topic." }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (input.action === "ban-email") {
    const email = cleanEmail(input.email);
    const reason = typeof input.reason === "string" ? input.reason.trim().slice(0, 300) : null;
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    const bannedBy = user.id === "hardcoded-admin" ? null : user.id;
    const { error } = await admin.from("threads_comment_bans").upsert({ normalized_email: email, reason, banned_by: bannedBy }, { onConflict: "normalized_email" });
    if (error) return NextResponse.json({ error: "Unable to ban email address." }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (input.action === "unban-email") {
    const id = typeof input.id === "string" ? input.id : "";
    const { error } = await admin.from("threads_comment_bans").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Unable to remove ban." }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
