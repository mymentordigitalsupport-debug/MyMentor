"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

export function AuthorAccountMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const initials = email.split("@")[0].slice(0, 2).toUpperCase();
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) setOpen(false); };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, [open]);
  async function signOut() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sign out failed");
      router.replace("/authors-login");
      router.refresh();
    } catch { setBusy(false); }
  }
  return <div ref={menuRef} className="relative">
    <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-haspopup="menu" aria-label="Author account" className="site-profile-button flex min-h-11 items-center gap-2 rounded-full border border-[#cfc5b4] bg-white/65 px-2.5 text-left transition hover:border-[#a8936e] sm:ml-1 sm:px-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#e9e2d2] text-[10px] font-bold text-[#385041]">{initials}</span><span className="hidden max-w-36 truncate text-xs font-medium text-[#304539] lg:block">{email}</span><ChevronDown className="h-3.5 w-3.5 text-[#304539]" /></button>
    {open && <div role="menu" className="absolute right-0 top-[calc(100%+10px)] z-30 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#d6cbb8] bg-[#fffdf8] p-3 shadow-[0_22px_50px_-30px_#203529]"><div className="flex items-center gap-2 border-b border-[#e4ddd0] px-2 pb-3"><UserRound className="h-4 w-4 text-[#8a7858]" /><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#8a7858]">Author account</p><p className="truncate text-xs text-[#304539]">{email}</p></div></div><Link role="menuitem" href="/author" onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-xl px-2 text-xs font-semibold text-[#304539] hover:bg-[#f3eee5]">My articles</Link><Link role="menuitem" href="/author/articles/new" onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-xl px-2 text-xs font-semibold text-[#304539] hover:bg-[#f3eee5]">New article</Link><button role="menuitem" type="button" disabled={busy} onClick={() => void signOut()} className="site-profile-button mt-1 flex min-h-11 w-full items-center gap-2 rounded-xl px-2 text-left text-xs font-semibold transition disabled:opacity-50"><LogOut className="h-4 w-4" />{busy ? "Signing out…" : "Sign out"}</button></div>}
  </div>;
}
