"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CommunityTexture } from "@/components/threads/ThreadPaper";

/** Enhance the rendered board without hiding content before JavaScript loads. */
export function MemberBoardMotion({ children }: { children: ReactNode }) {
  const board = useRef<HTMLDivElement>(null);
  const textureId = `member-board-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const element = board.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    let observer: IntersectionObserver | undefined;

    const settle = () => {
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      element.removeAttribute("data-motion");
    };

    if (!preference.matches && typeof IntersectionObserver !== "undefined") {
      element.dataset.motion = "ready";
      observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        visible.forEach((entry, index) => {
          const target = entry.target as HTMLElement;
          target.dataset.revealed = "true";
          if (typeof target.animate === "function") {
            const animation = target.animate([
              { opacity: 0, translate: "0 22px" },
              { opacity: 1, translate: "0 0" },
            ], { duration: 650, delay: Math.min(index * 85, 255), easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
            animations.add(animation);
            animation.onfinish = () => animations.delete(animation);
          }
          observer?.unobserve(target);
        });
      }, { threshold: .08, rootMargin: "0px 0px -20px 0px" });
      element.querySelectorAll(".member-page-header, .member-stat, .member-panel, .member-resource-banner").forEach((target) => observer?.observe(target));
    }

    const onPreferenceChange = () => { if (preference.matches) settle(); };
    preference.addEventListener("change", onPreferenceChange);
    return () => { settle(); preference.removeEventListener("change", onPreferenceChange); };
  }, []);

  const textureStyle = { "--community-grain": `url(#${textureId}-grain)`, "--community-fibres": `url(#${textureId}-fibres)` } as CSSProperties;
  return <div ref={board} className="member-dashboard" style={textureStyle}><CommunityTexture id={textureId} />{children}</div>;
}

export function AnimatedMetric({ value }: { value: number }) {
  const metric = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const element = metric.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    if (preference.matches || !value || typeof IntersectionObserver === "undefined") { setDisplay(value); return; }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer?.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = Math.min(1, (now - start) / 1000);
        setDisplay(Math.round(value * (1 - Math.pow(1 - elapsed, 3))));
        if (elapsed < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: .5 });
    const settle = () => { cancelAnimationFrame(frame); setDisplay(value); observer.disconnect(); };
    observer.observe(element);
    preference.addEventListener("change", settle);
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); preference.removeEventListener("change", settle); };
  }, [value]);

  return <span ref={metric} className="member-animated-metric"><span aria-hidden="true">{display}</span><span className="member-sr-only">{value}</span></span>;
}
