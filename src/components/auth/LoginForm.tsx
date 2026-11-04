"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
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
  nextPath?: string;
}

function safeNextPath(value?: string) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

export function LoginForm({ mode = "user", nextPath }: LoginFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (mode !== "user") return;
    try {
      const rememberedEmail = localStorage.getItem("mymentor.login-email");
      if (rememberedEmail) setEmail(rememberedEmail);
    } catch {
      // Sign-in also works when browser storage is unavailable.
    }
  }, [mode]);

  function updateRememberMe(checked: boolean) {
    setRememberMe(checked);
    if (!checked) {
      try { localStorage.removeItem("mymentor.login-email"); } catch { /* Storage may be unavailable. */ }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "admin") {
        const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
        if (!response.ok) throw new Error("Incorrect email or password. Please try again.");
        toast.success("Admin access granted", "You've successfully signed in.");
        router.replace("/admin");
        router.refresh();
        return;
      }
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

      if (mode === "author" && role !== "author") {
        await supabase.auth.signOut();
        if (role === "author_pending") throw new Error("Your author application is still pending review.");
        if (role === "author_rejected") throw new Error("Your author application was not approved. Please contact the team for more information.");
        throw new Error("This account is not approved as an author.");
      }

      const destination = safeNextPath(nextPath);

      if (mode === "user") {
        try {
          if (rememberMe) localStorage.setItem("mymentor.login-email", email);
          else localStorage.removeItem("mymentor.login-email");
        } catch {
          // Remembering an email must never prevent sign-in.
        }
      }

      if (role === "admin") {
        toast.success("Admin access granted", "You've successfully signed in.");
        router.replace(destination?.startsWith("/admin") ? destination : "/admin");
      } else if (role === "author") {
        toast.success("Welcome back", "Your author workspace is ready.");
        router.replace(destination?.startsWith("/author") ? destination : "/author");
      } else if (!onboardingCompleted) {
        toast.success("Welcome Back!", "You've successfully signed in.");
        router.push("/onboarding");
      } else {
        toast.success("Welcome Back!", "You've successfully signed in.");
        router.replace(destination ?? "/today");
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

  if (!isRestricted) {
    return (
      <>
        <form onSubmit={handleSubmit} className="member-login-form" aria-label="Member sign in" aria-busy={loading}>
          <div className="login-field">
            <Mail aria-hidden="true" strokeWidth={1.8} />
            <label htmlFor="member-login-email" className="sr-only">E-mail</label>
            <input
              id="member-login-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="E-mail"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "member-login-error" : undefined}
            />
          </div>
          <div className="login-field">
            <LockKeyhole aria-hidden="true" strokeWidth={1.8} />
            <label htmlFor="member-login-password" className="sr-only">Password</label>
            <PasswordInput
              id="member-login-password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "member-login-error" : undefined}
            />
          </div>
          <div className="login-options">
            <label className="login-remember" title="Remember your email on this device">
              <input name="rememberEmail" type="checkbox" checked={rememberMe} onChange={(event) => updateRememberMe(event.target.checked)} />
              <span>Remember me</span>
            </label>
            <button type="button" className="login-forgot" onClick={() => setShowForgotPassword(true)}>Forgot password?</button>
          </div>
          {error && <p id="member-login-error" className="login-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="login-submit">
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <ForgotPasswordModal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
      </>
    );
  }

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
