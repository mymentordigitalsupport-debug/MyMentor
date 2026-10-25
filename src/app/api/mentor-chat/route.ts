import { NextResponse } from "next/server";
import { checkMentorRateLimit, generateMentorReply, MentorInferenceError, type MentorChatInput } from "@/lib/mentor-ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

function validMessages(value: unknown): value is MentorChatInput[] {
  return Array.isArray(value) && value.length > 0 && value.length <= 8 && value.every((message) => {
    if (!message || typeof message !== "object") return false;
    const record = message as Record<string, unknown>;
    return (record.role === "user" || record.role === "assistant") && typeof record.content === "string" && record.content.trim().length > 0 && record.content.length <= 1_200;
  });
}

export async function POST(request: Request) {
  let body: { messages?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!validMessages(body.messages)) return NextResponse.json({ error: "Invalid chat messages." }, { status: 400 });

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const rateKey = user?.id ?? `ip:${forwarded}`;
  if (!checkMentorRateLimit(rateKey)) return NextResponse.json({ error: "Please wait a moment before sending another message." }, { status: 429 });

  let memberContext = "The visitor is not signed in. Explain that personal account information requires signing in through the normal My Mentor login.";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("display_name,role,onboarding_completed").eq("user_id", user.id).maybeSingle();
    memberContext = `Authenticated member context: display name ${JSON.stringify(profile?.display_name ?? "not set")}; role ${JSON.stringify(profile?.role ?? "user")}; onboarding completed ${profile?.onboarding_completed ? "yes" : "no"}. Do not disclose email addresses, IDs, tokens, passwords, or data about anyone else.`;
  }

  try {
    const reply = await generateMentorReply(body.messages, memberContext);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[mentor-chat] inference failed", { authenticated: Boolean(user), reason: error instanceof Error ? error.message : "unknown" });
    if (error instanceof MentorInferenceError && error.status === 429) {
      return NextResponse.json({ error: "My Mentor Guide is busy. Please try again in a moment." }, { status: 429 });
    }
    return NextResponse.json({ error: "My Mentor Guide is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
