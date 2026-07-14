import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import Image from "next/image";
import { PageLoader } from "@/components/ui/PageLoader";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
};

const registerImageSrc = "/assets/images/s1L.jpg";

export default function RegisterPage() {
  return (
    <PageLoader imageSrc={registerImageSrc}>
      <div className="min-h-screen bg-white lg:grid lg:grid-cols-[3fr_2fr]">
        <div className="relative hidden min-h-screen overflow-hidden bg-[#f8f1e5] lg:block">
          <Image
            src={registerImageSrc}
            alt="We transform together"
            fill
            className="object-cover object-center"
            priority
            quality={100}
          />
        </div>

        <div className="relative flex min-h-screen w-full items-start justify-center overflow-y-auto bg-white px-6 py-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-6 flex justify-center">
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
            <div className="mb-6 text-center lg:hidden">
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
            <div className="rounded-3xl p-6 lg:p-8">
              <div className="mb-5 text-center">
                <p className="mb-1 text-sm text-muted">Welcome to My Mentor</p>
                <h2 className="text-2xl font-bold text-text sm:text-3xl">Create Account</h2>
              </div>

              {/* Suspense required because RegisterForm uses useSearchParams() */}
              <Suspense fallback={
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <RegisterForm />
              </Suspense>

              <div className="mt-5 text-center text-sm text-muted">
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
