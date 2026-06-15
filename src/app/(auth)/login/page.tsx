import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import Image from "next/image";
import { PageLoader } from "@/components/ui/PageLoader";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sign In",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

function isAdminDestination(next: string | undefined) {
  if (!next) return false;
  return next === "/admin" || next.startsWith("/admin/");
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  if (isAdminDestination(next)) {
    const target = next ? `/admin/login?next=${encodeURIComponent(next)}` : "/admin/login";
    redirect(target);
  }

  return (
    <PageLoader imageSrc="/assets/images/login-bg.png">
      <div className="min-h-screen flex relative">
        {/* Full Background Image */}
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

        {/* Content Overlay */}
        <div className="relative z-10 w-full flex items-center justify-end p-6 lg:p-12">
          <div className="w-full max-w-md lg:mr-48 xl:mr-56">
            <div className="mb-6 flex justify-center lg:justify-start">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-[#c7d6c1] bg-[#fffdf8] text-forest shadow-none hover:border-forest hover:bg-white hover:text-forest"
              >
                <Link href="/">Home</Link>
              </Button>
            </div>

            {/* Mobile Logo */}
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

            {/* Card - No Background */}
            <div className="rounded-3xl p-8 lg:p-10">
              <div className="text-center mb-8">
                <p className="text-sm text-muted mb-2">Welcome to My Mentor</p>
                <h2 className="text-3xl font-bold text-text">Log in</h2>
              </div>

              <LoginForm mode="user" />

              <div className="mt-6 text-center text-sm text-muted">
                New here?{" "}
                <Link href="/register" className="text-forest hover:underline font-semibold">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLoader>
  );
}

