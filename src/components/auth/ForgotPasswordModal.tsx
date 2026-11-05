"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Password">
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <p className="text-sm text-muted">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="your@email.com"
            autoComplete="email"
            error={error || undefined}
            required
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading || !email}
          >
            Send Reset Link
          </Button>

          <button
            type="button"
            onClick={handleClose}
            className="w-full text-sm text-muted hover:text-text transition-colors"
          >
            Back to login
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-sage/20 rounded-full">
            <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-text">Check your email</h3>
            <p className="text-sm text-muted">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-xs text-muted pt-2">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
          </div>

          <Button
            onClick={handleClose}
            fullWidth
            variant="outline"
          >
            Back to login
          </Button>
        </div>
      )}
    </Modal>
  );
}
