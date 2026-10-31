import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { PageLoader } from "@/components/ui/PageLoader";
import { PenLine } from "lucide-react";
import "../register/register.css";

export const metadata: Metadata = { title: "Author Sign In" };

export default function AuthorsLoginPage() {
  return (
    <PageLoader imageSrc="/assets/images/s1r.jpg">
      <main className="register-page min-h-screen">
        <div className="register-card relative grid min-h-screen w-full overflow-hidden lg:grid-cols-2">
          <div className="relative flex flex-col px-6 pb-8 pt-7 sm:px-12 sm:pt-10 lg:px-14 xl:px-20">
            <Link href="/" className="register-brand w-fit rounded-full border border-[#777f79]/50 px-5 py-2 text-sm text-[#27342c]">Back Home</Link>
            <div className="mx-auto w-full max-w-[470px] flex-1 pb-10 pt-12 sm:pt-20">
              <div className="mb-8 text-center">
                <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-forest text-cream"><PenLine className="h-5 w-5" /></span>
                <h1 className="mt-4 text-3xl font-medium tracking-tight text-[#1f1710] sm:text-4xl">Author workspace</h1>
                <p className="mt-2 text-sm text-[#595c54]">Sign in with your approved author account.</p>
              </div>
              <LoginForm mode="author" />
              <p className="mt-6 text-center text-sm text-[#62665e]">Want to write for My Mentor? <Link href="/authors-register" className="font-medium text-[#1f1710] underline underline-offset-2">Apply to become an author</Link></p>
            </div>
          </div>
          <div className="register-image-wrap relative hidden min-h-[720px] p-4 lg:block"><div className="register-image sticky top-4 h-[calc(100vh-2rem)] min-h-[650px] rounded-[30px] bg-[linear-gradient(145deg,#17392a,#d7b473)]" /></div>
        </div>
      </main>
    </PageLoader>
  );
}
