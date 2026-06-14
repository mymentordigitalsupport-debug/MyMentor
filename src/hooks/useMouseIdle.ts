"use client";

import { useEffect, useState } from "react";

interface UseMouseIdleOptions {
  idleTime?: number; // milliseconds before fading out (default: 4000)
  fadeDuration?: number; // milliseconds for fade animation (default: 300)
}

export function useMouseIdle(options: UseMouseIdleOptions = {}) {
  const { idleTime = 4000, fadeDuration = 300 } = options;
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    let moveListener: (() => void) | null = null;

    const resetIdleTimer = () => {
      // Clear existing timer
      if (idleTimer) clearTimeout(idleTimer);

      // Set not idle
      setIsIdle(false);

      // Set new timer
      idleTimer = setTimeout(() => {
        setIsIdle(true);
      }, idleTime);
    };

    const handleMouseMove = () => {
      resetIdleTimer();
    };

    // Initial timer
    resetIdleTimer();

    // Add listener
    window.addEventListener("mousemove", handleMouseMove);
    moveListener = () => window.removeEventListener("mousemove", handleMouseMove);

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (moveListener) moveListener();
    };
  }, [idleTime]);

  return { isIdle, fadeDuration };
}
