import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_OVERRIDE_COOKIE } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_OVERRIDE_COOKIE)?.value === "1") {
    return (
      <div className="flex min-h-screen bg-[linear-gradient(180deg,#fbf9f5_0%,#f6f3ed_100%)]">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1480px] px-5 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = (user.app_metadata?.role as string | undefined) ?? profile?.role ?? null;

  if (role !== "admin") {
    redirect("/today");
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,#fbf9f5_0%,#f6f3ed_100%)]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1480px] px-5 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
