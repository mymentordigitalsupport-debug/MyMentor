"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  FileStack,
  LayoutDashboard,
  Newspaper,
  Layers3,
  LogOut,
  PlaySquare,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: Layers3 },
  { href: "/admin/chapters", label: "Chapters", icon: FileStack },
  { href: "/admin/lessons", label: "Lessons", icon: BookOpenText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/lesson-builder", label: "Lesson Builder", icon: Wand2 },
  { href: "/admin/media", label: "Media", icon: Video },
  { href: "/admin/quizzes", label: "Quizzes", icon: Sparkles },
  { href: "/admin/reflections", label: "Reflections", icon: ShieldCheck },
  { href: "/admin/resources", label: "Resources", icon: PlaySquare },
  { href: "/", label: "Back to home page", icon: LogOut, isExit: true },
];

export function AdminSidebar({ pendingArticles = 0, pendingAuthors = 0 }: { pendingArticles?: number; pendingAuthors?: number }) {
  const pathname = usePathname();
  const pendingTotal = pendingArticles + pendingAuthors;

  return (
    <aside className="hidden min-h-screen w-60 shrink-0 border-r border-mist/80 bg-cream shadow-[8px_0_30px_rgba(31,42,36,0.04)] lg:flex lg:flex-col">
      <div className="border-b border-mist/80 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest text-cream shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight text-slate-900">My Mentor</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Admin console</p>
          </div>
          <span className="ml-auto inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-forest px-2 text-xs font-bold text-cream" aria-label={`${pendingTotal} unread admin notification${pendingTotal === 1 ? "" : "s"}`}>{pendingTotal}</span>
        </div>
      </div>

      <div className="px-3 py-4">
        <div className="rounded-3xl border border-mist/80 bg-[linear-gradient(180deg,rgba(251,249,245,0.95),rgba(248,245,239,0.98))] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">Workspace</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Manage courses, chapters, lessons, and user activity from a clean control panel.
          </p>
        </div>
      </div>

      <nav className="sidebar-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 pb-4" aria-label="Admin navigation">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const badge = item.href === "/admin/articles" ? pendingArticles : item.href === "/admin/users" ? pendingAuthors : 0;
          const hasReviewBadge = item.href === "/admin/articles" || item.href === "/admin/users";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-150",
                active
                  ? "border border-sage/25 bg-sage/10 text-forest shadow-sm"
                  : item.isExit
                    ? "border border-sage/20 bg-sage/10 text-forest hover:bg-sage/15"
                    : "text-muted hover:bg-sand hover:text-text"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-forest" : "text-muted")} />
              <span>{item.label}</span>
              {hasReviewBadge ? <span className={cn("ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none", badge > 0 ? "bg-forest text-cream" : "bg-mist text-muted")} aria-label={`${badge} pending review${badge === 1 ? "" : "s"}`}>{badge}</span> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
