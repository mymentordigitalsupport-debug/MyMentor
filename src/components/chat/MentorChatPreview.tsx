"use client";

import { useEffect, useRef, useState } from "react";
import { ChatbotHeader } from "./ChatbotHeader";
import { ChatbotLauncher } from "./ChatbotLauncher";
import { ChatMessage } from "./ChatMessage";
import { ChatMessageInput } from "./ChatMessageInput";
import { ChatQuickActions } from "./ChatQuickActions";
import { ChatTypingIndicator } from "./ChatTypingIndicator";
import type { ChatMessageData, QuickAction } from "./types";

type Audience = "browser" | "author";

const now = () => new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date());
const actionReplies: Record<QuickAction["id"], Omit<ChatMessageData, "id" | "time">> = {
  articles: { role: "guide", text: "Search published articles by title, then narrow the results by topic.", articleFinder: true },
  author: { role: "guide", text: "You can apply to share your experience and encouragement with the community.", card: { eyebrow: "Contribute", title: "Become an Author", description: "Submit an author application for editorial review.", actionLabel: "Become an author", href: "/authors-register" } },
  account: { role: "guide", text: "Sign in securely to view your account information and preferences.", card: { eyebrow: "Account", title: "Sign in to My Account", description: "Use the protected My Mentor sign-in page to access your account.", actionLabel: "Sign in", href: "/login" } },
  status: { role: "guide", text: "Here is where approved authors can view article submissions and their review status.", card: { eyebrow: "Author workspace", title: "Track Article Status", description: "View drafts, submitted articles and editorial feedback.", actionLabel: "View my articles", href: "/author" } },
  question: { role: "guide", text: "Ask what is on your mind. This preview will show how the guide will respond once conversational support is connected.", card: { eyebrow: "Coming next", title: "Ask a Question", description: "Questions stay in this browser during the UI preview. Nothing is sent or stored.", actionLabel: "Question preview" } },
  submissions: { role: "guide", text: "Your author workspace keeps your drafts and submitted articles together.", card: { eyebrow: "Author workspace", title: "My Submissions", description: "View all of your drafts and article submissions.", actionLabel: "View submissions", href: "/author" } },
};

export function MentorChatPreview() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [typing, setTyping] = useState(false);
  const [rolePromptOpen, setRolePromptOpen] = useState(true);
  const [audience, setAudience] = useState<Audience>("browser");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (replyTimer.current) clearTimeout(replyTimer.current); }, []);
  useEffect(() => { if (open) transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" }); }, [messages, typing, open]);
  useEffect(() => {
    function keydown(event: KeyboardEvent) { if (event.key === "Escape" && open) setOpen(false); }
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [open]);

  function addGuideReply(reply: Omit<ChatMessageData, "id" | "time">) {
    replyTimer.current = setTimeout(() => {
      setMessages((current) => [...current, { ...reply, id: crypto.randomUUID(), time: now() }]);
    }, 600);
  }

  function selectAction(action: QuickAction) {
    const message = { id: crypto.randomUUID(), role: "member" as const, text: action.label, time: now() };
    setMessages((current) => [...current, message]);
    if (action.id === "account") {
      void requestMentor([...messages, { ...message, text: "Help me review my My Mentor account details." }]);
      return;
    }
    addGuideReply(actionReplies[action.id]);
  }

  function chooseAudience(nextAudience: Audience) {
    setAudience(nextAudience);
    setRolePromptOpen(false);
  }

  async function requestMentor(conversation: ChatMessageData[]) {
    setTyping(true);
    try {
      const response = await fetch("/api/mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation.slice(-8).map((message) => ({ role: message.role === "guide" ? "assistant" : "user", content: message.text })) }),
      });
      const data = await response.json().catch(() => null) as { reply?: string; error?: string } | null;
      const reply = data?.reply;
      if (!response.ok || !reply) throw new Error(data?.error ?? "Unable to reach My Mentor Guide.");
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "guide", text: reply, time: now(), animate: true }]);
    } catch (error) {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "guide", text: error instanceof Error ? error.message : "My Mentor Guide is temporarily unavailable.", time: now(), animate: true }]);
    } finally {
      setTyping(false);
    }
  }

  function sendMessage() {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    const message = { id: crypto.randomUUID(), role: "member" as const, text, time: now() };
    setMessages((current) => [...current, message]);
    void requestMentor([...messages, message]);
  }

  return <div className="fixed bottom-6 right-6 z-[100] sm:bottom-7 sm:right-7">
    {open ? <section className="fixed inset-6 flex h-[calc(100dvh-3rem)] w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-[28px] border border-[#d5dfcf] bg-[#fffdf9] shadow-[0_28px_80px_-24px_rgba(16,35,23,.48)] motion-safe:animate-[chat-enter_.25s_ease-out] sm:inset-auto sm:bottom-10 sm:right-10 sm:h-[min(650px,calc(100dvh-5rem))] sm:w-[440px]" role="dialog" aria-modal="true" aria-label="My Mentor Guide"><ChatbotHeader onMinimize={() => setOpen(false)} onClose={() => setOpen(false)} /><div ref={transcriptRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_15%_0%,rgba(228,237,220,.72),transparent_33%),#f8f6f1] px-4 py-5 sm:px-5"><div className="space-y-4">{messages.length === 0 ? <Welcome audience={audience} onSelect={selectAction} /> : messages.map((message) => <ChatMessage key={message.id} message={message} />)}{typing ? <ChatTypingIndicator /> : null}</div></div><ChatMessageInput value={input} onChange={setInput} onSubmit={sendMessage} /></section> : <ChatbotLauncher onClick={() => setOpen(true)} />}
    {open && rolePromptOpen ? <RolePrompt onSelect={chooseAudience} /> : null}
  </div>;
}

