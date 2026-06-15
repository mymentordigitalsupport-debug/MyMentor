"use client";

import { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: readonly NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? "");

  return (
    <nav
      aria-label="Primary"
      className={cn("fixed right-4 top-4 z-50", className)}
    >
      <div className="flex items-center gap-1 rounded-full border border-white/14 bg-[#0c0d0b]/78 px-1 py-1 shadow-[0_18px_55px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                "text-cream/78 hover:text-cream",
                isActive
                  ? "bg-sage text-cream shadow-[0_12px_30px_-16px_rgba(122,146,114,0.85)]"
                  : "bg-transparent"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.4} />
              </span>

              {isActive && (
                <motion.div
                  layoutId="nav-lamp"
                  className="absolute inset-0 -z-10 rounded-full bg-sage/15"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-gold">
                    <div className="absolute -top-1 left-1/2 h-6 w-12 -translate-x-1/2 rounded-full bg-gold/20 blur-md" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
