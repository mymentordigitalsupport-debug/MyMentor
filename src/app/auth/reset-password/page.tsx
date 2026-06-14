"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setValidSession(false);
      } else {
        setValidSession(true);
      }
    };

    checkSession();
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again.");
      console.error("Password update error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (validSession === null) {
    return <PageLoader imageSrc="/assets/images/login-bg.png"><div /></PageLoader>;
  }

  // Show error if session is invalid
  if (validSession === false) {
    return (
      <PageLoader imageSrc="/assets/images/login-bg.png">
        <div className="min-h-screen flex relative">
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/images/login-bg.png"
              alt="Background"
              fill
              className="object-cover"
              priority
              quality={100}
            />
          </div>

          <div className="relative z-10 w-full flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-cream rounded-3xl shadow-lg p-8 lg:p-10">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-danger/20 rounded-full">
                  <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-text">Invalid or Expired Link</h2>
                <p className="text-sm text-muted">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  fullWidth
                  className="mt-4"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageLoader>
    );
  }

  return (
    <PageLoader imageSrc="/assets/images/login-bg.png">
      <div className="min-h-screen flex relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/login-bg.png"
            alt="Background"
            fill
            className="object-cover"
            priority
            quality={100}
          />
        </div>

        <div className="relative z-10 w-full flex items-center justify-end p-6 lg:p-12">
          <div className="w-full max-w-md lg:mr-48 xl:mr-56">
            <div className="lg:hidden text-center mb-8">
              <Image
                src="/assets/branding/logo.png"
                alt="My Mentor Logo"
                width={80}
                height={80}
                className="w-20 h-20 object-contain mx-auto mb-4"
                priority
              />
              <h1 className="text-2xl font-bold text-forest">My Mentor</h1>
            </div>

            <div className="rounded-3xl p-8 lg:p-10">
              {!success ? (
                <>
                  <div className="text-center mb-8">
                    <p className="text-sm text-muted mb-2">Reset Your Password</p>
                    <h2 className="text-3xl font-bold text-text">New Password</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <PasswordInput
                      label="New password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError(null);
                      }}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      showStrengthMeter={true}
                      required
                      autoFocus
                    />

                    <PasswordInput
                      label="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError(null);
                      }}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      required
                    />

                    {error && (
                      <p className="text-sm text-danger bg-danger/10 rounded-xl px-4 py-3">
                        {error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      loading={loading}
                      disabled={loading || !newPassword || !confirmPassword}
                      className="mt-2"
                    >
                      Update Password
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-sage/20 rounded-full">
                    <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-text">Password Updated!</h3>
                    <p className="text-sm text-muted">
                      Your password has been successfully updated. Redirecting to login...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLoader>
  );
}
