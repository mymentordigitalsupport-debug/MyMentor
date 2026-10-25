import type { LucideIcon } from "lucide-react";

export type ChatCard = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  href?: string;
};

export type ChatMessageData = {
  id: string;
  role: "member" | "guide";
  text: string;
  time: string;
  card?: ChatCard;
  preview?: boolean;
  articleFinder?: boolean;
  animate?: boolean;
};

export type QuickAction = {
  id: "articles" | "author" | "account" | "status" | "question" | "submissions";
  label: string;
  icon: LucideIcon;
};
