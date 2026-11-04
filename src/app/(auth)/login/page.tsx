import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { MemberAuthShell } from "@/components/auth/MemberAuthShell";
import "./login.css";

export const metadata: Metadata = { title: "Sign In" };

interface LoginPageProps { searchParams: Promise<{ next?: string }> }

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  if (next === "/admin" || next?.startsWith("/admin/")) {
    redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <MemberAuthShell>
      <LoginForm mode="user" nextPath={next} />
      <div className="login-divider"><span /> <p>New to MyMentor?</p> <span /></div>
      <Link href="/register" className="login-create-account">Create an account <ArrowRight size={23} aria-hidden="true" /></Link>
    </MemberAuthShell>
  );
}
