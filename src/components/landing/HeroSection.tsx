"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const pathways = [
  { title: "Recovery", href: "/about#books", image: "/assets/images/hero-pathway-recovery.jpg", position: "left-[8%] top-[18%]" },
  { title: "Healing", href: "/about#mission", image: "/assets/images/hero-pathway-healing.jpg", position: "right-[8%] top-[17%]" },
  { title: "Family", href: "/about#creator", image: "/assets/images/hero-pathway-family.jpg", position: "bottom-[17%] right-[29%]" },
  { title: "Growth", href: "/about#invitation", image: "/assets/images/hero-pathway-growth.jpg", position: "bottom-[17%] right-[8%]" },
] as const;

export function HeroSection() {
  return (
    <section id="hero" className="relative h-[calc(100vh+6rem)] min-h-screen overflow-hidden rounded-b-[11px] bg-[#090c0a] text-stone-100" aria-label="My Mentor landing hero">
      <video className="absolute inset-0 h-full w-full object-cover object-center" autoPlay muted loop playsInline preload="metadata" aria-label="My Mentor transformation video">
        <source src="/assets/videos/transf1.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-[#090c0a]/95 via-[#090c0a]/66 to-[#090c0a]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070907]/85 via-transparent to-[#090c0a]/40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_20%,transparent_0,rgba(9,12,10,0.28)_52%,rgba(7,9,7,0.7)_100%)]" />
      <svg className="pointer-events-none absolute bottom-0 z-[5] h-[48vh] w-full opacity-40" viewBox="0 0 1440 480" preserveAspectRatio="none"><defs><linearGradient id="topo" x1="0" x2="1440"><stop stopColor="#d97706" stopOpacity=".15"/><stop offset=".5" stopColor="#f59e0b" stopOpacity=".6"/><stop offset="1" stopColor="#d97706" stopOpacity=".2"/></linearGradient></defs><path d="M-50 480C150 430 320 460 520 400C720 340 950 440 1150 370C1320 310 1400 360 1500 350M-50 410C120 340 320 380 520 320C720 260 940 330 1100 280C1260 230 1360 270 1500 260M-50 310C180 230 340 260 540 210C740 160 980 220 1180 180C1340 140 1420 170 1500 160" fill="none" stroke="url(#topo)" strokeWidth="1.2"/><ellipse cx="720" cy="470" rx="330" ry="90" fill="none" stroke="url(#topo)"/></svg>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 pb-24 pt-28 sm:px-10 lg:items-start lg:px-16 lg:pt-[320px]">
        <div className="max-w-2xl">
          <div className="flex gap-5 sm:gap-7">
            <div className="flex w-5 shrink-0 flex-col items-center pt-2" aria-hidden="true">
              <span className="h-5 w-5 rounded-full border border-stone-300/70 p-1"><span className="block h-full w-full rounded-full bg-[#b8d088] shadow-[0_0_14px_#b8d088]" /></span>
              <span className="my-3 h-24 w-px bg-gradient-to-b from-stone-300/70 via-stone-400/30 to-stone-300/70" />
              <span className="font-mono text-xs text-stone-300/80">01</span>
            </div>
            <div>
              <h1 className="font-serif text-5xl font-light leading-[0.9] tracking-[-0.055em] text-stone-100 sm:text-6xl lg:text-[5rem]">We transform<span className="block italic text-[#95a681]">together.</span></h1>
              <p className="mt-6 max-w-lg text-sm font-light leading-7 text-stone-200/90 sm:text-base sm:leading-8">Guided recovery, healing, family restoration, and purposeful growth through structured courses, lessons, and daily action.</p>
              <Link href="/about#books" className="landing-user-profile landing-user-profile--hero group mt-8 tracking-[0.12em]"><span className="landing-user-profile-inner"><span className="h-2.5 w-2.5 rounded-full bg-[#b8d088] shadow-[0_0_14px_#b8d088]" /><span>START YOUR JOURNEY</span><ArrowRight className="transition-transform group-hover:translate-x-1" /></span></Link>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
        {pathways.map((pathway) => (
          <Link key={pathway.title} href={pathway.href} className={`pointer-events-auto group absolute h-[150px] w-[225px] overflow-hidden rounded-3xl border border-white/15 text-left shadow-2xl transition hover:-translate-y-1.5 hover:border-[#d8bf85]/60 ${pathway.position}`}>
            <Image src={pathway.image} alt="" fill sizes="225px" className="object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <span className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-[0.22em] text-stone-100">{pathway.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
