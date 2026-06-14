"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  MoreHorizontal,
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
  { label: "Today", href: "/today", icon: Clock3, badge: "16", description: "Daily focus and check-ins" },
  { label: "Course", href: "/course", icon: Compass, description: "Courses and guided paths" },
  { label: "Journal", href: "/journal", icon: NotebookPen, description: "Entries and reflections" },
  { label: "Progress", href: "/progress", icon: ChartColumn, description: "Momentum and completion" },
  { label: "Resources", href: "/resources", icon: BookMarked, description: "Tools and support" },
  { label: "Settings", href: "/settings", icon: Settings2, description: "Profile and preferences" },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

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
    <aside className="relative hidden shrink-0 lg:block w-[305px]">
      <main className="sticky top-0 flex h-screen w-[305px] flex-col overflow-y-auto border-r border-white/6 bg-[linear-gradient(180deg,#133225_0%,#102b1f_45%,#0f271c_100%)] shadow-[0_20px_44px_-28px_rgba(7,16,11,0.55)]">
        <header className="px-4 pt-4 pb-3 text-[#fbf9f5]">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <IdentityAvatar
                name={displayName}
                isAnonymous={profile?.is_anonymous ?? false}
                className="mt-0.5 h-10 w-10 bg-[#7a8b5c] text-[#fbf9f5] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
              />
              <div className="min-w-0 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[0.95rem] font-semibold tracking-[-0.02em] text-[#fbf9f5]">
                    {loadingProfile ? "Loading..." : displayName}
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/6 px-1.5 py-0.5 text-[0.65rem] font-semibold text-[#fbf9f5]/80">
                    Pro
                  </span>
                </div>
                <p className="mt-0.5 text-[0.76rem] text-white/72">{subtitle}</p>
              </div>
            </div>

          </div>
        </header>

        <section className="px-4 pb-3 pt-1.5">
          <div className="space-y-2.5">
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex min-h-[56px] items-center gap-3 rounded-[18px] px-3 py-2 transition",
                    isActive
                      ? "border-l-[3px] border-l-[#7a9272] bg-white/8 shadow-none"
                      : "hover:bg-white/[0.035]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
                      isActive ? "bg-white/8 text-[#fbf9f5]" : "bg-white/[0.06] text-white/78"
                    )}
                  >
                    <Icon className="h-[16px] w-[16px]" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "truncate text-[0.95rem] font-semibold tracking-[-0.01em]",
                          isActive ? "text-[#fbf9f5]" : "text-white/76"
                        )}
                      >
                        {item.label}
                      </span>
                      {item.badge ? (
                        <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[0.64rem] font-semibold text-[#fbf9f5]/76">
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className={cn("block truncate text-[0.78rem] leading-[1.25]", isActive ? "text-[#fbf9f5]/72" : "text-white/56")}>
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="mt-auto px-4 pb-3 pt-1.5">
          <div className="rounded-[22px] border border-white/10 bg-white/4 p-3.5 text-[#fbf9f5]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <IdentityAvatar
                  name={displayName}
                  isAnonymous={profile?.is_anonymous ?? false}
                  className="h-10 w-10 bg-[#5d6f50] text-[#fbf9f5]"
                />
                <div className="min-w-0">
                  <p className="truncate text-[0.9rem] font-semibold">{displayName}</p>
                  <p className="truncate text-[0.76rem] text-white/66">
                    {profile?.is_anonymous ? "Anonymous identity" : "Personal account"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/6 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="More options"
              >
                <MoreHorizontal className="h-[15px] w-[15px]" />
              </button>
            </div>

            <div className="mt-3.5 border-t border-white/8 pt-3">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-[0.9rem] font-semibold text-[#fbf9f5] transition hover:bg-white/12"
              >
                <LogOut className="h-[15px] w-[15px]" />
                Logout
              </button>
            </div>
          </div>
        </footer>
      </main>
    </aside>
  );
}

