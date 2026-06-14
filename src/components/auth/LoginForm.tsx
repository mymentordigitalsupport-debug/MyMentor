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
import { HARDCODED_ADMIN_CREDENTIALS } from "@/lib/admin/auth";

type LoginMode = "user" | "admin";

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

    if (mode === "admin") {
      const normalizedEmail = email.trim().toLowerCase();

      if (
        normalizedEmail !== HARDCODED_ADMIN_CREDENTIALS.email ||
        password !== HARDCODED_ADMIN_CREDENTIALS.password
      ) {
        setError("Incorrect email or password. Please try again.");
        toast.error("Login Failed", "Incorrect email or password. Please try again.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      if (!response.ok) {
        setError("Unable to open admin access right now.");
        toast.error("Access denied", "Unable to open admin access right now.");
        setLoading(false);
        return;
      }

      toast.success("Admin access granted", "You've successfully signed in.");
      router.push("/admin");
      router.refresh();
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Incorrect email or password. Please try again.");
      toast.error("Login Failed", "Incorrect email or password. Please try again.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, role")
      .eq("id", user.id)
      .maybeSingle();

    const role =
      (user.app_metadata?.role as UserRole | undefined) ??
      (profile?.role as UserRole | undefined) ??
      "user";

    if (role === "admin") {
      toast.success("Admin access granted", "You've successfully signed in.");
      router.push("/admin");
    } else if (!profile?.onboarding_completed) {
      toast.success("Welcome Back!", "You've successfully signed in.");
      router.push("/onboarding");
    } else {
      toast.success("Welcome Back!", "You've successfully signed in.");
      router.push("/today");
    }

    router.refresh();
  }

  const isAdmin = mode === "admin";

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          required
          labelClassName={isAdmin ? "text-forest" : undefined}
          className={
            isAdmin
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
            labelClassName={isAdmin ? "text-forest" : undefined}
            className={
              isAdmin
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

        {error && (
          <p
            className={cn(
              "rounded-xl px-4 py-3 text-sm",
              isAdmin ? "border border-danger/20 bg-danger/10 text-danger" : "bg-danger/10 text-danger"
            )}
          >
            {error}
          </p>
        )}

        <div className="mt-2 flex justify-center">
          <Button
            type="submit"
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            className={isAdmin ? "shadow-[0_18px_36px_-24px_rgba(50,69,59,0.45)]" : undefined}
          >
            {loading ? "Checking access..." : isAdmin ? "Enter Admin" : "Log in"}
          </Button>
        </div>

        {mode === "user" && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-sage/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-6 text-sm font-medium tracking-wider text-muted">OR</span>
              </div>
            </div>

            <a
              href="/register?mode=anonymous"
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-sage/30 bg-sage/5 px-6 py-3 font-medium text-forest transition-all duration-300 hover:bg-sage/10"
            >
              Continue Anonymously
            </a>
          </>
        )}

        {isAdmin && (
          <p className="rounded-2xl border border-[#e3d7c4] bg-[#fffdf8] px-4 py-3 text-sm leading-6 text-muted">
            Admin access uses the hardcoded credentials shown above. If you need a regular user account, use
            the standard sign-in page.
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
