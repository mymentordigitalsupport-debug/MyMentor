import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { PageLoader } from "@/components/ui/PageLoader";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import "../register/register.css";

export const metadata: Metadata = { title: "Sign In" };

interface LoginPageProps { searchParams: Promise<{ next?: string }> }

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  if (next === "/admin" || next?.startsWith("/admin/")) {
    redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <PageLoader imageSrc="/assets/images/s1r.jpg">
      <main className="register-page min-h-screen">
        <div className="register-card relative grid min-h-screen w-full overflow-hidden lg:grid-cols-2">
          <div className="relative flex flex-col px-6 pb-8 pt-7 sm:px-12 sm:pt-10 lg:px-14 xl:px-20">
            <Link href="/" className="register-brand w-fit rounded-full border border-[#777f79]/50 px-5 py-2 text-sm text-[#27342c]">Back Home</Link>
            <div className="mx-auto w-full max-w-[440px] flex-1 pb-10 pt-12 sm:pt-20">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-medium tracking-tight text-[#1f1710] sm:text-4xl">Welcome back</h1>
                <p className="mt-2 text-sm text-[#595c54]">Sign in to continue your journey.</p>
              </div>
              <LoginForm mode="user" />
              <p className="mt-6 text-center text-sm text-[#62665e]">New here? <Link href="/register" className="font-medium text-[#1f1710] underline underline-offset-2">Sign up</Link></p>
            </div>
          </div>
          <div className="register-image-wrap relative hidden min-h-[720px] p-4 lg:block">
            <div className="register-image sticky top-4 h-[calc(100vh-2rem)] min-h-[650px] overflow-hidden rounded-[30px]">
              <Image src="/assets/images/s1r.jpg" alt="My Mentor" fill className="object-cover object-center" sizes="50vw" priority quality={100} />
              <span aria-hidden="true" className="register-notch-corner" />
            </div>
          </div>
          <Link href="/" aria-label="Close and return home" className="register-close absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full bg-[#fffaf0] text-[#1f1710] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#32453b]"><X size={19} strokeWidth={1.5} /></Link>
        </div>
      </main>
    </PageLoader>
  );
}
