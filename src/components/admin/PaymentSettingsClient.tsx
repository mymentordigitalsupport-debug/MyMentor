"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function PaymentSettingsClient() {
  const [form, setForm] = useState({ bank_name: "", account_holder: "", account_number: "", branch_code: "", instructions: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { void fetch("/api/admin/payment-settings").then((response) => response.json()).then((body) => { if (body.settings) setForm(body.settings); }); }, []);
  function set(key: keyof typeof form, value: string) { setForm((current) => ({ ...current, [key]: value })); }
  async function save(event: React.FormEvent) { event.preventDefault(); setBusy(true); setMessage(""); const response = await fetch("/api/admin/payment-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const body = await response.json(); setBusy(false); setMessage(response.ok ? "Bank settings saved." : body.error ?? "Unable to save settings."); }
  return <div className="mx-auto max-w-3xl space-y-6"><Link href="/admin/payments" className="text-sm font-semibold text-forest underline">Back to EFT payments</Link><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Finance</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-forest">Bank instructions</h1></div><Card padding="lg"><form className="space-y-4" onSubmit={save}>{(["bank_name", "account_holder", "account_number", "branch_code"] as const).map((key) => <label key={key} className="block text-sm font-semibold capitalize text-text">{key.replaceAll("_", " ")}<input required={key !== "branch_code"} value={form[key]} onChange={(event) => set(key, event.target.value)} className="mt-2 block w-full rounded-xl border border-mist bg-cream p-3 font-normal" /></label>)}<label className="block text-sm font-semibold text-text">Payment instructions<textarea value={form.instructions} onChange={(event) => set("instructions", event.target.value)} rows={5} className="mt-2 block w-full rounded-xl border border-mist bg-cream p-3 font-normal" /></label><Button type="submit" loading={busy}>Save bank instructions</Button>{message && <p className="text-sm text-forest">{message}</p>}</form></Card></div>;
}
