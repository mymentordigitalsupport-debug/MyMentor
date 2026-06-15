import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";
import { SectionReveal } from "@/components/landing/SectionReveal";

const books = [
  {
    title: "From Addicts to Leaders",
    description: "A leadership pathway for moving from destruction to responsibility, character, and service.",
    accent: "sage",
    number: "01",
  },
  {
    title: "Protecting the Next Generation",
    description: "A family-centered journey that helps adults build safer homes and stronger futures for children.",
    accent: "gold",
    number: "02",
  },
  {
    title: "Uprooting Drug Abuse",
    description: "A biblical and practical framework for understanding addiction, breaking bondage, and restoring people.",
    accent: "forest",
    number: "03",
  },
] as const;

const pillars = [
  {
    title: "Truth",
    description: "The kind that confronts without shaming and clarifies without noise.",
  },
  {
    title: "Structure",
    description: "A steady sequence of chapters, lessons, and actions that keeps people moving.",
  },
  {
    title: "Care",
    description: "A platform that feels humane, honest, and safe enough to keep using.",
  },
] as const;

export function LandingSections() {
  return (
    <div className="relative space-y-8 bg-cream px-4 pb-16 pt-0 sm:px-6 lg:px-8 lg:pb-28">
      <SectionReveal>
        <section
          id="mission"
          className="texture-noise mx-auto -mt-14 max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#cbc1b2] bg-[#f4efe6] shadow-[0_24px_90px_-55px_rgba(31,42,36,0.55)]"
        >
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="max-w-2xl space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#a9b099] bg-[#f8f4eb] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-forest">
                  <Sparkles className="h-4 w-4" />
                  Why My Mentor exists
                </span>
                <h2 className="font-serif max-w-xl text-4xl font-semibold tracking-[-0.05em] text-text sm:text-5xl lg:text-6xl">
                  Because transformation should never be walked alone.
                </h2>
                <p className="max-w-xl text-base leading-8 text-muted">
                  My Mentor exists for people who need a guide, not a lecture. It brings together books, course
                  structure, chapter flow, and daily action so growth becomes practical instead of theoretical.
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {pillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="rounded-[1.5rem] border border-[#d7cebf] bg-[#fbf8f1] p-5 shadow-[0_14px_40px_-35px_rgba(31,42,36,0.5)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage">{pillar.title}</p>
                    <p className="mt-3 text-sm leading-7 text-text">{pillar.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-6 text-sm font-semibold text-cream transition hover:bg-[#223128]"
                >
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a
                  href="#books"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#b8ae9d] px-6 text-sm font-semibold text-text transition hover:border-forest hover:text-forest"
                >
                  Explore the books
                </a>
              </div>
            </div>

            <div className="relative min-h-[28rem] border-t border-[#d8cfbf] bg-[#e6dfd1] lg:min-h-full lg:border-l lg:border-t-0">
              <Image
                src="/assets/images/register-bg.png"
                alt="My Mentor transformation poster"
                fill
                className="object-cover object-left"
                priority
              />
              <div className="absolute inset-0 bg-[#11110e]/18" />
              <div className="absolute left-4 top-4 max-w-[14rem] rounded-full border border-white/20 bg-[#11110e]/80 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cream backdrop-blur-sm">
                Guided change
              </div>
              <div className="absolute bottom-4 left-4 right-4 rounded-[1.5rem] border border-white/12 bg-[#11110e]/82 p-5 text-cream shadow-[0_16px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cream/65">Platform promise</p>
                <p className="mt-3 max-w-md text-lg leading-8 text-cream/88">
                  My Mentor is designed to feel like a mentor beside you: direct, grounded, and consistent.
                </p>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delayMs={100}>
        <section id="books" className="texture-noise mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#1d1f1b] bg-[#0f100e] text-cream shadow-[0_30px_100px_-60px_rgba(0,0,0,0.8)]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">The books</p>
                <h2 className="font-serif mt-3 text-4xl font-semibold tracking-[-0.05em] text-cream sm:text-5xl">
                  Three books. Three pathways. One platform.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-cream/70">
                Each book becomes a course with its own arc, its own lessons, and its own way of helping people move
                forward with clarity.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_1.12fr_0.95fr] lg:items-end">
              {books.map((book, index) => (
                <article
                  key={book.title}
                  className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#191a16] p-6 shadow-[0_20px_80px_-55px_rgba(0,0,0,0.85)] transition duration-300 hover:-translate-y-1 hover:border-white/20 ${
                    index === 1 ? "lg:-mt-10" : index === 2 ? "lg:mt-10" : ""
                  }`}
                >
                  <div
                    className={`absolute right-4 top-4 text-7xl font-semibold tracking-[-0.08em] ${
                      book.accent === "sage"
                        ? "text-sage/10"
                        : book.accent === "gold"
                          ? "text-gold/10"
                          : "text-cream/10"
                    }`}
                    aria-hidden="true"
                  >
                    {book.number}
                  </div>
                  <div className="relative">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cream/55">Course {book.number}</p>
                    <h3 className="font-serif mt-4 max-w-xs text-3xl font-semibold tracking-[-0.04em] text-cream">
                      {book.title}
                    </h3>
                    <p className="mt-5 text-sm leading-7 text-cream/72">{book.description}</p>

                    <div className="mt-8 flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/6">
                        <BookOpen className="h-4 w-4 text-cream" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/55">Built for</p>
                        <p className="text-sm font-semibold text-cream">Guided growth</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delayMs={180}>
        <section
          id="owner"
          className="texture-noise mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#1f221d] bg-[#10110f] text-cream shadow-[0_28px_95px_-60px_rgba(0,0,0,0.85)]"
        >
          <div className="grid lg:grid-cols-[1fr_0.98fr]">
            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="max-w-2xl space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">The man behind the mission</p>
                <h2 className="font-serif text-5xl font-semibold tracking-[-0.06em] text-cream sm:text-6xl lg:text-7xl">
                  Craig
                </h2>
                <p className="max-w-xl text-base leading-8 text-cream/76">
                  Craig built My Mentor on the belief that people heal when truth is clear, structure is steady, and
                  support is honest. The platform is the expression of that conviction.
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: ShieldCheck, title: "Trust", text: "Clear direction and dependable design." },
                    { icon: HeartHandshake, title: "Care", text: "A tone that respects the person." },
                    { icon: Users2, title: "Service", text: "Built to help others move forward." },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                      <item.icon className="h-5 w-5 text-sage" />
                      <p className="mt-3 text-sm font-semibold text-cream">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-cream/70">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-[#171814] lg:border-l lg:border-t-0">
              <div className="grid h-full gap-4 p-6 sm:p-8 lg:p-10">
                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0c0a] shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
                  <div className="grid min-h-[24rem] lg:grid-cols-[0.86fr_1.14fr]">
                    <div className="relative min-h-[18rem] bg-[#f1ebde]">
                      <Image
                        src="/assets/images/default-profilepng.png"
                        alt="Founder silhouette"
                        fill
                        className="object-contain p-6"
                      />
                    </div>
                    <div className="flex flex-col justify-between p-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Founder note</p>
                        <blockquote className="mt-4 max-w-md text-2xl leading-[1.35] tracking-[-0.03em] text-cream">
                          “I wrote these courses to help people walk out of survival and into purpose.”
                        </blockquote>
                      </div>
                      <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cream/55">Craig</p>
                          <p className="mt-1 text-sm leading-6 text-cream/70">Owner and builder of My Mentor</p>
                        </div>
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/6 text-sage">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">For the user</p>
                    <p className="mt-3 text-sm leading-7 text-cream/74">
                      The experience should feel calm, serious, and easy to trust from the first scroll.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Brand posture</p>
                    <p className="mt-3 text-sm leading-7 text-cream/74">
                      Less hype. More conviction. A page that feels authored rather than assembled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delayMs={220}>
        <section
          id="start"
          className="texture-noise mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#272b25] bg-[#0f100e] text-cream shadow-[0_28px_95px_-60px_rgba(0,0,0,0.85)]"
        >
          <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">Start here</p>
              <h2 className="font-serif mt-4 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-cream sm:text-5xl">
                Begin with the course that speaks to your next step.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-8 text-cream/70">
                Whether the need is healing, family restoration, or leadership, the platform offers a path that helps
                people move forward with clarity and conviction.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-cream px-6 text-sm font-semibold text-forest transition hover:bg-mist"
                >
                  Create your account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a
                  href="#mission"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 px-6 text-sm font-semibold text-cream transition hover:border-white/25 hover:bg-white/6"
                >
                  Revisit the mission
                </a>
              </div>
            </div>

            <div className="relative min-h-[22rem] border-t border-white/10 lg:border-l lg:border-t-0">
              <Image
                src="/assets/images/login-bg.png"
                alt="Transcendent landscape"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[#11110e]/22" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="rounded-[1.5rem] border border-white/12 bg-[#0e0f0d]/82 p-5 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cream/60">Final invitation</p>
                  <p className="mt-3 max-w-md text-lg leading-8 text-cream/88">
                    Start with one course, one chapter, and one action. That is enough to begin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      <footer className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-[2rem] border border-[#d8cfbf] bg-[#f5efe5] px-6 py-8 text-text shadow-[0_18px_60px_-40px_rgba(31,42,36,0.35)] sm:px-8 lg:px-10 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.7fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">My Mentor</p>
            <p className="font-serif max-w-md text-3xl font-semibold tracking-[-0.04em] text-forest">
              Guidance, structure, and daily action that keep people moving forward.
            </p>
            <p className="max-w-lg text-sm leading-7 text-muted">
              Built to feel calm, grounded, and useful. The goal is simple: one clear path, one honest step at a time.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Explore</p>
            <div className="mt-4 flex flex-col gap-3 text-sm font-medium">
              <a href="#mission" className="text-text transition hover:text-forest">
                Mission
              </a>
              <a href="#books" className="text-text transition hover:text-forest">
                Books
              </a>
              <a href="#owner" className="text-text transition hover:text-forest">
                Creator
              </a>
              <a href="#start" className="text-text transition hover:text-forest">
                Start
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Get started</p>
            <div className="mt-4 flex flex-col gap-3 text-sm font-medium">
              <a href="/register" className="text-text transition hover:text-forest">
                Create account
              </a>
              <a href="/login" className="text-text transition hover:text-forest">
                Sign in
              </a>
              <a href="/admin-login" className="text-text transition hover:text-forest">
                Admin login
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[#d8cfbf] pt-5 text-xs uppercase tracking-[0.22em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>My Mentor</span>
          <span>Walk with purpose. Build with clarity.</span>
        </div>
      </footer>
    </div>
  );
}
