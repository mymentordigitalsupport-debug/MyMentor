import Link from "next/link";
import { ArrowUpRight, Check, FileText, HeartHandshake, LockKeyhole, Mail, Scale, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

type Section = { title: string; body: ReactNode };

const privacy: Section[] = [
  { title: "What we collect", body: <>Your account details, the profile information you choose to share, and your use of MyMentor. This can include learning progress, journal entries, and Threads content.</> },
  { title: "Why we use it", body: <>To run your account, save your progress, personalize your experience, keep the community safe, and send account-related messages. We do not sell your personal information.</> },
  { title: "Your private spaces", body: <>Journal entries are personal to your account. Community posts are visible according to your chosen identity and the Threads experience. Use anonymous mode whenever that feels right for you.</> },
  { title: "Your choices", body: <>You can update account details in Settings, delete your account, and contact us for privacy requests. We keep information only as long as needed to operate MyMentor and meet legal obligations.</> },
];

const terms: Section[] = [
  { title: "Using MyMentor", body: <>MyMentor is a place for learning, reflection, and peer support. Use it lawfully, honestly, and in a way that respects the people you meet here.</> },
  { title: "Community care", body: <>Do not post harassment, threats, hate, private information, scams, spam, or unsafe material. We may remove content or restrict access when it threatens the community.</> },
  { title: "Not emergency care", body: <>MyMentor is not medical care, therapy, or emergency support. If you or another person may be in immediate danger, contact local emergency services or a qualified professional.</> },
  { title: "Your account", body: <>Keep your account secure and tell us if you believe it has been accessed without permission. You are responsible for content posted through your account.</> },
];

export function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const isPrivacy = type === "privacy";
  const title = isPrivacy ? "Privacy, held with care." : "Terms for a thoughtful space.";
  const eyebrow = isPrivacy ? "Privacy policy" : "Terms & conditions";
  const Icon = isPrivacy ? LockKeyhole : Scale;
  const sections = isPrivacy ? privacy : terms;
  return <main className="min-h-screen overflow-hidden bg-[#f5f1e9] text-[#1b3329]">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10"><Link href="/" className="font-serif text-xl font-semibold tracking-tight">MyMentor<span className="text-[#a98245]">.</span></Link><Link href="/threads" className="rounded-full border border-[#1b3329]/15 bg-white/60 px-4 py-2 text-sm font-medium transition hover:bg-white">Community</Link></header>
    <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-9 sm:px-10 sm:pb-24 sm:pt-14"><div className="absolute right-[-10%] top-0 h-72 w-72 rounded-full bg-[#d9c28e]/25 blur-3xl" /><div className="grid items-end gap-9 lg:grid-cols-[1.25fr_.75fr]"><div className="relative"><p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.22em] text-[#6d806e]"><Icon size={15} /> {eyebrow}</p><h1 className="max-w-3xl font-serif text-5xl leading-[.98] tracking-[-.045em] sm:text-7xl">{title}</h1><p className="mt-7 max-w-xl text-base leading-7 text-[#5d6c64]">Clear words for how we look after you, your information, and the community we are building together.</p></div><aside className="relative rounded-[28px] border border-[#1b3329]/10 bg-[#1b4735] p-7 text-[#f9f5ec] shadow-[0_20px_50px_rgba(27,51,41,.16)]"><ShieldCheck className="mb-8 text-[#e5c175]" size={29} /><p className="font-serif text-2xl leading-tight">A space built for your next honest step.</p><p className="mt-5 border-t border-white/15 pt-4 text-sm text-white/65">Last updated<br /><span className="text-white">October 29, 2026</span></p></aside></div></section>
    <section className="border-y border-[#1b3329]/10 bg-[#fcfaf5]"><div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[240px_1fr]"><aside><p className="text-xs font-bold uppercase tracking-[.18em] text-[#819184]">On this page</p><nav className="mt-5 space-y-3 border-l border-[#1b3329]/15 pl-4 text-sm text-[#637169]">{sections.map((section, index) => <a key={section.title} href={`#section-${index}`} className="block transition hover:text-[#1b4735]">{section.title}</a>)}</nav></aside><div className="max-w-3xl">{sections.map((section, index) => <article id={`section-${index}`} key={section.title} className="border-b border-[#1b3329]/10 py-8 first:pt-0 last:border-0"><div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#e6efe1] text-xs font-bold text-[#315e45]">0{index + 1}</div><h2 className="font-serif text-3xl tracking-[-.025em]">{section.title}</h2><p className="mt-4 max-w-2xl text-[.98rem] leading-8 text-[#596861]">{section.body}</p></article>)}</div></div></section>
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10"><div className="flex flex-col justify-between gap-6 rounded-[26px] bg-[#e7d4a0] p-7 sm:flex-row sm:items-center sm:p-10"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#6b5529]"><HeartHandshake size={15} /> Still have a question?</p><h2 className="mt-3 font-serif text-3xl tracking-[-.03em]">We&apos;re here to help.</h2></div><a href="mailto:hello@mymentor.digital" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#1b4735] px-5 py-3 text-sm font-semibold text-white">Email MyMentor <Mail size={16} /></a></div><div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm text-[#6f7b74]"><Link href="/privacy" className="inline-flex items-center gap-1 hover:text-[#1b4735]">Privacy <ArrowUpRight size={14} /></Link><Link href="/terms" className="inline-flex items-center gap-1 hover:text-[#1b4735]">Terms <ArrowUpRight size={14} /></Link><Link href="/" className="inline-flex items-center gap-1 hover:text-[#1b4735]">Return home <Check size={14} /></Link></div></section>
  </main>;
}
