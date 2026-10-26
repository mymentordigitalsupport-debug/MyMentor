"use client";

import { FormEvent, KeyboardEvent, useRef } from "react";
import { ArrowUp } from "lucide-react";

type ChatMessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function ChatMessageInput({ value, onChange, onSubmit, disabled = false }: ChatMessageInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  function submit(event: FormEvent) { event.preventDefault(); if (!disabled) onSubmit(); }
  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled) onSubmit();
    }
  }

  return <form onSubmit={submit} className="shrink-0 border-t border-[#e4ded3] bg-[#fffdf9] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"><div className="flex items-end gap-2 rounded-[22px] border border-[#d7dfd0] bg-white px-3 py-2 shadow-[0_6px_15px_-14px_rgba(23,47,34,.4)] focus-within:border-[#8ca881] focus-within:ring-2 focus-within:ring-[#dce8d5]"><textarea ref={inputRef} value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={keyDown} rows={1} placeholder="Ask My Mentor anything..." className="max-h-24 min-h-6 flex-1 resize-none bg-transparent px-1 py-1.5 text-sm leading-5 text-[#233629] outline-none placeholder:text-[#92988f]" aria-label="Message My Mentor Guide" /><button type="submit" disabled={disabled || !value.trim()} aria-label={disabled ? "My Mentor Guide is thinking" : "Send message"} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2d5139] text-white transition hover:bg-[#416b4a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6b978] disabled:cursor-not-allowed disabled:opacity-35"><ArrowUp className="h-4 w-4" /></button></div><p className="px-2 pt-2 text-[10px] text-[#8b9187]">Enter to send · Shift + Enter for a new line</p></form>;
}
