"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const EVENT_NAME = "mymentor:navigation-start";

export function startNavigationLoader() {
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const previousLocation = useRef<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setLoading(true);
    hideTimer.current = setTimeout(() => setLoading(false), 12_000);
  }

  useEffect(() => {
    const currentLocation = `${pathname}?${searchParams.toString()}`;
    if (previousLocation.current !== null && previousLocation.current !== currentLocation) {
      hideTimer.current = setTimeout(() => setLoading(false), 180);
    }
    previousLocation.current = currentLocation;
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") as HTMLAnchorElement | null : null;
      if (!target || target.target === "_blank" || target.hasAttribute("download")) return;
      const destination = new URL(target.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;
      start();
    };
    window.addEventListener(EVENT_NAME, start);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener(EVENT_NAME, start);
      document.removeEventListener("click", handleClick, true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!loading) return null;
  return <div className="fixed inset-0 z-[1000] grid place-items-center bg-[#f8f6f1]/96 backdrop-blur-sm" role="status" aria-live="polite" aria-label="Loading page"><div className="flex flex-col items-center"><img src="/assets/branding/logo.png" alt="My Mentor" className="h-20 w-20 animate-pulse object-contain" /><p className="mt-4 font-serif text-xl text-[#25412f]">My Mentor</p><div className="mt-4 flex gap-1.5" aria-hidden="true"><i className="h-2 w-2 animate-bounce rounded-full bg-[#789071] [animation-delay:-.2s]" /><i className="h-2 w-2 animate-bounce rounded-full bg-[#789071] [animation-delay:-.1s]" /><i className="h-2 w-2 animate-bounce rounded-full bg-[#789071]" /></div></div></div>;
}
