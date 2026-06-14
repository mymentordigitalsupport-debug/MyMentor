"use client";

import { cn } from "@/lib/utils";

interface IdentityAvatarProps {
  name: string;
  isAnonymous?: boolean;
  className?: string;
}

const SYMBOLS = ["◌", "✦", "◆", "✺", "∞", "◇", "●", "◈"];

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MM";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function IdentityAvatar({ name, isAnonymous = false, className }: IdentityAvatarProps) {
  const safeName = name.trim() || "My Mentor";
  const symbol = SYMBOLS[hashString(safeName) % SYMBOLS.length];

  return (
    <div
      aria-label={isAnonymous ? `Anonymous identity for ${safeName}` : `${safeName} initials`}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-sm",
        isAnonymous
          ? "border-white/15 bg-[#c7a86d]/20 text-[#fbf9f5]"
          : "border-white/10 bg-white/10 text-white",
        className
      )}
    >
      <span className={cn("font-semibold leading-none", isAnonymous ? "text-base" : "text-sm tracking-[0.12em]")}>
        {isAnonymous ? symbol : getInitials(safeName)}
      </span>
    </div>
  );
}
