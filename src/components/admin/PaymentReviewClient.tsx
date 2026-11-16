"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Payment = {
  id: string;
  user_id: string;
  product_code: string;
  amount_cents: number;
  payment_reference: string;
  status: string;
  admin_note: string | null;
  submitted_at: string | null;
  created_at: string;
  proof_url: string | null;
  payment_proofs?: Array<{ original_filename: string | null; created_at: string }>;
};

type Feedback = { kind: "success" | "error"; text: string } | null;

const productLabel = (code: string) => code === "chapter_1" ? "Chapter 1" : code === "full_course_upgrade" ? "Full course upgrade" : "Full course";
const statusLabel = (status: string) => status.replaceAll("_", " ");

export function PaymentReviewClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function load() {
    try {
      const response = await fetch("/api/admin/payments", { cache: "no-store" });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Unable to load EFT requests.");
      setPayments(body?.payments ?? []);
    } catch (error) {
      setFeedback({ kind: "error", text: error instanceof Error ? error.message : "Unable to load EFT requests." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const refresh = () => { void load(); };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  async function review(payment: Payment, action: "approve" | "needs_resubmission" | "reject") {
    if (payment.status !== "under_review" || !payment.proof_url) {
      setFeedback({ kind: "error", text: "This EFT cannot be reviewed until the member submits proof of payment." });
      return;
    }
    const promptText = action === "approve" ? "Optional approval note" : action === "needs_resubmission" ? "What must the member correct in their proof?" : "Why was this EFT request rejected?";
    const responseNote = window.prompt(promptText);
    if (responseNote === null) return;
    const note = responseNote.trim();
    if (action !== "approve" && !note) {
      setFeedback({ kind: "error", text: "Add a clear reason before sending this decision." });
      return;
    }

    setBusy(payment.id);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/payments/${payment.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Unable to save the EFT decision.");
      if (body?.memberNotified === false) {
        setFeedback({ kind: "error", text: "The EFT decision was saved, but the member email failed. Contact the member manually." });
        await load();
        return;
      }
      const success = action === "approve"
        ? "EFT approved. Course access is active and the member was notified."
        : action === "reject"
          ? "EFT rejected. The reason was saved and the member was notified."
          : "New proof requested. The reason was saved and the member was notified.";
      setFeedback({ kind: "success", text: success });
      await load();
    } catch (error) {
      setFeedback({ kind: "error", text: error instanceof Error ? error.message : "Unable to save the EFT decision." });
    } finally {
      setBusy("");
    }
  }

  const ready = payments.filter((payment) => payment.status === "under_review");
  const waiting = payments.filter((payment) => ["pending", "needs_resubmission"].includes(payment.status));
  const history = payments.filter((payment) => ["approved", "rejected", "cancelled"].includes(payment.status));

  return <div className="space-y-8">
    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Finance</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-forest">EFT payment review</h1><p className="mt-3 text-muted">Only requests with submitted proof can be approved, rejected, or returned.</p></div>
    {feedback && <div role={feedback.kind === "error" ? "alert" : "status"} aria-live="polite" className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium ${feedback.kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{feedback.kind === "error" ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />}<span>{feedback.text}</span></div>}

    <section className="space-y-4" aria-labelledby="ready-title"><div className="flex items-center justify-between gap-4"><div><h2 id="ready-title" className="text-2xl font-semibold text-forest">Ready for review</h2><p className="mt-1 text-sm text-muted">Proof uploaded and submitted by the member.</p></div><span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-forest">{ready.length}</span></div>{loading ? <Card padding="lg"><p className="text-sm text-muted">Loading EFT requests…</p></Card> : ready.length ? ready.map((payment) => <PaymentCard key={payment.id} payment={payment} busy={busy} onReview={review} />) : <Card padding="lg"><p className="text-sm text-muted">No EFT proofs are waiting for review.</p></Card>}</section>

    {waiting.length > 0 && <section className="space-y-4" aria-labelledby="waiting-title"><div><h2 id="waiting-title" className="text-2xl font-semibold text-forest">Waiting for member</h2><p className="mt-1 text-sm text-muted">These requests cannot be reviewed until a new proof is submitted.</p></div>{waiting.map((payment) => <Card key={payment.id} padding="lg"><PaymentSummary payment={payment} /><div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><Clock3 className="mt-0.5 h-5 w-5 shrink-0" /><div><strong>{payment.status === "needs_resubmission" ? "New proof requested" : "Proof not submitted"}</strong><p className="mt-1">{payment.status === "needs_resubmission" ? payment.admin_note : "The member has created a reference but has not submitted proof. No admin action is available."}</p></div></div></Card>)}</section>}

    {history.length > 0 && <section className="space-y-4" aria-labelledby="history-title"><div><h2 id="history-title" className="text-2xl font-semibold text-forest">Decision history</h2><p className="mt-1 text-sm text-muted">Completed, rejected, and cancelled EFT requests.</p></div>{history.map((payment) => <Card key={payment.id} padding="lg"><PaymentSummary payment={payment} />{payment.admin_note && <p className="mt-4 rounded-xl bg-stone-50 p-3 text-sm text-muted"><strong className="text-forest">Reviewer note:</strong> {payment.admin_note}</p>}</Card>)}</section>}
  </div>;
}

function PaymentCard({ payment, busy, onReview }: { payment: Payment; busy: string; onReview: (payment: Payment, action: "approve" | "needs_resubmission" | "reject") => Promise<void> }) {
  return <Card padding="lg"><PaymentSummary payment={payment} />{payment.proof_url ? <a className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest underline" href={payment.proof_url} target="_blank" rel="noreferrer"><FileCheck2 className="h-4 w-4" />Open latest proof of payment</a> : <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-red-700"><AlertCircle className="h-4 w-4" />Proof unavailable. Review is blocked.</p>}<div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => void onReview(payment, "approve")} loading={busy === payment.id} disabled={!payment.proof_url || Boolean(busy)}>Approve payment</Button><Button variant="secondary" onClick={() => void onReview(payment, "needs_resubmission")} disabled={!payment.proof_url || Boolean(busy)}>Request new proof</Button><Button variant="danger" onClick={() => void onReview(payment, "reject")} disabled={!payment.proof_url || Boolean(busy)}>Reject payment</Button></div></Card>;
}

function PaymentSummary({ payment }: { payment: Payment }) {
  return <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xl font-semibold text-forest">{productLabel(payment.product_code)} · R{(payment.amount_cents / 100).toFixed(2)}</p><p className="mt-2 text-sm text-muted">User: {payment.user_id}</p><p className="text-sm text-muted">Reference: <strong>{payment.payment_reference}</strong></p><p className="text-sm text-muted">Submitted: {payment.submitted_at ? new Date(payment.submitted_at).toLocaleString("en-ZA") : "Not submitted"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${payment.status === "approved" ? "bg-emerald-100 text-emerald-800" : payment.status === "rejected" ? "bg-red-100 text-red-800" : "bg-gold/20 text-forest"}`}>{statusLabel(payment.status)}</span></div>;
}
