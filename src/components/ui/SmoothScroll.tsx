"use client";

import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let target = window.scrollY;
    let last = window.scrollY;

    const stop = () => { cancelAnimationFrame(frame); frame = 0; target = window.scrollY; last = target; };
    const tick = () => {
      const current = window.scrollY;
      if (Math.abs(current - last) > 2) target = current;
      const next = current + (target - current) * 0.12;
      window.scrollTo({ top: next, behavior: "instant" });
      last = window.scrollY;
      if (Math.abs(target - last) > 0.5) frame = requestAnimationFrame(tick);
      else { window.scrollTo({ top: target, behavior: "instant" }); frame = 0; last = window.scrollY; }
    };
    const wheel = (event: WheelEvent) => {
      if (motion.matches || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.defaultPrevented || getComputedStyle(document.body).overflowY === "hidden") return;
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      for (let el = event.target instanceof Element ? event.target : null; el && el !== document.body; el = el.parentElement) {
        const style = getComputedStyle(el);
        if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight) return;
      }
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      if (!delta) return;
      event.preventDefault();
      target = Math.max(0, Math.min(document.documentElement.scrollHeight - window.innerHeight, (frame ? target : window.scrollY) + delta));
      if (!frame) { last = window.scrollY; frame = requestAnimationFrame(tick); }
    };
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("pointerdown", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    motion.addEventListener("change", stop);
    return () => {
      stop();
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      motion.removeEventListener("change", stop);
    };
  }, []);
  return null;
}
