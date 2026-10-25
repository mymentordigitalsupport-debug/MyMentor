"use client";

export function ChatbotLauncher({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="group relative flex h-14 items-center gap-3 rounded-full bg-[#1f3527] px-4 text-sm font-semibold text-[#fff9ed] shadow-[0_18px_38px_-12px_rgba(22,43,29,.58)] transition duration-300 hover:-translate-y-1 hover:bg-[#314d39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8bd7e] focus-visible:ring-offset-2 motion-reduce:transition-none" aria-label="Open My Mentor Guide"><span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#f7f4ed] bg-[#8cab79] motion-safe:animate-pulse" /><span className="h-8 w-8 overflow-hidden rounded-full bg-[#25412f] transition-transform duration-300 group-hover:rotate-[-8deg] motion-reduce:transition-none"><img src="/assets/ai-avatar.png" alt="" className="h-full w-full object-contain" /></span><span className="hidden sm:inline">Ask My Mentor</span></button>;
}
