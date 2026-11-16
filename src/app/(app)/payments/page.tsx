import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PaymentPageClient } from "@/components/payments/PaymentPageClient";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/payments");
  return <PaymentPageClient />;
}
