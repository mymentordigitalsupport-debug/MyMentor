"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { ArrowLeft, ArrowRight } from "lucide-react";

const STEP_FIELDS = [
  ["fullName", "publicName", "email", "password", "confirmPassword"],
  ["bio", "expertiseSummary"],
  ["intendedTopics", "motivation"],
] as const;

export function AuthorRegistrationForm() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: "", publicName: "", email: "", password: "", confirmPassword: "", bio: "", expertiseSummary: "", intendedTopics: "", motivation: "", websiteUrl: "", portfolioUrl: "",
  });

  function setField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validateStep(index: number) {
    const missing = STEP_FIELDS[index].some((field) => !form[field].trim());
    if (missing) { toast.error("Complete this step", "Please fill in the required fields before continuing."); return false; }
    if (index === 0 && form.password !== form.confirmPassword) { toast.error("Passwords do not match", "Please enter the same password twice."); return false; }
    return true;
  }

  function nextStep() {
    if (validateStep(step)) setStep((current) => Math.min(current + 1, STEP_FIELDS.length - 1));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateStep(2) || form.password !== form.confirmPassword) {
      toast.error("Passwords do not match", "Please enter the same password twice.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/authors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          intendedTopics: form.intendedTopics.split(",").map((topic) => topic.trim()).filter(Boolean),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Unable to submit your application.");
      toast.success("Application submitted", "An administrator will review your author application.");
      router.push("/authors-login?application=pending");
    } catch (error) {
      toast.error("Application not submitted", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of 3`}>{["Account", "Your voice", "Application"].map((label, index) => <div key={label} className="flex min-w-0 flex-1 items-center gap-2"><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${index <= step ? "bg-forest text-cream" : "bg-mist text-muted"}`}>{index + 1}</span><span className={`truncate text-xs font-medium ${index === step ? "text-forest" : "text-muted"}`}>{label}</span>{index < 2 && <i className="h-px flex-1 bg-mist" />}</div>)}</div>
      {step === 0 && <div className="grid gap-5"><div className="grid gap-5 sm:grid-cols-2">
        <Input label="Full name" value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} required />
        <Input label="Public author name" value={form.publicName} onChange={(event) => setField("publicName", event.target.value)} required />
      </div>
      <Input label="Email address" type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordInput label="Password" value={form.password} onChange={(event) => setField("password", event.target.value)} required />
        <PasswordInput label="Confirm password" value={form.confirmPassword} onChange={(event) => setField("confirmPassword", event.target.value)} required />
      </div></div>}
      {step === 1 && <div className="grid gap-5">
      <Textarea label="Short biography" value={form.bio} onChange={(event) => setField("bio", event.target.value)} placeholder="Tell readers who you are." required />
      <Textarea label="Relevant experience or expertise" value={form.expertiseSummary} onChange={(event) => setField("expertiseSummary", event.target.value)} placeholder="Describe your lived, professional, or study experience." required />
      </div>}
      {step === 2 && <div className="grid gap-5">
      <Input label="Topics you want to write about" value={form.intendedTopics} onChange={(event) => setField("intendedTopics", event.target.value)} placeholder="Recovery, family support, prevention" hint="Separate topics with commas." required />
      <Textarea label="Why do you want to contribute?" value={form.motivation} onChange={(event) => setField("motivation", event.target.value)} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Website" value={form.websiteUrl} onChange={(event) => setField("websiteUrl", event.target.value)} placeholder="https://" />
        <Input label="Portfolio or writing sample" value={form.portfolioUrl} onChange={(event) => setField("portfolioUrl", event.target.value)} placeholder="https://" />
      </div></div>}
      <div className="flex items-center gap-3">{step > 0 && <Button type="button" variant="secondary" onClick={() => setStep((current) => current - 1)}><ArrowLeft className="h-4 w-4" />Back</Button>}{step < 2 ? <Button type="button" onClick={nextStep} className="ml-auto">Continue<ArrowRight className="h-4 w-4" /></Button> : <Button type="submit" loading={loading} size="lg" className="ml-auto">Submit application</Button>}</div>
    </form>
  );
}
