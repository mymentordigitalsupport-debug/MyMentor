import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { queueAdminNotification } from "@/lib/transactional-email";

type ThreadEntry = {
  id: string; author_id: string; author_name: string; is_anonymous: boolean;
  parent_id: string | null; post_id: string | null; body: string; media_path: string | null;
  media_type: "image" | "video" | null; created_at: string;
};

const ACCEPTED_MEDIA = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"]);

function labelForDate(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function splitEntry(body: string) {
  const [firstLine, ...rest] = body.trim().split("\n");
  return { title: firstLine.slice(0, 100) || "A community thought", body: rest.join("\n").trim() || (firstLine.length > 100 ? body : "") };
}

function requireText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 3_000 ? value.trim() : null;
}

export async function GET() {
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Threads is not configured." }, { status: 503 });

  const sessionClient = await createSupabaseServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  const [{ data: entries, error: entriesError }, { data: votes, error: votesError }] = await Promise.all([
    admin.from("threads_entries").select("id,author_id,author_name,is_anonymous,parent_id,post_id,body,media_path,media_type,created_at").order("created_at", { ascending: false }).limit(200),
    admin.from("threads_votes").select("entry_id,user_id,value").limit(5_000),
  ]);
  if (entriesError || votesError) return NextResponse.json({ error: "Unable to load Threads." }, { status: 500 });

  const reactions = new Map<string, { likes: number; disliked: boolean; liked: boolean }>();
  for (const vote of votes ?? []) {
    const current = reactions.get(vote.entry_id) ?? { likes: 0, liked: false, disliked: false };
    current.likes += vote.value;
    if (vote.user_id === user?.id) { current.liked = vote.value === 1; current.disliked = vote.value === -1; }
    reactions.set(vote.entry_id, current);
  }
  const rows = (entries ?? []) as ThreadEntry[];
  const replies = new Map<string, ThreadEntry[]>();
  rows.filter((entry) => entry.parent_id).forEach((entry) => {
    const postId = entry.post_id!;
    replies.set(postId, [...(replies.get(postId) ?? []), entry]);
  });
  const mediaUrls = new Map<string, string>();
  await Promise.all(rows.filter((entry) => entry.media_path).map(async (entry) => {
    const { data } = await admin.storage.from("threads_media").createSignedUrl(entry.media_path!, 60 * 60);
    if (data?.signedUrl) mediaUrls.set(entry.id, data.signedUrl);
  }));
  const posts = rows.filter((entry) => !entry.parent_id).map((entry) => {
    const reaction = reactions.get(entry.id) ?? { likes: 0, liked: false, disliked: false };
    return {
      id: entry.id, topic: "Community", ...splitEntry(entry.body), author: entry.author_name,
      age: labelForDate(entry.created_at), order: new Date(entry.created_at).getTime(), likes: reaction.likes,
      liked: reaction.liked, disliked: reaction.disliked, saved: false, avatar: "you",
      canDelete: entry.author_id === user?.id,
      commentCount: (replies.get(entry.id) ?? []).length,
      attachment: entry.media_path && entry.media_type && mediaUrls.get(entry.id) ? { url: mediaUrls.get(entry.id), name: "Thread attachment", type: entry.media_type } : undefined,
      comments: (replies.get(entry.id) ?? []).sort((a, b) => a.created_at.localeCompare(b.created_at)).map((reply) => {
        const replyReaction = reactions.get(reply.id) ?? { likes: 0, liked: false, disliked: false };
        return { id: reply.id, author: reply.author_name, body: reply.body, parentId: reply.parent_id, age: labelForDate(reply.created_at), likes: replyReaction.likes, liked: replyReaction.liked, canDelete: reply.author_id === user?.id };
      }),
    };
  });
  return NextResponse.json({ posts, signedIn: Boolean(user) });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to join the conversation." }, { status: 401 });

  const isMultipart = request.headers.get("content-type")?.includes("multipart/form-data");
  const form = isMultipart ? await request.formData().catch(() => null) : null;
  const input = form ? Object.fromEntries(form.entries()) : await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!input) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const action = input.action;

  if (action === "post" || action === "reply") {
    const body = requireText(input.body);
    const postId = typeof input.postId === "string" ? input.postId : null;
    const parentId = typeof input.parentId === "string" ? input.parentId : null;
    const attachment = form?.get("attachment");
    const file = attachment instanceof File ? attachment : null;
    if ((!body && !file) || (action === "reply" && (!body || !postId || !parentId || file))) return NextResponse.json({ error: "Write a message before posting." }, { status: 400 });
    if (file && (!ACCEPTED_MEDIA.has(file.type) || file.size > (file.type.startsWith("video/") ? 50 : 10) * 1024 * 1024)) return NextResponse.json({ error: "Choose a supported image up to 10 MB or video up to 50 MB." }, { status: 400 });
    let mediaPath: string | null = null;
    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "attachment";
      mediaPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("threads_media").upload(mediaPath, file, { contentType: file.type, upsert: false });
      if (uploadError) return NextResponse.json({ error: "Unable to upload your attachment." }, { status: 400 });
    }
    const { error } = await supabase.from("threads_entries").insert({ body: body ?? "", rules_accepted: true, ...(mediaPath ? { media_path: mediaPath, media_type: file!.type.startsWith("video/") ? "video" : "image" } : {}), ...(action === "reply" ? { post_id: postId, parent_id: parentId } : {}) });
    if (error && mediaPath) await supabase.storage.from("threads_media").remove([mediaPath]);
    if (error) return NextResponse.json({ error: error.message.includes("10 seconds") ? "Please wait a few seconds before posting again." : "Unable to publish your message." }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === "vote") {
    const entryId = typeof input.entryId === "string" ? input.entryId : null;
    const value = input.value === 1 || input.value === -1 ? input.value : null;
    if (!entryId) return NextResponse.json({ error: "Invalid reaction." }, { status: 400 });
    if (input.value === null) {
      const { error } = await supabase.from("threads_votes").delete().eq("entry_id", entryId).eq("user_id", user.id);
      if (error) return NextResponse.json({ error: "Unable to save your reaction." }, { status: 400 });
      return NextResponse.json({ ok: true });
    }
    if (!value) return NextResponse.json({ error: "Invalid reaction." }, { status: 400 });
    const { error } = await supabase.from("threads_votes").upsert({ entry_id: entryId, user_id: user.id, value });
    if (error) return NextResponse.json({ error: "Unable to save your reaction." }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === "report") {
    const entryId = typeof input.entryId === "string" ? input.entryId : null;
    if (!entryId) return NextResponse.json({ error: "Invalid comment." }, { status: 400 });
    const admin = createSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: "Reporting is not configured." }, { status: 503 });
    const { data: entry } = await admin.from("threads_entries").select("author_name,body").eq("id", entryId).maybeSingle();
    if (!entry) return NextResponse.json({ error: "That comment is no longer available." }, { status: 404 });
    try {
      await queueAdminNotification(admin, {
        eventKey: `thread-report:${user.id}:${entryId}`,
        eventType: "thread_comment_reported",
        title: "A Threads comment was reported",
        details: `Reported comment by ${entry.author_name}: ${entry.body.slice(0, 500)}`,
        pathname: "/admin",
      });
    } catch {
      return NextResponse.json({ error: "Unable to send the report right now." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    const entryId = typeof input.entryId === "string" ? input.entryId : null;
    if (!entryId) return NextResponse.json({ error: "Invalid thread." }, { status: 400 });
    const { error, count } = await supabase.from("threads_entries").delete({ count: "exact" }).eq("id", entryId).eq("author_id", user.id);
    if (error) return NextResponse.json({ error: "Unable to delete this thread." }, { status: 400 });
    if (!count) return NextResponse.json({ error: "You can only delete your own posts." }, { status: 403 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown Threads action." }, { status: 400 });
}
