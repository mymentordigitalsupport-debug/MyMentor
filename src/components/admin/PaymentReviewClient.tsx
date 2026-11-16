"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Payment = { id: string; user_id: string; product_code: string; amount_cents: number; payment_reference: string; status: string; admin_note: string | null; submitted_at: string | null; proof_url: string | null; payment_proofs?: { original_filename: string | null }[] };

export function PaymentReviewClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/admin/payments");
    if (response.ok) setPayments((await response.json()).payments ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function review(id: string, action: string) {
    setBusy(id); setMessage("");
    const responseNote = window.prompt(action === "approve" ? "Optional approval note" : action === "needs_resubmission" ? "What must the member fix in their proof?" : "Why was this EFT request not approved?");
    if (responseNote === null) { setBusy(""); return; }
    const note = responseNote.trim();
    if (action !== "approve" && !note) { setBusy(""); setMessage("Add a reason before sending this decision."); return; }
    const response = await fetch(`/api/admin/payments/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, note }) });
    const body = await response.json(); setBusy("");
    if (!response.ok) return setMessage(body.error ?? "Unable to review payment.");
    setMessage("Payment review saved."); await load();
  }

  const pending = payments.filter((payment) => ["pending", "under_review", "needs_resubmission"].includes(payment.status));
  return <div className="space-y-6"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Finance</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-forest">EFT payment review</h1><p className="mt-3 text-muted">Confirm each payment against the bank account before granting course access.</p></div>{message && <p className="rounded-2xl bg-sage/10 p-4 text-sm font-medium text-forest">{message}</p>}<div className="space-y-4">{pending.length ? pending.map((payment) => <Card key={payment.id} padding="lg"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xl font-semibold text-forest">{payment.product_code === "chapter_1" ? "Chapter 1" : "Full course"} · R{(payment.amount_cents / 100).toFixed(2)}</p><p className="mt-2 text-sm text-muted">User: {payment.user_id}</p><p className="text-sm text-muted">Reference: <strong>{payment.payment_reference}</strong></p><p className="text-sm text-muted">Submitted: {payment.submitted_at ? new Date(payment.submitted_at).toLocaleString("en-ZA") : "Not submitted"}</p></div><span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">{payment.status.replaceAll("_", " ")}</span></div>{payment.proof_url ? <a className="mt-5 block text-sm font-semibold text-forest underline" href={payment.proof_url} target="_blank" rel="noreferrer">Open proof of payment</a> : <p className="mt-5 text-sm text-danger">No proof uploaded.</p>}<div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => void review(payment.id, "approve")} loading={busy === payment.id}>Approve payment</Button><Button variant="secondary" onClick={() => void review(payment.id, "needs_resubmission")} disabled={Boolean(busy)}>Request resubmission</Button><Button variant="danger" onClick={() => void review(payment.id, "reject")} disabled={Boolean(busy)}>Reject</Button></div></Card>) : <Card padding="lg"><p className="text-sm text-muted">No pending payments.</p></Card>}</div></div>;
}
