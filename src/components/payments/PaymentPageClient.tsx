"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Check, CheckCircle2, Clipboard, CreditCard, FileImage, Heart, Info, Landmark, Leaf, LockKeyhole, ShieldCheck, UploadCloud, X } from "lucide-react";
import { BotanicalSprig, CommunityTexture, PaperPin, PaperSurface, PaperTape } from "@/components/threads/ThreadPaper";
import styles from "./PaymentPageClient.module.css";

type ProductCode = "chapter_1" | "full_course" | "full_course_upgrade";
type AccessLevel = "chapter_1" | "full_course" | null;
type RequestRow = { id: string; product_code: ProductCode; amount_cents: number; payment_reference: string; status: string; admin_note: string | null; payment_proofs?: { id: string }[] };
type Bank = { bank_name: string; account_holder: string; account_number: string; branch_code: string | null; instructions: string | null } | null;
type Notice = { text: string; kind: "success" | "error" } | null;

const initialPlans = [
  { code: "chapter_1" as const, number: "01", title: "Start with chapter one", price: "R29", detail: "A gentle first step. Explore the opening chapter before deciding what comes next.", action: "Choose chapter one", icon: Leaf },
  { code: "full_course" as const, number: "02", title: "The complete journey", price: "R79", detail: "All chapters, lessons, and reflections. One simple payment, at your pace.", action: "Choose full course", icon: Heart },
];
const ACTIVE_STATUSES = new Set(["pending", "under_review", "needs_resubmission"]);
const CANCELLABLE_STATUSES = new Set(["pending", "needs_resubmission"]);
const labelFor = (code: string) => code === "chapter_1" ? "Chapter one" : code === "full_course_upgrade" ? "Full course upgrade" : "Full course";
const money = (cents: number) => `R${(cents / 100).toFixed(2)}`;

