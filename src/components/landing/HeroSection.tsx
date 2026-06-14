"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const sectionIds = ["hero"] as const;
const sectionRail = [
  { id: "introduction", label: "Introduction" },
  { id: "overview", label: "Etc" },
  { id: "journey", label: "Etc" },
  { id: "support", label: "Etc" },
  { id: "start", label: "Etc" },
] as const;

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const hasStartedVideoRef = useRef(false);
  const [activeSection, setActiveSection] = useState<(typeof sectionIds)[number]>("hero");

  const sections = useMemo(
    () =>
      sectionIds.map((id) => ({
        id,
        label: id === "hero" ? "Hero" : id.replace(/-/g, " "),
      })),
    []
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startVideo = async () => {
      if (hasStartedVideoRef.current) return;
      hasStartedVideoRef.current = true;

      if (pauseTimerRef.current !== null) {
        window.clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }

      try {
        video.currentTime = 0;
        await video.play();
        pauseTimerRef.current = window.setTimeout(() => {
          video.pause();
        }, 1500);
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
      if (pauseTimerRef.current !== null) {
        window.clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
      hasStartedVideoRef.current = false;
      video.pause();
    };
  }, []);

  useEffect(() => {
    const targets = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id as (typeof sectionIds)[number]);
        }
      },
      {
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: "-15% 0px -55% 0px",
      }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden bg-[#090b09] text-cream"
      aria-label="My Mentor landing hero"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
        preload="metadata"
        aria-label="Background video"
      >
        <source src="/assets/videos/background-video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-5 sm:px-8 lg:px-10">
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

          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/20 text-cream transition hover:border-white/25 hover:bg-black/35"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" strokeWidth={1.6} />
          </button>
        </header>

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

              if (pauseTimerRef.current !== null) {
                window.clearTimeout(pauseTimerRef.current);
                pauseTimerRef.current = null;
              }

              try {
                video.pause();
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

        <nav
          className="absolute right-4 top-1/2 -translate-y-1/2 sm:right-6"
          aria-label="Section progress"
        >
          <div className="flex flex-col items-end gap-3 sm:gap-4">
            {sectionRail.map((section, index) => {
              const isActive = index === 0 || activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  className="group flex items-center gap-3 rounded-full px-2 py-1 text-right transition hover:bg-white/5"
                  aria-label={`Go to ${section.label}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => scrollToSection("hero")}
                >
                  <span
                    className={`text-[0.65rem] font-medium uppercase tracking-[0.34em] transition sm:text-[0.7rem] ${
                      isActive ? "text-sage" : "text-white"
                    }`}
                  >
                    {section.label}
                  </span>
                  <span
                    className={`block rounded-full transition-all duration-200 ${
                      isActive
                        ? "h-3 w-3 bg-sage shadow-[0_0_0_5px_rgba(122,146,114,0.18)] sm:h-3.5 sm:w-3.5"
                        : "h-1.5 w-1.5 bg-white/68 sm:h-2 sm:w-2"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </section>
  );
}
