import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/admin/guards";
import { hasTrustedOrigin } from "@/lib/security";

type Template = {
  welcomeMessage: string;
  teachingContent: string;
  scriptureReference: string;
  mentorQuote: string;
  videoUrl: string;
  videoCaption: string;
  reflectionPrompt: string;
  savedInsightPrompt: string;
  dailyAction: string;
  actionPlan: string;
  encouragementMessage: string;
  nextStep: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const actor = await requireAdminSession();
  if (!actor.user || actor.role !== "admin") return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Admin data service is unavailable." }, { status: 503 });

  const body = await request.json().catch(() => null) as { lessonId?: string; status?: "draft" | "published"; template?: Partial<Template> } | null;
  const lessonId = clean(body?.lessonId);
  if (!lessonId || !body?.template) return NextResponse.json({ error: "Lesson and content are required." }, { status: 400 });

  const { data: lesson, error: lessonLookupError } = await admin.from("lessons").select("id").eq("id", lessonId).maybeSingle();
  if (lessonLookupError || !lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

  const { data: existing, error: blocksError } = await admin.from("lesson_content_blocks").select("id,block_type,sort_order,content").eq("lesson_id", lessonId).order("sort_order");
  if (blocksError) return NextResponse.json({ error: blocksError.message }, { status: 400 });

  const template = body.template;
  const blocks = [
    { block_type: "welcome", content: { message: clean(template.welcomeMessage) } },
    { block_type: "reading", content: { body: clean(template.teachingContent), scripture: clean(template.scriptureReference), quote: clean(template.mentorQuote) } },
    { block_type: "video", content: { url: clean(template.videoUrl), caption: clean(template.videoCaption) } },
    { block_type: "pause_reflect", content: { question: clean(template.reflectionPrompt), savedInsightPrompt: clean(template.savedInsightPrompt) } },
    { block_type: "daily_action", content: { action: clean(template.dailyAction), plan: clean(template.actionPlan) } },
    { block_type: "complete", content: { message: clean(template.encouragementMessage), nextStep: clean(template.nextStep) } },
  ];

  for (const [index, block] of blocks.entries()) {
    const existingBlock = (existing ?? []).find((item) => item.block_type === block.block_type);
    const values = { block_type: block.block_type, content: block.content, sort_order: existingBlock?.sort_order ?? index + 1, updated_at: new Date().toISOString() };
    const result = existingBlock
      ? await admin.from("lesson_content_blocks").update(values).eq("id", existingBlock.id)
      : await admin.from("lesson_content_blocks").insert({ ...values, lesson_id: lessonId });
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  const status = body.status === "published" ? "published" : "draft";
  const lessonUpdate = {
    status,
    is_published: status === "published",
    opening_message: clean(template.welcomeMessage) || null,
    encouragement_message: clean(template.encouragementMessage) || null,
    updated_at: new Date().toISOString(),
  };
  const { error: updateError } = await admin.from("lessons").update(lessonUpdate).eq("id", lessonId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({ success: true, status });
}

