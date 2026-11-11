"use client";

import { useEffect, useState } from "react";
import { Check, Send, X } from "lucide-react";

type GuestIdentityDialogProps = {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
};

export function GuestIdentityDialog({ open, onClose, onVerified }: GuestIdentityDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setCode("");
    setCodeSent(false);
    setMessage("");
  }, [open]);

  if (!open) return null;

  async function sendCode() {
    if (!name.trim() || !email.trim()) { setMessage("Enter your name and email."); return; }
    setBusy(true);
    const response = await fetch("/api/threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send-comment-otp", name: name.trim(), email: email.trim() }) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    setBusy(false);
    if (!response.ok) { setMessage(data.error ?? "Unable to send a verification code."); return; }
    setCodeSent(true);
    setMessage("Check your email for the six-digit code.");
  }

  async function verifyCode() {
    setBusy(true);
    const response = await fetch("/api/threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify-commenter", email: email.trim(), code }) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    setBusy(false);
    if (!response.ok) { setMessage(data.error ?? "Unable to verify your email."); return; }
    onVerified();
  }

  return <div className="fixed inset-0 z-[100] grid place-items-center bg-[#13281e]/55 p-5 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="guest-identity-title" className="w-full max-w-md rounded-[28px] border border-[#d9cdbb] bg-[#fffaf1] p-6 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-5"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#92764e]">Community access</p><h2 id="guest-identity-title" className="mt-2 font-serif text-3xl text-[#203b2c]">Join the conversation</h2></div><button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border border-[#ddd1bd] text-[#30483a]"><X size={17} /></button></div>
      <p className="mt-3 text-sm leading-6 text-[#667066]">Enter your details, then verify your email to post, reply, or react.</p>
      <div className="mt-6 grid gap-3"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" maxLength={80} autoComplete="name" className="min-h-12 rounded-xl border border-[#d9cdbb] bg-white px-4 text-sm outline-none focus:border-[#71856c]" /><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" type="email" maxLength={254} autoComplete="email" className="min-h-12 rounded-xl border border-[#d9cdbb] bg-white px-4 text-sm outline-none focus:border-[#71856c]" />
      {codeSent && <input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit email code" inputMode="numeric" maxLength={6} className="min-h-12 rounded-xl border border-[#d9cdbb] bg-white px-4 text-sm tracking-[.3em] outline-none focus:border-[#71856c]" />}</div>
      {message && <p className="mt-3 text-sm text-[#61755c]">{message}</p>}
      <button type="button" disabled={busy || (codeSent && code.length !== 6)} onClick={() => void (codeSent ? verifyCode() : sendCode())} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#203b2c] px-4 text-sm font-semibold text-[#fffaf1] disabled:opacity-50">{codeSent ? <><Check size={16} />Verify email</> : <><Send size={16} />Send verification code</>}</button>
    </section>
  </div>;
}
