import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import Image from "next/image";
import { PageLoader } from "@/components/ui/PageLoader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <PageLoader imageSrc="/assets/images/register-bg.png">
      <div className="min-h-screen flex relative">
        {/* Full Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/register-bg.png"
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
                <h2 className="text-3xl font-bold text-text">Create Account</h2>
              </div>

              {/* Suspense required because RegisterForm uses useSearchParams() */}
              <Suspense fallback={
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <RegisterForm />
              </Suspense>

              <div className="mt-6 text-center text-sm text-muted">
                Already have an account?{" "}
                <Link href="/login" className="text-forest hover:underline font-semibold">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLoader>
  );
}
