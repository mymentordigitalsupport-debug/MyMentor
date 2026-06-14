"use client";

import * as React from "react";
import Link from "next/link";
import { Grid2x2PlusIcon, MenuIcon } from "lucide-react";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function FloatingHeader() {
  const [open, setOpen] = React.useState(false);

  const links = [
    {
      label: "Features",
      href: "#features",
    },
    {
      label: "Pricing",
      href: "#pricing",
    },
    {
      label: "About",
      href: "#about",
    },
  ];

  return (
    <header
      className={cn(
        "mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-[1.1rem] border border-white/20 bg-cream/30 px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.12)] backdrop-blur-md",
        "sm:px-5"
      )}
    >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-foreground transition hover:bg-mist/70"
        >
          <Grid2x2PlusIcon className="size-5 shrink-0" />
          <p className="text-sm font-semibold sm:text-base">My Mentor</p>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-10 text-sm font-medium text-foreground/92 md:flex"
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition hover:text-foreground/64"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="rounded-xl bg-[#1f1d1c] px-4 text-cream hover:bg-[#161413]"
            onClick={() => setOpen(false)}
          >
            Login
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setOpen(!open)}
              className="rounded-xl md:hidden"
              aria-label="Open menu"
            >
              <MenuIcon className="size-4" />
            </Button>
            <SheetContent
              className="gap-0 bg-background"
              showClose={false}
              side="left"
            >
              <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
                {links.map((link) => (
                  <a
                    key={link.label}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-mist"
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Sign In
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </header>
  );
}
