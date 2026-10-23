"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useToast } from "@/components/ui/ToastProvider";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

type LoginMode = "user" | "admin" | "author";

interface LoginFormProps {
  mode?: LoginMode;
}

export function LoginForm({ mode = "user" }: LoginFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Incorrect email or password. Please try again.");
        toast.error("Login Failed", "Incorrect email or password. Please try again.");
        setLoading(false);
        return;
      }

      const accessToken = signInData.session?.access_token;
      if (!accessToken) throw new Error("Unable to verify your account access.");
      const accessResponse = await fetch("/api/auth/portal-access", { headers: { Authorization: `Bearer ${accessToken}` } });
      const access = (await accessResponse.json().catch(() => null)) as { role?: UserRole; onboardingCompleted?: boolean; error?: string } | null;
      if (!accessResponse.ok) throw new Error(access?.error ?? "Unable to verify your account access.");
      const role = access?.role ?? "user";
      const onboardingCompleted = access?.onboardingCompleted ?? false;

      if (mode === "admin" && role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("This account does not have administrator access.");
      }

      if (mode === "author" && role !== "author") {
        await supabase.auth.signOut();
        if (role === "author_pending") throw new Error("Your author application is still pending review.");
        if (role === "author_rejected") throw new Error("Your author application was not approved. Please contact the team for more information.");
        throw new Error("This account is not approved as an author.");
      }

      if (role === "admin") {
        toast.success("Admin access granted", "You've successfully signed in.");
        router.push("/admin");
      } else if (role === "author") {
        toast.success("Welcome back", "Your author workspace is ready.");
        router.push("/author");
      } else if (!onboardingCompleted) {
        toast.success("Welcome Back!", "You've successfully signed in.");
        router.push("/onboarding");
      } else {
        toast.success("Welcome Back!", "You've successfully signed in.");
        router.push("/today");
      }

      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error &&
        caughtError.message.includes("Supabase client is not configured")
          ? "Supabase env vars are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the dev server."
          : caughtError instanceof Error
            ? caughtError.message
            : "Unable to sign in right now.";

      setError(message);
      toast.error("Login unavailable", message);
    } finally {
      setLoading(false);
    }
  }

  const isRestricted = mode !== "user";
  const portalName = mode === "admin" ? "Admin" : "Author";

  return (
    <>
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", !isRestricted && "register-form")} noValidate>
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          required
          labelClassName={isRestricted ? "text-forest" : undefined}
          className={
            isRestricted
              ? "rounded-2xl border-[#ded2be] bg-[#fffdf8] text-text placeholder:text-muted shadow-[0_1px_0_rgba(255,255,255,0.7)] focus:border-sage focus:ring-sage/20"
              : undefined
          }
        />

        <div>
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            required
            labelClassName={isRestricted ? "text-forest" : undefined}
            className={
              isRestricted
                ? "rounded-2xl border-[#ded2be] bg-[#fffdf8] text-text placeholder:text-muted shadow-[0_1px_0_rgba(255,255,255,0.7)] focus:border-sage focus:ring-sage/20"
                : undefined
            }
          />

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className={cn("text-sm font-medium hover:underline", "text-forest")}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {isRestricted && error && (
          <p
            className={cn(
              "rounded-xl px-4 py-3 text-sm",
              isRestricted ? "border border-danger/20 bg-danger/10 text-danger" : "bg-danger/10 text-danger"
            )}
          >
            {error}
          </p>
        )}

        <div className={cn("mt-2", isRestricted ? "flex justify-center" : "grid grid-cols-2 gap-3")}>
          <Button
            type="submit"
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            className={isRestricted ? "shadow-[0_18px_36px_-24px_rgba(50,69,59,0.45)]" : "rounded-full bg-[#e8c573] px-3 py-3.5 text-sm font-semibold text-[#1f1710] shadow-none hover:bg-[#dcb45d]"}
          >
            {loading ? "Checking access..." : isRestricted ? `Enter ${portalName}` : "Log in"}
          </Button>
          {mode === "user" && (
            <a
              href="/register?mode=anonymous"
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-sage/30 bg-sage/5 px-3 py-2.5 text-center text-sm font-medium text-forest transition-all duration-300 hover:bg-sage/10"
            >
              Continue Anonymously
            </a>
          )}
        </div>

        {isRestricted && (
          <p className="rounded-2xl border border-[#e3d7c4] bg-[#fffdf8] px-4 py-3 text-sm leading-6 text-muted">
            This portal only opens for approved {mode === "admin" ? "administrators" : "authors"}.
          </p>
        )}
      </form>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
}
