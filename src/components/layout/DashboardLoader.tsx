"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function DashboardLoader({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">("loading");

  useEffect(() => {
    const leave = window.setTimeout(() => setPhase("leaving"), 700);
    const done = window.setTimeout(() => setPhase("done"), 1120);
    return () => { window.clearTimeout(leave); window.clearTimeout(done); };
  }, []);

  return <>
    <div className={`transition-opacity duration-[420ms] ${phase === "loading" ? "opacity-0" : "opacity-100"}`}>{children}</div>
    {phase !== "done" && <div aria-live="polite" aria-label="Loading your MyMentor dashboard" className={`fixed inset-0 z-[100] grid place-items-center bg-[#123426] transition-all duration-[420ms] ${phase === "leaving" ? "pointer-events-none opacity-0 scale-[1.015]" : "opacity-100"}`}>
      <div className="text-center text-[#fbf9f5]"><div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] border border-white/15 bg-white/10 shadow-[0_20px_60px_rgba(0,0,0,.3)]"><Sparkles size={30} className="text-[#e5c175]" /></div><p className="mt-6 font-serif text-3xl tracking-[-.03em]">MyMentor</p><p className="mt-2 text-sm text-white/65">Preparing your space</p><div className="mx-auto mt-7 h-1 w-40 overflow-hidden rounded-full bg-white/12"><div className="h-full w-1/2 animate-[dashboard-loader_1s_ease-in-out_infinite] rounded-full bg-[#e5c175]" /></div></div>
      <style jsx>{`@keyframes dashboard-loader { 0% { transform: translateX(-110%); } 100% { transform: translateX(220%); } }`}</style>
    </div>}
  </>;
}
