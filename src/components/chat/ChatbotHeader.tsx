"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

export function ChatbotHeader({ onClose }: { onClose: () => void }) {
  const [grain, setGrain] = useState("");

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 160;
    const context = canvas.getContext("2d");
    if (!context) return;
    const pixels = context.createImageData(160, 160);
    let seed = 42;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let index = 0; index < pixels.data.length; index += 4) {
      const shade = random() < 0.5 ? 0 : 255;
      pixels.data[index] = pixels.data[index + 1] = pixels.data[index + 2] = shade;
      pixels.data[index + 3] = Math.floor(random() * 12);
    }
    context.putImageData(pixels, 0, 0);
    setGrain(canvas.toDataURL());
  }, []);

  return <header style={grain ? { backgroundImage: `url(${grain})` } : undefined} className="relative flex shrink-0 items-center justify-between overflow-hidden border-b border-white/10 bg-[#174936] px-5 py-4 text-[#fff9ed]">
    <div className="relative flex min-w-0 items-center gap-3"><span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#25412f] ring-1 ring-white/20"><img src="/assets/ai-avatar.png" alt="My Mentor Guide" className="h-full w-full object-contain" /><span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#174936] bg-[#92b57f]" /></span><div className="min-w-0"><p className="truncate font-serif text-lg leading-5">My Mentor Guide</p><p className="mt-1 truncate text-[11px] text-[#edf2e9]/75">Here to help you find your way forward.</p></div></div>
    <button type="button" onClick={onClose} className="relative grid h-8 w-8 place-items-center rounded-full text-[#fff9ed]/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8bd7e]" aria-label="Close guide" title="Close"><X className="h-4 w-4" /></button>
  </header>;
}
