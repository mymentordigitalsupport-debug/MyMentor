import type { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatZar } from "@/lib/payments";
import { queueAdminNotification, queueUserEmail, transactionalEmailUrl, type TransactionalTemplate } from "@/lib/transactional-email";

type Admin = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;
type PaymentTemplate = Extract<TransactionalTemplate, `payment${string}`>;

const productLabels: Record<string, string> = {
  chapter_1: "Chapter 1",
  full_course: "Full course",
  full_course_upgrade: "Full course upgrade",
};

export async function notifyPaymentChange(admin: Admin, paymentId: string, template: PaymentTemplate) {
  try {
    return await queuePaymentChange(admin, paymentId, template);
  } catch {
    console.error("[payment-email] notification failed", { paymentId, template });
    return false;
  }
}

async function queuePaymentChange(admin: Admin, paymentId: string, template: PaymentTemplate) {
  const { data: payment, error } = await admin.from("payment_requests")
    .select("id,user_id,product_code,amount_cents,payment_reference,status,admin_note,updated_at,submitted_at")
    .eq("id", paymentId).maybeSingle();
  if (error || !payment) {
    console.error("[payment-email] payment lookup failed", { paymentId, template });
    return false;
  }

  const transition = template === "paymentProofReceived" ? payment.submitted_at : payment.updated_at;
  const eventKey = `payment:${payment.id}:${template}:${transition ?? "initial"}`;
  const eventType = `payment_${template.replace(/^payment/, "").replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).replace(/^_/, "")}`;
  const extraPayload = {
    payment_product: productLabels[payment.product_code] ?? "course",
    payment_amount: formatZar(payment.amount_cents),
    payment_reference: payment.payment_reference,
    payment_note: payment.admin_note?.trim() || "No reviewer reason was recorded. Email hello@mymentor.digital with your reference for help.",
    payments_url: transactionalEmailUrl("/payments"),
    course_url: transactionalEmailUrl("/course"),
  };

  let memberNotified = true;
  try {
    memberNotified = await queueUserEmail(admin, { userId: payment.user_id, eventKey, eventType, template, extraPayload });
  } catch {
    memberNotified = false;
    console.error("[payment-email] member notification failed", { paymentId, template });
  }

  if (template === "paymentRequestCreated" || template === "paymentProofReceived") {
    try {
      await queueAdminNotification(admin, {
        eventKey: `${eventKey}:admin`,
        eventType: `${eventType}_admin`,
        title: template === "paymentRequestCreated" ? "New EFT request" : "EFT proof ready for review",
        details: `${productLabels[payment.product_code] ?? "Course"} · ${formatZar(payment.amount_cents)} · ${payment.payment_reference}`,
        pathname: "/admin/payments",
      });
    } catch {
      console.error("[payment-email] admin notification failed", { paymentId, template });
    }
  }
  return memberNotified;
}
