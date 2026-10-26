"use client";

import { X } from "lucide-react";

export function ChatbotHeader({ onClose }: { onClose: () => void }) {
  return <header className="flex shrink-0 items-center justify-between border-b border-[#31503c] bg-[#1c3024] px-5 py-4 text-[#fff9ed]"><div className="flex min-w-0 items-center gap-3"><span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#25412f] ring-1 ring-white/20"><img src="/assets/ai-avatar.png" alt="My Mentor Guide" className="h-full w-full object-contain" /><span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1c3024] bg-[#92b57f]" /></span><div className="min-w-0"><p className="truncate font-serif text-lg leading-5">My Mentor Guide</p><p className="mt-1 truncate text-[11px] text-[#dce6d7]/72">Here to help you find your way forward.</p></div></div><button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-[#fff9ed]/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8bd7e]" aria-label="Close guide" title="Close"><X className="h-4 w-4" /></button></header>;
}
