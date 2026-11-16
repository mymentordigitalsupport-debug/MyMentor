import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export const PAYMENT_PRODUCTS = ["chapter_1", "full_course", "full_course_upgrade"] as const;
export type PaymentProductCode = (typeof PAYMENT_PRODUCTS)[number];

export function isPaymentProduct(value: unknown): value is PaymentProductCode {
  return typeof value === "string" && PAYMENT_PRODUCTS.includes(value as PaymentProductCode);
}

export function formatZar(amountCents: number) {
  return `R${(amountCents / 100).toFixed(2)}`;
}

export async function hasCourseEntitlement(
  supabase: SupabaseClient,
  userId: string,
  courseVersionId: string,
  chapterId?: string | null,
) {
  const { data, error } = await supabase
    .from("course_entitlements")
    .select("id, access_level, chapter_id")
    .eq("user_id", userId)
    .eq("course_version_id", courseVersionId)
    .eq("active", true);
  if (error) return { allowed: false, error };
  const allowed = (data ?? []).some((entitlement: { access_level: string; chapter_id: string | null }) =>
    entitlement.access_level === "full_course" || (chapterId && entitlement.chapter_id === chapterId),
  );
  return { allowed, error: null };
}

export async function getPaymentAdmin() {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase is not configured.");
  return admin;
}
