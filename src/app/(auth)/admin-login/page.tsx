import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageLoader } from "@/components/ui/PageLoader";
import { LoginForm } from "@/components/auth/LoginForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const FAKE_ADMIN_ACCESS = {
  email: "ops@mymentor.app",
  password: "ledger-arc-2026!",
} as const;

export const metadata: Metadata = {
  title: "Admin Sign In",
};

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = (user.app_metadata?.role as string | undefined) ?? profile?.role ?? null;

    if (role === "admin") {
      redirect("/admin");
    }

    redirect("/today");
  }

  return (
    <PageLoader imageSrc="/assets/images/login-bg.png">
      <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fbf9f5_0%,#f6f3ed_55%,#f0ebe1_100%)] text-text">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(199,168,109,0.14),transparent_28%),radial-gradient(circle_at_70%_18%,rgba(122,146,114,0.16),transparent_18%),radial-gradient(circle_at_20%_78%,rgba(255,255,255,0.8),transparent_24%)]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(50,69,59,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(50,69,59,0.14) 1px, transparent 1px)",
            backgroundSize: "96px 96px",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.16) 78%, transparent)",
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d8ceb8] bg-[#fcfbf7] shadow-[0_10px_24px_-18px_rgba(50,69,59,0.25)]">
              <ShieldCheck className="h-6 w-6 text-forest" />
            </div>
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-muted">
                Restricted area
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-lg font-semibold tracking-[-0.04em] text-forest">
                  My Mentor Admin
                </h1>
                <Badge variant="sage">Admin access</Badge>
              </div>
            </div>
          </div>

          <section className="rounded-[32px] border border-[#ded2be] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(251,249,245,0.98)_100%)] p-5 shadow-[0_32px_80px_-56px_rgba(50,69,59,0.28)] sm:p-7">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-muted">
              Secure sign in
            </p>
            <h2
              className="mt-3 text-4xl font-black tracking-[-0.06em] text-forest sm:text-5xl"
              style={{ fontFamily: "Gunterz, var(--font-serif)" }}
            >
              Admin sign in
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
              Use an approved administrator account to enter the control panel. This path is separate from the public member login.
            </p>

            <div className="mt-6 rounded-[22px] border border-[#e6dac5] bg-[#fffdf8] px-4 py-3">
              <p className="text-sm font-medium text-forest">Admin-only access</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Non-admin accounts are denied and sent back to the regular app.
              </p>
            </div>

            <div className="mt-4 rounded-[22px] border border-dashed border-[#d8ceb8] bg-[#fffdf8] px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-muted">
                Sample access
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted">Email</span>
                  <span className="font-mono text-forest">{FAKE_ADMIN_ACCESS.email}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted">Password</span>
                  <span className="font-mono text-forest">{FAKE_ADMIN_ACCESS.password}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-[#eadfcf] bg-[#fcfbf7] p-4 sm:p-5">
              <LoginForm mode="admin" />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#eadfcf] pt-5 text-sm text-muted">
              <span>Need the regular app?</span>
              <Link href="/login" className="inline-flex items-center gap-2 font-semibold text-forest hover:underline">
                Public sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </PageLoader>
  );
}
