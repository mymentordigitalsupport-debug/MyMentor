import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Layers3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

const chapters = [
  "The Stage of Creation",
  "The Tree of Knowledge of Good and Evil",
  "The Concept of Abuse",
  "The Real Reason People Do Drugs",
  "The Three Stages of Drug Abuse",
  "The Mind Battlefield",
  "Love",
];

export function CoursePreviewShowcase() {
  return (
    <div className="mt-10 overflow-hidden rounded-[2rem] border border-[#d7cebf] bg-[linear-gradient(135deg,rgba(237,241,238,0.96),rgba(251,249,245,0.98)_52%,rgba(246,243,237,0.98))] shadow-[0_24px_70px_-48px_rgba(31,42,36,0.28)]">
      <div className="grid lg:grid-cols-[0.76fr_1.24fr]">
        <div className="relative flex min-h-[31rem] items-center justify-center overflow-hidden border-b border-[#d7cebf] bg-[#dce6dc] p-10 lg:border-b-0 lg:border-r">
          <div className="absolute -left-16 top-12 h-56 w-56 rounded-full bg-sage/20 blur-3xl" />
          <div className="absolute -right-16 bottom-8 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative w-[15.5rem] max-w-full">
            <Image
              src="/assets/images/books/Uprooting drug abuse.png"
              alt="Uprooting Drug Abuse book cover"
              width={620}
              height={930}
              className="h-auto w-full object-contain drop-shadow-[0_24px_22px_rgba(31,42,36,0.32)]"
            />
          </div>
          <span className="absolute left-6 top-6 rounded-full border border-forest/15 bg-[#fffdf8]/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest backdrop-blur-sm">
            Available now
          </span>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-sage/30 bg-sage/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest">
              The complete recovery course
            </span>
            <span className="text-xs font-medium text-muted">By Craig Petersen</span>
          </div>

          <h3 className="font-serif mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.05em] text-forest sm:text-5xl">
            Uprooting Drug Abuse
          </h3>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
            A structured journey for understanding the roots of addiction, facing destructive patterns honestly,
            renewing the mind, and building a life shaped by healing, purpose, and lasting freedom.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.35rem] border border-mist bg-[#fffdf9] p-4">
              <Layers3 className="h-4 w-4 text-sage" />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Chapters</p>
              <p className="mt-1 text-2xl font-semibold text-forest">11</p>
            </div>
            <div className="rounded-[1.35rem] border border-mist bg-[#fffdf9] p-4">
              <BookOpen className="h-4 w-4 text-sage" />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Lessons</p>
              <p className="mt-1 text-2xl font-semibold text-forest">87</p>
            </div>
            <div className="rounded-[1.35rem] border border-mist bg-[#fffdf9] p-4">
              <Clock3 className="h-4 w-4 text-sage" />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Pace</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-forest">Learn at your pace</p>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.35rem] border border-gold/30 bg-gold/10 p-4">
              <p className="text-xs font-semibold text-forest">Religious Guidance</p>
              <p className="mt-2 text-sm leading-6 text-muted">Spiritual reflection, purpose, responsibility, and healthy living.</p>
            </div>
            <div className="rounded-[1.35rem] border border-sage/30 bg-sage/10 p-4">
              <p className="text-xs font-semibold text-forest">Christian Guided</p>
              <p className="mt-2 text-sm leading-6 text-muted">A Christ-centered path with Biblical truth, grace, and restoration.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="sm">
              <Link href="/register">
                Begin your journey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Link href="/about#mission" className="inline-flex min-h-10 items-center justify-center rounded-full border border-sage/30 bg-[#fffdf8] px-4 text-sm font-semibold text-forest transition hover:border-sage/50">
              Learn how it works
            </Link>
          </div>

          <div className="mt-8 border-t border-[#d7cebf] pt-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <ShieldCheck className="h-4 w-4 text-sage" />
              What the journey covers
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {chapters.map((chapter) => (
                <span key={chapter} className="rounded-full border border-mist bg-[#fffdf9] px-3 py-1.5 text-xs text-forest">
                  {chapter}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
