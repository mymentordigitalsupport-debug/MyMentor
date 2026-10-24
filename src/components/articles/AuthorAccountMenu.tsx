"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

export function AuthorAccountMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const initials = email.split("@")[0].slice(0, 2).toUpperCase();
  async function signOut() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sign out failed");
      router.replace("/authors-login");
      router.refresh();
    } catch { setBusy(false); }
  }
  return <div className="relative">
    <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label="Author account" className="site-profile-button ml-1 flex min-h-11 items-center gap-2 rounded-full border border-[#cfc5b4] bg-white/65 px-2.5 text-left transition hover:border-[#a8936e] sm:px-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#e9e2d2] text-[10px] font-bold text-[#385041]">{initials}</span><span className="hidden max-w-36 truncate text-xs font-medium text-white lg:block">{email}</span><ChevronDown className="h-3.5 w-3.5 text-white" /></button>
    {open && <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-64 rounded-2xl border border-[#d6cbb8] bg-[#fffdf8] p-3 shadow-[0_22px_50px_-30px_#203529]"><div className="flex items-center gap-2 border-b border-[#e4ddd0] px-2 pb-3"><UserRound className="h-4 w-4 text-[#8a7858]" /><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#8a7858]">Author account</p><p className="truncate text-xs text-[#304539]">{email}</p></div></div><button type="button" disabled={busy} onClick={() => void signOut()} className="site-profile-button mt-2 flex min-h-10 w-full items-center gap-2 rounded-xl px-2 text-left text-xs font-semibold transition disabled:opacity-50"><LogOut className="h-4 w-4" />{busy ? "Signing out…" : "Sign out"}</button></div>}
  </div>;
}
