import { NextResponse } from "next/server";
import { generateMentorReply, MentorInferenceError, type MentorChatInput } from "@/lib/mentor-ai";
import { safetyReply } from "@/lib/mentor-safety";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMentorKnowledge } from "@/lib/mentor-knowledge";
import { mentorRouteInstructions, resolveMentorNavigation } from "@/lib/mentor-navigation";
import { hasTrustedOrigin, requestClientKey, takeRateLimit } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 30;

type ChatHistoryRow = {
  id: string;
  message_role: "user" | "assistant";
  content: string;
  created_at: string;
};

function validMessages(value: unknown): value is MentorChatInput[] {
  return Array.isArray(value) && value.length === 1 && value.every((message) => {
    if (!message || typeof message !== "object") return false;
    const record = message as Record<string, unknown>;
    return (record.role === "user" || record.role === "assistant") && typeof record.content === "string" && record.content.trim().length > 0 && record.content.length <= 1_200;
  });
}

async function saveConversationMessage(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string, messageRole: "user" | "assistant", content: string) {
  const { error } = await supabase.from("chatbot_conversation").insert({
    user_id: userId,
    message_role: messageRole,
    content: content.slice(0, 4_000),
  });
  if (error) console.error("[mentor-chat] conversation save failed", { messageRole, reason: error.message });
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ messages: [] });

  const { data, error } = await supabase
    .from("chatbot_conversation")
    .select("id,message_role,content,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) {
    console.error("[mentor-chat] conversation load failed", { reason: error.message });
    return NextResponse.json({ messages: [] });
  }
  return NextResponse.json({ messages: (data ?? []) as ChatHistoryRow[] });
}

