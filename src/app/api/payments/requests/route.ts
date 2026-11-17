import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasTrustedOrigin } from "@/lib/security";
import { isPaymentProduct } from "@/lib/payments";
import { notifyPaymentChange } from "@/lib/payment-email";

type AccessLevel = "chapter_1" | "full_course" | null;

async function getCourseAccess(admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, userId: string, courseId: string): Promise<AccessLevel> {
  const { data: versions, error: versionsError } = await admin.from("course_versions").select("id").eq("course_id", courseId);
  if (versionsError) throw new Error("Unable to load course access.");
  const versionIds = (versions ?? []).map((version) => version.id);
  if (!versionIds.length) return null;
  const { data: entitlements, error: entitlementsError } = await admin
    .from("course_entitlements")
    .select("access_level")
    .eq("user_id", userId)
    .eq("active", true)
    .in("course_version_id", versionIds);
  if (entitlementsError) throw new Error("Unable to load course access.");
  if ((entitlements ?? []).some((entitlement) => entitlement.access_level === "full_course")) return "full_course";
  if ((entitlements ?? []).some((entitlement) => entitlement.access_level === "chapter_1")) return "chapter_1";
  return null;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data, error } = await supabase.from("payment_requests").select("id,product_code,amount_cents,payment_reference,status,admin_note,submitted_at,created_at,updated_at,payment_proofs(id,storage_path,created_at)").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load payment requests." }, { status: 500 });
  const activePayment = (data ?? []).find((row) => ["pending", "under_review", "needs_resubmission"].includes(row.status)) ?? null;
  const admin = createSupabaseAdminClient();
  let bank = null;
  let accessLevel: AccessLevel = null;
  let onboardingCompleted = false;
  if (admin) {
    const { data: settings } = await admin.from("payment_settings").select("bank_name,account_holder,account_number,branch_code,instructions").eq("is_active", true).maybeSingle();
    bank = settings ?? null;
    const { data: profile } = await admin.from("profiles").select("selected_course_id,active_course_version_id,onboarding_completed").eq("user_id", user.id).maybeSingle();
    onboardingCompleted = Boolean(profile?.onboarding_completed);
    let courseId = profile?.selected_course_id ?? null;
    if (!courseId && profile?.active_course_version_id) {
      const { data: activeVersion } = await admin.from("course_versions").select("course_id").eq("id", profile.active_course_version_id).maybeSingle();
      courseId = activeVersion?.course_id ?? null;
    }
    if (courseId) {
      try {
        accessLevel = await getCourseAccess(admin, user.id, courseId);
      } catch {
        return NextResponse.json({ error: "Unable to load payment access." }, { status: 500 });
      }
    }
  }
  return NextResponse.json({
    requests: data ?? [],
    activePayment,
    bank,
    accessLevel,
    onboardingCompleted,
  });
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { productCode?: unknown } | null;
  if (!isPaymentProduct(body?.productCode)) return NextResponse.json({ error: "Choose a valid payment product." }, { status: 400 });
  const { data: activeRequest } = await supabase
    .from("payment_requests")
    .select("id,payment_reference,status")
    .eq("user_id", user.id)
    .in("status", ["pending", "under_review", "needs_resubmission"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (activeRequest) {
    return NextResponse.json({
      error: `You already have a ${activeRequest.status.replaceAll("_", " ")} payment request (${activeRequest.payment_reference}). Complete or wait for this request first.`,
      payment: activeRequest,
    }, { status: 409 });
  }
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Payment service is unavailable." }, { status: 503 });
  const { data: product, error: productError } = await admin.from("payment_products").select("code,amount_cents,access_level").eq("code", body.productCode).eq("is_active", true).maybeSingle();
  if (productError || !product) return NextResponse.json({ error: "That payment product is unavailable." }, { status: 400 });
  const { data: profile } = await admin.from("profiles").select("preferred_guidance_path,selected_course_id,active_course_version_id").eq("user_id", user.id).maybeSingle();
  const guidancePath = profile?.preferred_guidance_path === "christian" ? "christian" : "religious";
  const { data: versions } = await admin.from("course_versions").select("id,course_id,guidance_path,courses(title)").eq("guidance_path", guidancePath);
  const selectedVersion = (versions ?? []).find((version) => version.id === profile?.active_course_version_id)
    ?? (versions ?? []).find((version) => version.course_id === profile?.selected_course_id)
    ?? (versions ?? []).find((version) => (Array.isArray(version.courses) ? version.courses[0]?.title : "") === "Uprooting Drug Abuse")
    ?? versions?.[0];
  if (!selectedVersion?.id) return NextResponse.json({ error: "No course is available for this account." }, { status: 409 });
  let accessLevel: AccessLevel;
  try {
    accessLevel = await getCourseAccess(admin, user.id, selectedVersion.course_id);
  } catch {
    return NextResponse.json({ error: "Unable to confirm your course access." }, { status: 500 });
  }
  if (body.productCode === "chapter_1" && accessLevel) {
    return NextResponse.json({ error: accessLevel === "full_course" ? "Your full course is already unlocked." : "Chapter 1 is already unlocked. Choose the R50 upgrade when you are ready." }, { status: 409 });
  }
  if (body.productCode === "full_course" && accessLevel === "full_course") {
    return NextResponse.json({ error: "Your full course is already unlocked." }, { status: 409 });
  }
  if (body.productCode === "full_course" && accessLevel === "chapter_1") {
    return NextResponse.json({ error: "Chapter 1 is already unlocked. Choose the R50 upgrade instead." }, { status: 409 });
  }
  if (body.productCode === "full_course_upgrade" && accessLevel !== "chapter_1") {
    return NextResponse.json({ error: accessLevel === "full_course" ? "Your full course is already unlocked." : "The R50 upgrade is available after Chapter 1 is unlocked." }, { status: 409 });
  }
  let chapterId: string | null = null;
  if (product.access_level === "chapter_1") {
    const { data: firstChapter } = await admin.from("chapters").select("id").eq("course_version_id", selectedVersion.id).eq("is_published", true).order("sort_order", { ascending: true }).limit(1).maybeSingle();
    chapterId = firstChapter?.id ?? null;
    if (!chapterId) return NextResponse.json({ error: "Chapter 1 is not available yet." }, { status: 409 });
  }
  const reference = `MM-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
  const { data: settings } = await admin.from("payment_settings").select("bank_name,account_holder,account_number,branch_code,instructions").eq("is_active", true).maybeSingle();
  if (!settings?.bank_name || !settings.account_holder || !settings.account_number) {
    return NextResponse.json({ error: "EFT payments are temporarily unavailable. Please try again later." }, { status: 503 });
  }
  const { data: payment, error } = await supabase.from("payment_requests").insert({ user_id: user.id, product_code: product.code, course_version_id: selectedVersion.id, chapter_id: chapterId, amount_cents: product.amount_cents, payment_reference: reference, status: "pending" }).select("id,product_code,amount_cents,payment_reference,status").single();
  if (error || !payment) return NextResponse.json({ error: "Unable to start payment request." }, { status: 500 });
  await notifyPaymentChange(admin, payment.id, "paymentRequestCreated");
  return NextResponse.json({ payment, bank: settings ?? null }, { status: 201 });
}
