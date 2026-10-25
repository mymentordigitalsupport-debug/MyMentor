"use client";

import { BookOpen, CircleHelp, FileCheck2, Files, Settings2, UserRoundPlus } from "lucide-react";
import type { QuickAction } from "./types";

const browserActions: QuickAction[] = [
  { id: "articles", label: "Find an Article", icon: BookOpen },
  { id: "account", label: "My Account", icon: Settings2 },
  { id: "question", label: "Ask a Question", icon: CircleHelp },
];

const authorActions: QuickAction[] = [
  { id: "submissions", label: "My Submissions", icon: Files },
  { id: "status", label: "Review Status", icon: FileCheck2 },
  { id: "author", label: "Register", icon: UserRoundPlus },
];

export function ChatQuickActions({ audience, onSelect }: { audience: "browser" | "author"; onSelect: (action: QuickAction) => void }) {
  const actions = audience === "author" ? authorActions : browserActions;
  return <div className="flex flex-wrap gap-2">{actions.map((action) => { const Icon = action.icon; return <button key={action.id} type="button" onClick={() => onSelect(action)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#ccd8c5] bg-white px-3 py-2 text-xs font-semibold text-[#35533e] shadow-[0_4px_12px_-10px_rgba(23,47,34,.5)] transition hover:-translate-y-0.5 hover:border-[#8faa82] hover:bg-[#f5f8f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8faa82] motion-reduce:transition-none"><Icon className="h-3.5 w-3.5" />{action.label}</button>; })}</div>;
}