async function getMemberContext(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string) {
  const [profileResult, courseProgressResult, lessonProgressResult, journalResult, moodResult] = await Promise.all([
    supabase.from("profiles").select("display_name,username,is_anonymous,preferred_guidance_path,personal_goal,onboarding_completed,role").eq("id", userId).maybeSingle(),
    supabase.from("user_course_progress").select("course_version_id,last_active_at,started_at,completed_at").eq("user_id", userId).order("last_active_at", { ascending: false }).limit(1),
    supabase.from("user_lesson_progress").select("lesson_id,status,started_at,completed_at,last_opened_at").eq("user_id", userId),
    supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("mood_checkins").select("mood,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
  ]);

  const profile = profileResult.data;
  const courseProgress = courseProgressResult.data?.[0] ?? null;
  const lessonProgress = lessonProgressResult.data ?? [];
  const completedLessonIds = new Set(lessonProgress.filter((row) => row.status === "completed" || row.completed_at).map((row) => row.lesson_id));
  let activeCourse: { title: string; guidance_path: string | null; lessons_completed: number; lessons_total: number; course_completed: boolean } | null = null;

  if (courseProgress?.course_version_id) {
    const { data: version } = await supabase.from("course_versions").select("id,title,guidance_path").eq("id", courseProgress.course_version_id).maybeSingle();
    if (version) {
      const { data: chapters } = await supabase.from("chapters").select("id").eq("course_version_id", version.id).eq("is_published", true);
      const chapterIds = (chapters ?? []).map((chapter) => chapter.id);
      const { count: totalLessons } = chapterIds.length
        ? await supabase.from("lessons").select("id", { count: "exact", head: true }).in("chapter_id", chapterIds).eq("is_published", true)
        : { count: 0 };
      activeCourse = {
        title: version.title,
        guidance_path: version.guidance_path,
        lessons_completed: completedLessonIds.size,
        lessons_total: totalLessons ?? 0,
        course_completed: Boolean(courseProgress.completed_at),
      };
    }
  }

  const account = {
    display_name: profile?.display_name ?? profile?.username ?? "not set",
    account_role: profile?.role ?? "member",
    anonymous_mode: Boolean(profile?.is_anonymous),
    guidance_path: profile?.preferred_guidance_path ?? "not set",
    onboarding_completed: Boolean(profile?.onboarding_completed),
    personal_goal: profile?.personal_goal ?? "not set",
    active_course: activeCourse,
    journal_entries: journalResult.count ?? 0,
    latest_mood: moodResult.data?.[0]?.mood ?? "not recorded",
  };

  const accountSummary = [
    "# Your account",
    `- **Guidance path:** ${account.guidance_path}`,
    activeCourse
      ? `- **Current course:** ${activeCourse.title}${activeCourse.guidance_path ? ` (${activeCourse.guidance_path})` : ""}`
      : "- **Current course:** Not started yet",
    activeCourse ? `- **Lesson progress:** ${activeCourse.lessons_completed} of ${activeCourse.lessons_total} complete` : null,
    `- **Journal entries:** ${account.journal_entries}`,
    `- **Latest mood check-in:** ${account.latest_mood}`,
    account.personal_goal !== "not set" ? `- **Personal goal:** ${account.personal_goal}` : null,
  ].filter(Boolean).join("\n");

  return { accountSummary, role: profile?.role ?? null };
}

function isAccountRequest(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("my account") || normalized.includes("account details") || normalized.includes("account information") || /\b(my profile|my course|my progress|my lesson|my journal|my mood|my goal|what course am i|how many lessons have i|my learning)\b/i.test(normalized);
}

function needsKnowledge(message: string) {
  return /\b(mymentor|my mentor|course|chapter|lesson|article|author|journal|dashboard|register|craig)\b/i.test(message);
}

function isCourseCountRequest(message: string) {
  return /\b(how many|number of|count of|total)\b.*\b(course|courses)\b|\b(course|courses)\b.*\b(how many|number|count|total)\b/i.test(message);
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  let body: { messages?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!validMessages(body.messages)) return NextResponse.json({ error: "Invalid chat messages." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const rateKey = user?.id ?? `ip:${requestClientKey(request)}`;
  if (!await takeRateLimit(`mentor-chat:${rateKey}`, 600, 20)) {
    return NextResponse.json({ error: "Please wait a moment before sending another message." }, { status: 429 });
  }
  const latestMessage = body.messages[body.messages.length - 1].content;
  if (user) await saveConversationMessage(supabase, user.id, "user", latestMessage);

  const member = user
    ? await getMemberContext(supabase, user.id)
    : { accountSummary: null, role: null };

  try {
    const navigation = resolveMentorNavigation(latestMessage, member.role, Boolean(user));
    const response = async (reply: string) => {
      if (user) await saveConversationMessage(supabase, user.id, "assistant", reply);
      return NextResponse.json({ reply, navigation });
    };
    const urgentSafetyReply = safetyReply(latestMessage);
    if (urgentSafetyReply) return response(urgentSafetyReply);
    if (isCourseCountRequest(latestMessage)) {
      return response("There is **1 full course**: Uprooting Drug Abuse. From Addicts to Leaders and Protecting the Next Generation are **guidance books**, not full courses.");
    }
    if (!user && isAccountRequest(latestMessage)) return response("Please sign in through My Mentor to view your account details.");
    if (member.accountSummary && isAccountRequest(latestMessage)) return response(member.accountSummary);
    const knowledgeContext = needsKnowledge(latestMessage) ? await getMentorKnowledge(latestMessage) : "";
    const reply = await generateMentorReply(body.messages, knowledgeContext, mentorRouteInstructions(member.role, Boolean(user)));
    return response(reply);
  } catch (error) {
    console.error("[mentor-chat] inference failed", { authenticated: Boolean(user), reason: error instanceof Error ? error.message : "unknown" });
    if (error instanceof MentorInferenceError && error.status === 429) {
      return NextResponse.json({ error: "My Mentor Guide is busy. Please try again in a moment." }, { status: 429 });
    }
    return NextResponse.json({ error: "My Mentor Guide is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
