import { AdminSidebar } from "@/components/layout/AdminSidebar";
import type { Metadata } from "next";
import { getAdminReviewCounts } from "@/lib/admin/overview";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("user_id", user.id)
    .single();

  const disabled = ["paused", "blocked", "suspended", "disabled", "anonymized"].includes(profile?.status ?? "");
  const role = disabled ? null : profile?.role ?? (user.app_metadata?.role as string | undefined) ?? null;

  if (role !== "admin") {
    redirect("/today");
  }

  const reviewCounts = await getAdminReviewCounts();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf9f5_0%,#f6f3ed_100%)] lg:flex">
      <AdminSidebar {...reviewCounts} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1480px] px-5 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
