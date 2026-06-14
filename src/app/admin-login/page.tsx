import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf9f5_0%,#f4efe7_100%)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-[32px] border border-[#e8decf] bg-white/95 p-8 shadow-[0_26px_60px_-34px_rgba(31,42,36,0.18)] backdrop-blur">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-forest">My Mentor</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text">Admin Login</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Sign in with an account that has the admin role.
            </p>
          </div>

          <LoginForm mode="admin" />

          <div className="mt-6 text-center text-sm text-muted">
            Need the regular app instead?{" "}
            <Link href="/login" className="font-semibold text-forest hover:underline">
              Go to user login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
