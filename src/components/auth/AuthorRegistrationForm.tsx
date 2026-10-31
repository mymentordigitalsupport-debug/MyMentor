"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

export function AuthorRegistrationForm() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "", publicName: "", email: "", password: "", confirmPassword: "", bio: "", expertiseSummary: "", intendedTopics: "", motivation: "", websiteUrl: "", portfolioUrl: "",
  });

  function setField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
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
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Full name" value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} required />
        <Input label="Public author name" value={form.publicName} onChange={(event) => setField("publicName", event.target.value)} required />
      </div>
      <Input label="Email address" type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordInput label="Password" value={form.password} onChange={(event) => setField("password", event.target.value)} required />
        <PasswordInput label="Confirm password" value={form.confirmPassword} onChange={(event) => setField("confirmPassword", event.target.value)} required />
      </div>
      <Textarea label="Short biography" value={form.bio} onChange={(event) => setField("bio", event.target.value)} placeholder="Tell readers who you are." required />
      <Textarea label="Relevant experience or expertise" value={form.expertiseSummary} onChange={(event) => setField("expertiseSummary", event.target.value)} placeholder="Describe your lived, professional, or study experience." required />
      <Input label="Topics you want to write about" value={form.intendedTopics} onChange={(event) => setField("intendedTopics", event.target.value)} placeholder="Recovery, family support, prevention" hint="Separate topics with commas." required />
      <Textarea label="Why do you want to contribute?" value={form.motivation} onChange={(event) => setField("motivation", event.target.value)} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Website" value={form.websiteUrl} onChange={(event) => setField("websiteUrl", event.target.value)} placeholder="https://" />
        <Input label="Portfolio or writing sample" value={form.portfolioUrl} onChange={(event) => setField("portfolioUrl", event.target.value)} placeholder="https://" />
      </div>
      <Button type="submit" loading={loading} size="lg" fullWidth>Submit author application</Button>
    </form>
  );
}
