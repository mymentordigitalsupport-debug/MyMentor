"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";
import {
  Compass,
  Clock3,
  ChartColumn,
  BookMarked,
  NotebookPen,
  Settings2,
  LogOut,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  Heart,
  MessagesSquare,
} from "lucide-react";
import type { ComponentType } from "react";
import { IdentityAvatar } from "@/components/ui/IdentityAvatar";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
};

type ProfilePreview = {
  display_name: string | null;
  username: string | null;
  anonymous_name: string | null;
  is_anonymous: boolean;
};

const PRIMARY_NAV: NavItem[] = [
  { label: "Today", href: "/today", icon: Clock3, description: "Daily focus and check-ins" },
  { label: "Course", href: "/course", icon: Compass, description: "Courses and guided paths" },
  { label: "Journal", href: "/journal", icon: NotebookPen, description: "Entries and reflections" },
  { label: "Progress", href: "/progress", icon: ChartColumn, description: "Momentum and completion" },
  { label: "Threads", href: "/threads", icon: MessagesSquare, description: "Share and support each other" },
  { label: "Resources", href: "/resources", icon: BookMarked, description: "Tools and support" },
  { label: "Settings", href: "/settings", icon: Settings2, description: "Profile and preferences" },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const isLessonRoute = /^\/(?:course|journey)\/[^/]+\/[^/]+\/[^/]+$/.test(pathname);

  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [profile, setProfile] = useState<ProfilePreview | null>(null);
  const [authName, setAuthName] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: userData } = await supabase.auth.getUser();

        if (!userData.user || !isMounted) {
          setLoadingProfile(false);
          return;
        }

        const metadataName =
          (userData.user.user_metadata?.full_name as string | undefined) ??
          (userData.user.user_metadata?.name as string | undefined) ??
          userData.user.email?.split("@")[0] ??
          null;

        if (isMounted) {
          setAuthName(
            metadataName
              ? metadataName.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (char) => char.toUpperCase())
              : null
          );
        }

        const { data } = await supabase
          .from("profiles")
          .select("display_name, username, anonymous_name, is_anonymous")
          .eq("id", userData.user.id)
          .single();

        if (isMounted) {
          setProfile((data as ProfilePreview | null) ?? null);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const sidebar = sidebarRef.current;
    const menuButton = menuButtonRef.current;
    const desktopViewport = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktopViewport.matches) setMenuOpen(false); };
    desktopViewport.addEventListener("change", closeOnDesktop);
    const focusable = () => Array.from(sidebar?.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)") ?? []);
    focusable()[0]?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      desktopViewport.removeEventListener("change", closeOnDesktop);
      menuButton?.focus();
    };
  }, [menuOpen]);

  const displayName = useMemo(() => {
    const fallback = authName ?? "Your name";
    if (!profile) return fallback;
    return profile.is_anonymous
      ? profile.anonymous_name ?? "Anonymous Member"
      : profile.display_name ?? profile.username ?? profile.anonymous_name ?? fallback;
  }, [profile, authName]);

  const subtitle = profile?.is_anonymous ? "Private mode enabled" : "You are not alone.";

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Logout failed", "Please try again.");
    }
  };

  return (
    <>
      <div className="member-mobile-header">
        <Link href="/today" className="member-brand"><span className="member-brand-mark"><Sparkles size={19} /></span><span>MyMentor<span className="member-brand-period">.</span></span></Link>
        <button ref={menuButtonRef} type="button" className="member-icon-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="member-navigation"><Menu size={22} /></button>
      </div>
      {menuOpen && <button className="member-menu-backdrop" type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation" tabIndex={-1} />}
      <aside ref={sidebarRef} id="member-navigation" role={menuOpen ? "dialog" : undefined} aria-modal={menuOpen || undefined} aria-label="Member navigation" className={cn("member-sidebar", isLessonRoute && "member-sidebar-compact", menuOpen && "member-sidebar-open")}>
        <div className="member-sidebar-inner">
          <div className="member-sidebar-brand-row">
            <Link href="/today" className="member-brand" onClick={() => setMenuOpen(false)} title="MyMentor home">
              <span className="member-brand-mark"><Sparkles size={21} /></span><span className="member-sidebar-label">MyMentor<span className="member-brand-period">.</span></span>
            </Link>
            <button className="member-menu-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={20} /></button>
          </div>
          <div className="member-sidebar-profile">
            <IdentityAvatar name={displayName} isAnonymous={profile?.is_anonymous ?? false} className="member-avatar" />
            <div className="member-sidebar-label"><p>{loadingProfile ? "Your space" : displayName}</p><span><i /> {profile?.is_anonymous ? "Private mode" : "Member workspace"}</span></div>
          </div>
          <p className="member-nav-eyebrow member-sidebar-label">YOUR EVERYDAY</p>
          <nav className="member-nav" aria-label="Main navigation">
            {PRIMARY_NAV.filter((item) => item.href !== "/settings").map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={cn("member-nav-link", isActive && "member-nav-active")} aria-current={isActive ? "page" : undefined} title={item.label}>
                  <Icon className="member-nav-icon" /><span className="member-sidebar-label">{item.label}</span>{isActive && <span className="member-nav-dot member-sidebar-label" />}
                </Link>
              );
            })}
          </nav>
          <div className="member-sidebar-encouragement member-sidebar-label">
            <span className="member-encouragement-icon"><Heart size={18} /></span>
            <p>Good things take<br /><em>one small step.</em></p>
            <span>A little intention goes a long way.</span>
            <Link href="/journal/new" onClick={() => setMenuOpen(false)}>Make time for yourself <ArrowUpRight size={15} /></Link>
          </div>
          <div className="member-sidebar-footer">
            <Link href="/settings" onClick={() => setMenuOpen(false)} className={cn("member-nav-link", pathname === "/settings" && "member-nav-active")} aria-current={pathname === "/settings" ? "page" : undefined} title="Settings"><Settings2 className="member-nav-icon" /><span className="member-sidebar-label">Settings</span></Link>
            <button type="button" onClick={handleLogout} className="member-nav-link member-logout" title="Sign out"><LogOut className="member-nav-icon" /><span className="member-sidebar-label">Sign out</span></button>
            <div className="member-sidebar-signature member-sidebar-label"><span /> {subtitle}</div>
          </div>
        </div>
      </aside>
    </>
  );
}