export function PaymentPageClient() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [bank, setBank] = useState<Bank>(null);
  const [payment, setPayment] = useState<RequestRow | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [startingPlan, setStartingPlan] = useState<ProductCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(null);
  const history = requests.filter((row) => !ACTIVE_STATUSES.has(row.status));
  const plans = accessLevel === "chapter_1"
    ? [
        { ...initialPlans[0], unlocked: true },
        { code: "full_course_upgrade" as const, number: "02", title: "Complete your journey", price: "R50", detail: "You have already paid R29. Pay the remaining R50 to unlock every chapter, lesson, and reflection.", action: "Upgrade for R50", icon: Heart, unlocked: false },
      ]
    : initialPlans.map((plan) => ({ ...plan, unlocked: accessLevel === "full_course" }));

  async function load() {
    try {
      const response = await fetch("/api/payments/requests", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load payment details.");
      setRequests(body.requests ?? []);
      setPayment(body.activePayment ?? null);
      setBank(body.bank ?? null);
      setAccessLevel(body.accessLevel === "chapter_1" || body.accessLevel === "full_course" ? body.accessLevel : null);
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Unable to load payment details.", kind: "error" });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); }, []);

  async function start(productCode: ProductCode) {
    if (busy || payment) return;
    setBusy(true); setStartingPlan(productCode); setNotice(null);
    try {
      const response = await fetch("/api/payments/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productCode }) });
      const body = await response.json();
      if (!response.ok) {
        if (body.payment) await load();
        throw new Error(body.error || "Unable to start your payment request.");
      }
      setPayment(body.payment); setBank(body.bank); setFile(null);
      setRequests((current) => [body.payment, ...current.filter((row) => row.id !== body.payment.id)]);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        document.getElementById("eft-instructions")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }));
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Unable to start your payment request.", kind: "error" });
    } finally {
      setBusy(false); setStartingPlan(null);
    }
  }

  async function uploadAndSubmit() {
    if (!payment || !file || busy) return;
    if (file.size > 5 * 1024 * 1024) return setNotice({ text: "Choose an image smaller than 5 MB.", kind: "error" });
    setBusy(true); setNotice(null);
    try {
      const form = new FormData(); form.append("file", file);
      const upload = await fetch(`/api/payments/requests/${payment.id}/proof`, { method: "POST", body: form });
      const uploadBody = await upload.json();
      if (!upload.ok) throw new Error(uploadBody.error || "Unable to upload proof.");
      const submit = await fetch(`/api/payments/requests/${payment.id}/submit`, { method: "POST" });
      const submitBody = await submit.json();
      if (!submit.ok) throw new Error(submitBody.error || "Unable to submit payment.");
      setFile(null);
      setNotice({ text: "Proof received. We’ll review your EFT and unlock your access once it clears.", kind: "success" });
      await load();
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Unable to submit payment.", kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function cancelPayment() {
    if (!payment || !CANCELLABLE_STATUSES.has(payment.status) || busy) return;
    setBusy(true); setNotice(null);
    try {
      const response = await fetch(`/api/payments/requests/${payment.id}/cancel`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to cancel this request.");
      setPayment(null); setFile(null);
      setNotice({ text: "Request cancelled. Choose the option that suits you now.", kind: "success" });
      await load();
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Unable to cancel this request.", kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function copyReference() {
    if (!payment) return;
    try {
      await navigator.clipboard.writeText(payment.payment_reference);
      setNotice({ text: "Payment reference copied.", kind: "success" });
    } catch {
      setNotice({ text: "Could not copy automatically. Select the reference to copy it.", kind: "error" });
    }
  }

  return <div className={styles.page}>
    <CommunityTexture id="payment-texture" />
    <section className={styles.hero} aria-labelledby="payment-title">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span />YOUR NEXT CHAPTER<span /></p>
          <h1 id="payment-title">A little step.<br /><span>A lot of <em>possibility.</em></span></h1>
          <p className={styles.heroDescription}>Choose the way you’d like to begin. Pay by EFT, share your proof, and we’ll open your learning space once your payment is confirmed.</p>
          <div className={styles.heroPromise}><ShieldCheck size={17} /> One choice at a time <span /> Checked by a real person</div>
        </div>
        <aside className={styles.heroNote} aria-label="Our promise to you">
          <PaperSurface seed={13} /><PaperPin className={styles.heroPin} />
          <span className={styles.noteEyebrow}>A note for you</span>
          <p>Your journey.<br />Your pace.<br />Your next step.</p>
          <svg viewBox="0 0 160 22" aria-hidden="true"><path d="M3 17C45 3 102 2 156 12" /></svg>
        </aside>
        <BotanicalSprig className={styles.heroSprig} />
      </div>
    </section>

    <div className={styles.content}>
      <div className={styles.sectionIntro}><div><p className={styles.sectionEyebrow}>{accessLevel === "full_course" ? "YOUR ACCESS" : accessLevel === "chapter_1" ? "CONTINUE WHEN READY" : "START WHERE YOU ARE"}</p><h2>{accessLevel === "full_course" ? "Your full journey is unlocked" : accessLevel === "chapter_1" ? "Chapter one is yours" : "Choose your starting point"}</h2></div><p>{accessLevel === "full_course" ? "No further payment is needed." : accessLevel === "chapter_1" ? "Upgrade at any time for the remaining R50." : "Just one option for now. You can change your choice while your request is still pending."}</p></div>
      <section className={styles.planGrid} aria-label="Learning access options">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const chosen = payment?.product_code === plan.code;
          return <article key={plan.code} className={styles.plan} data-selected={chosen} data-unlocked={plan.unlocked} data-access-level={accessLevel ?? "none"}>
            <PaperSurface seed={index + 18} warm={index === 1} />
            {index === 0 ? <PaperPin className={styles.planPin} /> : <PaperTape className={styles.planTape} />}
            <div className={styles.planTop}><span>{plan.number} / THE PATH</span><Icon size={22} strokeWidth={1.6} aria-hidden="true" /></div>
            <h3>{plan.title}</h3><p className={styles.planDetail}>{plan.detail}</p>
            <div className={styles.planBottom}><div className={styles.price}>{plan.price}<small>.00</small></div><span>one-time EFT</span></div>
            {chosen ? <div className={styles.chosen}><CheckCircle2 size={17} /> Your current choice</div> : <button type="button" className={styles.chooseButton} onClick={() => void start(plan.code)} disabled={busy || Boolean(payment) || loading}>{startingPlan === plan.code ? "Setting up…" : payment ? "Cancel current request to switch" : plan.action}<ArrowRight size={18} aria-hidden="true" /></button>}
          </article>;
        })}
      </section>

      {notice && <div className={styles.notice} data-kind={notice.kind} role={notice.kind === "error" ? "alert" : "status"}>{notice.kind === "error" ? <Info size={18} /> : <CheckCircle2 size={18} />}{notice.text}</div>}

      {payment && <section id="eft-instructions" className={styles.paymentSection} aria-label="Your EFT instructions">
        <div className={styles.paymentPaper}>
          <PaperSurface seed={31} /><PaperTape className={styles.paymentTape} />
          <div className={styles.paymentHeader}><div><p className={styles.sectionEyebrow}>YOUR PAYMENT REQUEST</p><h2>{payment.status === "under_review" ? "We’re checking your EFT" : payment.status === "needs_resubmission" ? "A new proof is needed" : "Make your EFT"}</h2><p>{labelFor(payment.product_code)} · {money(payment.amount_cents)}</p></div>{CANCELLABLE_STATUSES.has(payment.status) && <button type="button" className={styles.cancel} onClick={() => void cancelPayment()} disabled={busy} aria-label="Cancel this payment request and choose another option" title="Cancel and choose another option"><X size={21} /></button>}</div>
          <div className={styles.referenceBox}><div><span>YOUR UNIQUE REFERENCE</span><strong>{payment.payment_reference}</strong></div><button type="button" onClick={() => void copyReference()} aria-label="Copy payment reference"><Clipboard size={18} /> Copy</button></div>
          {bank ? <><div className={styles.bankHeading}><Landmark size={19} /><span>Send your EFT to</span></div><dl className={styles.bankGrid}><div><dt>Bank</dt><dd>{bank.bank_name}</dd></div><div><dt>Account holder</dt><dd>{bank.account_holder}</dd></div><div><dt>Account number</dt><dd>{bank.account_number}</dd></div>{bank.branch_code && <div><dt>Branch code</dt><dd>{bank.branch_code}</dd></div>}<div><dt>Amount</dt><dd>{money(payment.amount_cents)}</dd></div></dl>{bank.instructions && <p className={styles.bankInstructions}>{bank.instructions}</p>}</> : <div className={styles.bankUnavailable}><Info size={19} /><div><strong>Bank details are being prepared.</strong><p>Do not send an EFT until the account details appear here. Contact support if you need help.</p></div></div>}
          {payment.status === "needs_resubmission" && <div className={styles.correctionState} role="alert"><AlertCircle size={22} /><div><strong>Your previous proof could not be accepted.</strong><p>{payment.admin_note || "Upload a new, clear proof of payment so the team can review it again."}</p></div></div>}
          {payment.status === "under_review" ? <div className={styles.reviewState}><CheckCircle2 size={22} /><div><strong>Proof submitted</strong><p>We’ll verify the deposit in our bank account before granting access. A screenshot alone does not unlock the course.</p></div></div> : bank && <div className={styles.proofArea}><label htmlFor="payment-proof"><span className={styles.proofTitle}><FileImage size={19} /> {payment.status === "needs_resubmission" ? "Upload new proof of payment" : "Proof of payment"}</span><span className={styles.uploadBox}><UploadCloud size={26} /><strong>{file ? file.name : "Choose your payment screenshot"}</strong><small>JPG, PNG or WebP · maximum 5 MB</small></span></label><input id="payment-proof" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /><button type="button" className={styles.submitButton} onClick={() => void uploadAndSubmit()} disabled={!file || busy}>{busy ? "Submitting…" : payment.status === "needs_resubmission" ? "Send new proof for review" : "Send proof for review"}<ArrowRight size={18} /></button></div>}
        </div>
        <aside className={styles.nextSteps}><PaperSurface seed={42} warm /><PaperPin className={styles.stepsPin} /><p className={styles.sectionEyebrow}>WHAT HAPPENS NEXT</p><h3>A human checks every payment.</h3><ol><li><span>1</span><p>Send the exact amount using your unique reference.</p></li><li><span>2</span><p>Upload a clear screenshot or proof of payment.</p></li><li><span>3</span><p>We confirm the deposit, then unlock your access.</p></li></ol><div className={styles.safeNote}><LockKeyhole size={17} /> Your proof is kept private.</div></aside>
      </section>}

      {history.length > 0 && <section className={styles.history} aria-label="Previous payment requests"><div className={styles.historyHeading}><h2>Earlier requests</h2><span>{history.length} {history.length === 1 ? "request" : "requests"}</span></div><div className={styles.historyList}>{history.map((row) => <article key={row.id}><div className={styles.historyIcon}>{row.status === "approved" ? <Check size={18} /> : <CreditCard size={18} />}</div><div><strong>{labelFor(row.product_code)} · {money(row.amount_cents)}</strong><p>Reference {row.payment_reference}</p>{row.admin_note && <p>{row.admin_note}</p>}</div><span className={styles.status} data-status={row.status}>{row.status.replaceAll("_", " ")}</span></article>)}</div></section>}
      <p className={styles.bottomMessage}><Heart size={15} /> A new beginning, one step at a time.</p>
    </div>
  </div>;
}
