"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn, Play, ShieldCheck, UserRoundPlus } from "lucide-react";
import { useEffect, useRef } from "react";
import { NavBar } from "@/components/landing/NavBar";

const navItems = [
  { name: "Sign up", url: "/register", icon: UserRoundPlus },
  { name: "Member login", url: "/login", icon: LogIn },
  { name: "Admin login", url: "/admin-login", icon: ShieldCheck },
] as const;

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStartedVideoRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startVideo = async () => {
      if (hasStartedVideoRef.current) return;
      hasStartedVideoRef.current = true;

      try {
        await video.play();
      } catch {
        video.pause();
      }
    };

    if (video.readyState >= 2) {
      void startVideo();
    } else {
      video.addEventListener("canplay", startVideo, { once: true });
    }

    return () => {
      hasStartedVideoRef.current = false;
      video.pause();
    };
  }, []);

  return (
    <section id="hero" className="bg-cream px-4 pt-4 sm:px-6 lg:px-8" aria-label="My Mentor landing hero">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#1a1c18] bg-[#090b09] text-cream shadow-[0_28px_95px_-60px_rgba(0,0,0,0.8)]">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          loop
          preload="metadata"
          aria-label="Background video"
        >
          <source src="/assets/videos/transf1.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

        <div className="relative z-10 flex min-h-[calc(100vh-2rem)] flex-col px-6 py-5 sm:px-8 lg:px-10">
          <header className="flex items-start justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/assets/images/favicon.png"
                alt="My Mentor favicon"
                width={42}
                height={42}
                className="h-10 w-10 object-contain"
                priority
              />
              <span className="text-[0.82rem] font-medium uppercase tracking-[0.52em] text-cream/94 sm:text-sm">
                My Mentor
              </span>
            </Link>
          </header>

          <NavBar items={navItems} />

          <div className="flex flex-1 items-center" aria-hidden="true" />

          <div className="absolute left-6 top-1/2 z-10 -translate-y-1/2 sm:left-8 lg:left-10">
            <div className="flex items-center gap-4">
              <span className="h-28 w-px bg-sage/90 sm:h-32" aria-hidden="true" />
              <p
                className="max-w-[18rem] text-[3.25rem] font-medium uppercase leading-[0.94] tracking-[0.06em] text-white sm:max-w-[20rem] sm:text-[3.45rem]"
                style={{ fontFamily: '"Gunterz", sans-serif' }}
              >
                <span className="block whitespace-nowrap">WE TRANSFORM</span>
                <span className="mt-1 block whitespace-nowrap text-sage sm:mt-2">TOGETHER</span>
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <button
              type="button"
              className="pointer-events-auto group inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/78 bg-black/20 text-cream shadow-[0_18px_60px_-28px_rgba(0,0,0,0.9)] transition duration-300 hover:border-sage hover:bg-black/35 sm:h-24 sm:w-24"
              aria-label="Play video"
              onClick={async () => {
                const video = videoRef.current;
                if (!video) return;

                try {
                  video.currentTime = 0;
                  await video.play();
                } catch {
                  video.pause();
                }
              }}
            >
              <Play className="ml-1 h-8 w-8 fill-current text-cream transition duration-300 group-hover:text-sage sm:h-9 sm:w-9" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
