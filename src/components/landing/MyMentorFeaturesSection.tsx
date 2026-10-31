"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, Compass, HeartHandshake, Lightbulb, LockKeyhole, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  { title: "A clear path", description: "Move through a complete recovery journey one chapter and lesson at a time.", stat: "87 lessons", icon: Compass },
  { title: "Guidance that fits", description: "Choose Christian Guided or Religious Guidance for the same trusted course structure.", stat: "2 paths", icon: HeartHandshake },
  { title: "Space to reflect", description: "Use prompts, check-ins, and insights to make each lesson personal and practical.", stat: "Your pace", icon: Lightbulb },
  { title: "Private by design", description: "Your progress and reflections stay connected to your own account.", stat: "Your space", icon: LockKeyhole },
] as const;

const principles = [
  { label: "Available today", value: "1 complete journey", icon: BookOpen },
  { label: "Built with care", value: "11 focused chapters", icon: HeartHandshake },
  { label: "Made to continue", value: "One lesson at a time", icon: CheckCircle2 },
  { label: "Guidance options", value: "Christian or Religious", icon: Compass },
] as const;

export function MyMentorFeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);
  const selected = features[activeFeature];

  return (
    <section id="about" className="w-full overflow-hidden bg-[#172d23] px-6 py-16 text-cream sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:gap-16">
        <div className="max-w-3xl space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f5e7c7]"><Sparkles className="h-4 w-4" />A steadier way forward</span>
          <h2 className="font-serif text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-cream sm:text-6xl">More than a course. A place to keep going.</h2>
          <p className="max-w-2xl text-base leading-8 text-[#d8ddd6]">My Mentor turns recovery guidance into a clear, personal rhythm: learn, reflect, take one honest step, and return when you are ready. There is no pressure to have it all figured out.</p>
        </div>

        <div className="grid auto-rows-[250px] gap-4 md:grid-cols-4">
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-[#203b2d] p-6 md:col-span-2 md:row-span-2 sm:p-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#f5e7c7]"><Lightbulb className="h-3.5 w-3.5" />What we make possible</span>
              <h3 className="font-serif mt-5 text-3xl font-semibold tracking-[-0.04em] text-cream">Guidance that becomes part of your life.</h3>
              <p className="mt-2 text-sm leading-6 text-[#c6d0c8]">Choose an area below to see how My Mentor supports the next step.</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = activeFeature === index;
                return <button key={feature.title} type="button" onClick={() => setActiveFeature(index)} className={cn("rounded-2xl border p-4 text-left transition", isActive ? "border-[#d8bd80]/60 bg-[#f5e7c7]/15" : "border-white/10 bg-[#10251b] hover:border-white/25")}><Icon className={cn("h-5 w-5", isActive ? "text-[#f5d88f]" : "text-[#afc1b0]")} /><p className="mt-3 text-sm font-semibold text-cream">{feature.title}</p><p className="mt-1 text-xs text-[#b8c4ba]">{feature.stat}</p></button>;
              })}
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#10251b]/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c7d2c8]">{selected.title}</p>
              <p className="mt-2 text-sm leading-6 text-cream">{selected.description}</p>
              <p className="mt-3 text-2xl font-semibold text-[#f5d88f]">{selected.stat}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#1c3428] p-6">
            <BookOpen className="h-6 w-6 text-[#f5d88f]" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#bfcabe]">The current journey</p>
            <h3 className="font-serif mt-2 text-2xl font-semibold text-cream">Uprooting Drug Abuse</h3>
            <p className="mt-3 text-sm leading-6 text-[#c6d0c8]">A complete guided recovery course, available now.</p>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#284735] p-6">
            <HeartHandshake className="h-6 w-6 text-[#f5d88f]" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#c7d2c8]">A humane approach</p>
            <p className="mt-2 text-lg font-semibold leading-7 text-cream">Progress does not need to be perfect to be real.</p>
          </div>

          <div className="md:col-span-2 rounded-[28px] border border-white/10 bg-[#10251b] p-6 sm:p-7">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"><CheckCircle2 className="h-5 w-5 text-[#f5d88f]" /></span><div><p className="text-sm font-semibold text-cream">The My Mentor rhythm</p><p className="text-xs text-[#b8c4ba]">A simple structure you can return to.</p></div></div>
            <ol className="mt-5 grid gap-3 text-sm sm:grid-cols-3"><li className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><span className="text-xs font-semibold text-[#f5d88f]">01</span><p className="mt-1 font-semibold text-cream">Choose your guidance</p><p className="mt-1 text-xs leading-5 text-[#b8c4ba]">Select the path that speaks to you.</p></li><li className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><span className="text-xs font-semibold text-[#f5d88f]">02</span><p className="mt-1 font-semibold text-cream">Take one lesson</p><p className="mt-1 text-xs leading-5 text-[#b8c4ba]">Learn without trying to rush ahead.</p></li><li className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><span className="text-xs font-semibold text-[#f5d88f]">03</span><p className="mt-1 font-semibold text-cream">Return tomorrow</p><p className="mt-1 text-xs leading-5 text-[#b8c4ba]">Let consistency do its quiet work.</p></li></ol>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle) => { const Icon = principle.icon; return <div key={principle.label} className="rounded-2xl border border-white/10 bg-[#1c3428] p-5 transition hover:border-white/25"><Icon className="h-5 w-5 text-[#f5d88f]" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#b8c4ba]">{principle.label}</p><p className="mt-2 text-lg font-semibold text-cream">{principle.value}</p></div>; })}
        </div>
      </div>
    </section>
  );
}
