"use client";

export function ChatbotLauncher({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="group flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8bd7e] focus-visible:ring-offset-2" aria-label="Chat here"><span className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#25412f] shadow-[0_14px_30px_-10px_rgba(22,43,29,.65)] transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[-8deg] motion-reduce:transition-none"><img src="/assets/ai-avatar.png" alt="" className="h-full w-full object-contain" /></span><span className="rounded-full bg-[#1f3527] px-4 py-2.5 text-sm font-semibold text-[#fff9ed] shadow-[0_14px_30px_-12px_rgba(22,43,29,.58)] transition group-hover:bg-[#314d39]">Chat here</span></button>;
}
