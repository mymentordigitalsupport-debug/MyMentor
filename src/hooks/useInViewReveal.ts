"use client";

import * as React from "react";

type RevealState = {
  ref: React.RefObject<HTMLElement | null>;
  isVisible: boolean;
};

export function useInViewReveal<T extends HTMLElement = HTMLElement>(once = true): RevealState & { ref: React.RefObject<T | null> } {
  const ref = React.useRef<T | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return { ref, isVisible };
}