function Welcome({ audience, onSelect }: { audience: Audience; onSelect: (action: QuickAction) => void }) {
  return <div className="pt-2"><div className="mx-auto h-14 w-14 overflow-hidden rounded-full bg-[#25412f] shadow-[0_14px_28px_-16px_rgba(20,48,30,.65)]"><img src="/assets/ai-avatar.png" alt="My Mentor Guide" className="h-full w-full object-contain" /></div><p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-[.2em] text-[#7d9277]">My Mentor Guide</p><h2 className="mt-2 text-center font-serif text-[28px] leading-8 text-[#23392b]">Hello, welcome to My Mentor.</h2><p className="mx-auto mt-3 max-w-[310px] text-center text-sm leading-6 text-[#637167]">I am here to help you find your way forward. What would you like help with today?</p><div className="mt-6"><ChatQuickActions audience={audience} onSelect={onSelect} /></div><p className="mt-6 border-t border-[#e1e5dc] pt-4 text-center text-[11px] leading-5 text-[#8a9188]">Preview interface only. No messages are sent or stored.</p></div>;
}

function RolePrompt({ onSelect }: { onSelect: (audience: Audience) => void }) {
  return <section className="fixed inset-x-6 bottom-6 top-[calc(1.5rem+73px)] z-[101] flex flex-col justify-center rounded-b-[28px] border-x border-b border-[#d5dfcf] bg-[#fffdf9]/95 p-6 shadow-[0_24px_60px_-20px_rgba(16,35,23,.55)] backdrop-blur-sm sm:inset-x-auto sm:bottom-10 sm:right-10 sm:top-auto sm:h-[calc(min(650px,calc(100dvh-5rem))-73px)] sm:w-[440px]" role="dialog" aria-modal="true" aria-labelledby="chat-role-title"><div className="mx-auto mb-4 h-11 w-11 overflow-hidden rounded-full bg-[#25412f]"><img src="/assets/ai-avatar.png" alt="" className="h-full w-full object-contain" /></div><p className="text-center text-[10px] font-semibold uppercase tracking-[.18em] text-[#779070]">Welcome to My Mentor</p><h2 id="chat-role-title" className="mt-2 text-center font-serif text-2xl text-[#23392b]">How will you use My Mentor?</h2><p className="mx-auto mt-2 max-w-[280px] text-center text-sm leading-6 text-[#68766b]">Choose your path to tailor the guide.</p><div className="mt-6 grid gap-3"><button type="button" onClick={() => onSelect("browser")} className="rounded-2xl border border-[#cfdcca] bg-white px-4 py-4 text-left transition hover:border-[#729269] hover:bg-[#f5f9f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fac83]"><span className="block text-sm font-semibold text-[#284331]">I am a Browser</span><span className="mt-1 block text-xs leading-5 text-[#68766b]">Read articles and explore support.</span></button><button type="button" onClick={() => onSelect("author")} className="rounded-2xl border border-[#cfdcca] bg-white px-4 py-4 text-left transition hover:border-[#729269] hover:bg-[#f5f9f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fac83]"><span className="block text-sm font-semibold text-[#284331]">I am an Author</span><span className="mt-1 block text-xs leading-5 text-[#68766b]">Write, submit and track articles.</span></button></div></section>;
}
