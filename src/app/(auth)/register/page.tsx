import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { MemberAuthShell } from "@/components/auth/MemberAuthShell";
import "../login/login.css";
import "./member-register.css";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <MemberAuthShell mode="register">
      <Suspense fallback={<div className="signup-loading" role="status">Preparing your first step?</div>}>
        <RegisterForm />
      </Suspense>
    </MemberAuthShell>
  );
}
