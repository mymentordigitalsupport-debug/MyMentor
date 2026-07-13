import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";
import { SectionReveal } from "@/components/landing/SectionReveal";
import { CoursePreviewShowcase } from "@/components/landing/CoursePreviewShowcase";

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

const buttonStyles = {
  light:
    "inline-flex min-h-11 items-center justify-center rounded-full border border-[#c7d6c1] bg-[#fffdf8] px-6 text-sm font-semibold text-forest shadow-[0_12px_30px_-18px_rgba(31,42,36,0.18)] transition hover:border-forest hover:bg-white",
  dark:
    "inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-6 text-sm font-semibold text-[#fffdf8] shadow-[0_12px_30px_-18px_rgba(50,69,59,0.75)] transition hover:bg-[#223128]",
} as const;

export function LandingSections() {
  return (
    <div className="relative space-y-8 bg-cream px-4 pb-16 pt-0 sm:px-6 lg:px-8 lg:pb-28">
      <SectionReveal>
        <section
          id="mission"
          className="texture-noise mx-auto -mt-14 max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#cbc1b2] bg-[#f4efe6] shadow-[0_24px_90px_-55px_rgba(31,42,36,0.55)]"
        >
          <div className="grid lg:grid-cols-2">
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
                  className={buttonStyles.light}
                >
                  Sign up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a
                  href="#books"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#c7d6c1] bg-[#fffdf8] px-6 text-sm font-semibold text-forest transition hover:border-forest hover:bg-white"
                >
                  Explore the books
                </a>
              </div>
            </div>

            <div className="relative min-h-[28rem] overflow-hidden border-t border-[#d8cfbf] bg-[#e6dfd1] lg:min-h-full lg:border-l lg:border-t-0">
              <Image
                src="/assets/images/s1L.jpg"
                alt="My Mentor transformation poster"
                fill
                className="object-cover object-center"
                style={{ objectPosition: "center center" }}
                priority
              />
              <div className="absolute inset-0 bg-[#11110e]/12" />
              <div className="absolute left-4 top-4 max-w-[14rem] rounded-full border border-white/20 bg-[#11110e]/80 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cream backdrop-blur-sm">
                Guided change
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delayMs={100}>
        <section
          id="books"
          className="texture-noise mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#cbc1b2] bg-[linear-gradient(180deg,#f4efe6_0%,#fbf8f1_100%)] text-text shadow-[0_24px_90px_-55px_rgba(31,42,36,0.3)]"
        >
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">The books</p>
                <h2 className="font-serif mt-3 text-4xl font-semibold tracking-[-0.05em] text-text sm:text-5xl">
                  Three books. Three pathways. One platform.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-muted">
                Each book becomes a course with its own arc, its own lessons, and its own way of helping people move
                forward with clarity.
              </p>
            </div>

            <CoursePreviewShowcase />
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delayMs={180}>
        <section
          id="owner"
          className="texture-noise mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#cbc1b2] bg-[linear-gradient(180deg,#f4efe6_0%,#fbf8f1_100%)] text-text shadow-[0_24px_90px_-55px_rgba(31,42,36,0.3)]"
        >
          <div className="grid lg:grid-cols-[1fr_0.98fr]">
            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="max-w-2xl space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">The man behind the mission</p>
                <h2 className="font-serif text-5xl font-semibold tracking-[-0.06em] text-forest sm:text-6xl lg:text-7xl">
                  Craig
                </h2>
                <p className="max-w-xl text-base leading-8 text-muted">
                  Craig built My Mentor on the belief that people heal when truth is clear, structure is steady, and
                  support is honest. The platform is the expression of that conviction.
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: ShieldCheck, title: "Trust", text: "Clear direction and dependable design." },
                    { icon: HeartHandshake, title: "Care", text: "A tone that respects the person." },
                    { icon: Users2, title: "Service", text: "Built to help others move forward." },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[1.5rem] border border-mist bg-[#fbf8f1] p-4 shadow-[0_14px_40px_-35px_rgba(31,42,36,0.28)]">
                      <item.icon className="h-5 w-5 text-sage" />
                      <p className="mt-3 text-sm font-semibold text-forest">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#d8cfbf] bg-[#efe8db] lg:border-l lg:border-t-0">
              <div className="grid h-full gap-4 p-6 sm:p-8 lg:p-10">
                <div className="overflow-hidden rounded-[2rem] border border-[#d8cfbf] bg-[#fffaf3] shadow-[0_20px_70px_-45px_rgba(31,42,36,0.22)]">
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
                        <blockquote className="mt-4 max-w-md text-2xl leading-[1.35] tracking-[-0.03em] text-forest">
                          “I wrote these courses to help people walk out of survival and into purpose.”
                        </blockquote>
                      </div>
                      <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#d8cfbf] pt-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Craig</p>
                          <p className="mt-1 text-sm leading-6 text-muted">Owner and builder of My Mentor</p>
                        </div>
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-mist bg-cream text-sage">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
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
          className="texture-noise mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#cbc1b2] bg-[linear-gradient(180deg,#f4efe6_0%,#fbf8f1_100%)] text-text shadow-[0_24px_90px_-55px_rgba(31,42,36,0.3)]"
        >
          <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">Start here</p>
              <h2 className="font-serif mt-4 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-forest sm:text-5xl">
                Begin with the course that speaks to your next step.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-8 text-muted">
                Whether the need is healing, family restoration, or leadership, the platform offers a path that helps
                people move forward with clarity and conviction.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className={`${buttonStyles.dark} !text-[#fffdf8]`}
                >
                  Sign up
                  <ArrowRight className="ml-2 h-4 w-4 text-inherit" />
                </Link>
                <a
                  href="#mission"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#c7d6c1] bg-[#fffdf8] px-6 text-sm font-semibold text-forest transition hover:border-forest hover:bg-white"
                >
                  Revisit the mission
                </a>
              </div>
            </div>

            <div className="relative min-h-[22rem] border-t border-[#d8cfbf] bg-[#e6dfd1] lg:border-l lg:border-t-0">
              <Image
                src="/assets/images/s1r.jpg"
                alt="Transcendent landscape"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[#32453b]/14" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="rounded-[1.5rem] border border-[#d8cfbf] bg-[rgba(251,249,245,0.88)] p-5 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Final invitation</p>
                  <p className="mt-3 max-w-md text-lg leading-8 text-forest">
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
                Sign up
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
