"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";

const exploreLinks = [
  { title: "Our mission", description: "Why we walk together.", href: "/about#mission" },
  { title: "Meet Craig", description: "The person behind My Mentor.", href: "/about#creator" },
  { title: "Explore the books", description: "Find a place to start.", href: "/about#books" },
];

// Adapted from SolaceUI's Navbar Section 2 on 21st.dev.
export function PublicNavigation({ overDark = false, adaptToAboutSections = false }: { overDark?: boolean; adaptToAboutSections?: boolean }) {
  const [stickyPhase, setStickyPhase] = useState<"normal" | "enter" | "exit">("normal");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExplore, setMobileExplore] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [lightMenu, setLightMenu] = useState(false);

  useEffect(() => {
    if (!adaptToAboutSections) return;
    const update = () => {
      const probeY = 26;
      setLightMenu(["mission", "invitation"].some((id) => {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        return rect != null && rect.top <= probeY && rect.bottom > probeY;
      }));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [adaptToAboutSections]);

  useEffect(() => {
    let isSticky = false;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    function onScroll() {
      const shouldStick = window.scrollY > 120;
      if (shouldStick === isSticky) return;
      isSticky = shouldStick;
      clearTimeout(exitTimer);
      if (shouldStick) {
        setStickyPhase("enter");
      } else if (adaptToAboutSections) {
        setStickyPhase("normal");
      } else if (reducedMotion) {
        setStickyPhase("normal");
      } else {
        setStickyPhase("exit");
        exitTimer = setTimeout(() => setStickyPhase("normal"), 200);
      }
      setOpen(false);
      setMobileOpen(false);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(exitTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reducedMotion, adaptToAboutSections]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setMobileOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const close = () => { setOpen(false); setMobileOpen(false); setMobileExplore(false); };

  return (
    <header ref={headerRef} className={`inset-x-0 z-[90] px-6 sm:px-10 lg:px-14 ${lightMenu ? "about-nav-light" : ""} ${adaptToAboutSections ? "fixed top-0 text-[#1f2a24]" : stickyPhase === "normal" ? `absolute ${overDark ? "top-4 text-white" : "top-0 text-[#1f2a24]"}` : `fixed top-0 ${overDark ? "text-white" : "text-[#1f2a24]"} public-nav-${stickyPhase}`}`}>
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3">
        <motion.div
          animate={{ opacity: stickyPhase === "normal" ? 1 : 0, y: stickyPhase === "normal" ? 0 : -16 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          className={stickyPhase === "normal" ? "shrink-0" : "pointer-events-none shrink-0"}
          aria-hidden={stickyPhase !== "normal"}
        >
          <Link href="/" onClick={close} tabIndex={stickyPhase === "normal" ? undefined : -1} className="flex items-center gap-2 font-semibold tracking-tight" aria-label="My Mentor home">
            <Image src="/assets/images/favicon.png" alt="" width={38} height={38} className="size-9 object-contain" />
            <span className="text-sm sm:text-base">My Mentor</span>
          </Link>
        </motion.div>

        <div className="public-nav-desktop absolute left-1/2 top-0 hidden w-[540px] -translate-x-1/2 lg:block" style={{ filter: "drop-shadow(0 12px 20px rgba(0,0,0,.16))" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" className="pointer-events-none absolute -left-[18px] top-0 text-[#1F1710]" aria-hidden="true"><path d="M20 20V0H0C11.046 0 20 11.046 20 20Z" fill="currentColor" /></svg>
          <svg width="20" height="20" viewBox="0 0 20 20" className="pointer-events-none absolute -right-[18px] top-0 text-[#1F1710]" aria-hidden="true"><path d="M0 0H20C8.954 0 0 8.954 0 20Z" fill="currentColor" /></svg>
          <motion.div animate={{ height: open ? 224 : 52 }} transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }} className="public-nav-panel overflow-hidden rounded-b-2xl bg-[#1F1710] text-white">
            <nav aria-label="Main navigation" className="flex h-[52px] items-center justify-center gap-7 text-sm font-medium text-white/70">
              <Link href="/" onClick={close} className="transition hover:text-white">Home</Link>
              <Link href="/about" onClick={close} className="transition hover:text-white">About us</Link>
              <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="explore-panel" className={`flex items-center gap-1 rounded-md px-3 py-2 transition hover:text-white ${open ? "bg-white/10 text-white" : ""}`}>
                Explore <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            </nav>
            <AnimatePresence initial={false}>
              {open && <motion.div id="explore-panel" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: reducedMotion ? 0 : 0.18 }} className="grid grid-cols-3 gap-3 border-t border-white/10 p-4">
                {exploreLinks.map((item) => <Link key={item.title} href={item.href} onClick={close} className="group flex min-h-[132px] flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.07]">
                  <span><span className="block text-sm font-medium text-white">{item.title}</span><span className="mt-2 block text-xs leading-5 text-white/55">{item.description}</span></span>
                  <span className="text-xs text-[#d8be85]">Explore <ArrowRight className="ml-1 inline size-3 transition-transform group-hover:translate-x-1" /></span>
                </Link>)}
              </motion.div>}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login" onClick={close} className="flex items-center rounded-lg border border-[#32453b] bg-[#faf0e3] px-3.5 py-2 text-xs font-semibold !text-[#32453b] transition hover:bg-white">Login</Link>
          <Link href="/register" onClick={close} className="group flex items-center gap-1 rounded-lg bg-[#32453b] px-3.5 py-2 text-xs font-semibold !text-white transition hover:bg-[#24392f]">Sign up <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" /></Link>
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileOpen} aria-controls="mobile-navigation" className="public-nav-toggle grid size-10 place-items-center rounded-lg border border-current/30 lg:hidden">{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {mobileOpen && <motion.nav id="mobile-navigation" aria-label="Mobile navigation" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reducedMotion ? 0 : 0.2 }} className="absolute left-4 right-4 top-16 overflow-hidden rounded-xl bg-[#1F1710] text-white shadow-xl sm:left-6 sm:right-6 lg:hidden">
          <div className="grid gap-1 p-4 text-sm">
            <Link href="/" onClick={close} className="rounded-lg px-3 py-3 hover:bg-white/10">Home</Link>
            <Link href="/about" onClick={close} className="rounded-lg px-3 py-3 hover:bg-white/10">About us</Link>
            <button type="button" aria-expanded={mobileExplore} aria-controls="mobile-explore-panel" onClick={() => setMobileExplore(!mobileExplore)} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-white/10">Explore <ChevronDown className={`size-4 transition-transform ${mobileExplore ? "rotate-180" : ""}`} /></button>
            {mobileExplore && <div id="mobile-explore-panel" className="ml-3 grid gap-1 border-l border-white/15 pl-3">{exploreLinks.map((item) => <Link key={item.title} href={item.href} onClick={close} className="rounded-lg px-3 py-2 hover:bg-white/10"><span className="block">{item.title}</span><span className="mt-1 block text-xs text-white/55">{item.description}</span></Link>)}</div>}
          </div>
        </motion.nav>}
      </AnimatePresence>
    </header>
  );
}
