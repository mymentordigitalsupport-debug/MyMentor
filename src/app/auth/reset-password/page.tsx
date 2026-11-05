"use client";

import { Suspense, useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MemberAuthShell } from "@/components/auth/MemberAuthShell";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PageLoader } from "@/components/ui/PageLoader";
import "../../(auth)/login/login.css";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to update password. Please try again.";
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setValidSession(false);
          return;
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      setValidSession(Boolean(session));
    };

    void checkSession();
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Password needs uppercase, lowercase, and a number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setSuccess(true);
      window.setTimeout(() => router.push("/login"), 2000);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }

  if (validSession === null) {
    return <PageLoader imageSrc="/assets/images/s1r.jpg"><div /></PageLoader>;
  }

  if (validSession === false) {
    return (
      <MemberAuthShell title="Reset password" description="This password reset link is invalid or has expired.">
        <div className="reset-password-message">
          <p className="login-error">Request a new password reset email, then use its latest link.</p>
          <button type="button" className="login-submit" onClick={() => router.push("/login")}>Back to sign in</button>
        </div>
      </MemberAuthShell>
    );
  }

  return (
    <MemberAuthShell title="Reset password" description="Choose a new password for your MyMentor account.">
      {success ? (
        <div className="reset-password-message" role="status">
          <p>Your password has been updated.</p>
          <p>Taking you to sign in…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="member-login-form" noValidate aria-busy={loading}>
          <div className="login-field">
            <LockKeyhole aria-hidden="true" strokeWidth={1.8} />
            <label htmlFor="new-password" className="sr-only">New password</label>
            <PasswordInput
              id="new-password"
              name="newPassword"
              value={newPassword}
              onChange={(event) => { setNewPassword(event.target.value); setError(null); }}
              placeholder="New password"
              autoComplete="new-password"
              showStrengthMeter
              required
              autoFocus
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "reset-password-error" : undefined}
            />
          </div>
          <div className="login-field">
            <LockKeyhole aria-hidden="true" strokeWidth={1.8} />
            <label htmlFor="confirm-new-password" className="sr-only">Confirm new password</label>
            <PasswordInput
              id="confirm-new-password"
              name="confirmNewPassword"
              value={confirmPassword}
              onChange={(event) => { setConfirmPassword(event.target.value); setError(null); }}
              placeholder="Confirm new password"
              autoComplete="new-password"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "reset-password-error" : undefined}
            />
          </div>
          {error && <p id="reset-password-error" className="login-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading || !newPassword || !confirmPassword} className="login-submit">
            {loading ? "Updating password…" : "Update password"}
          </button>
        </form>
      )}
    </MemberAuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoader imageSrc="/assets/images/s1r.jpg"><div /></PageLoader>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
