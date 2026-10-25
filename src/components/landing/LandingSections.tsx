"use client";

import { CountdownSection } from "@/components/about/components/CountdownSection";
import { ArticlePreviewSection } from "@/components/articles/ArticlePreviewSection";
import { MyMentorInvitationWall } from "@/components/landing/MyMentorInvitationWall";
import { SectionReveal } from "@/components/landing/SectionReveal";
import PigmentExperienceLedger from "@/components/ui/pigment-experience-ledger";
import TimelineBlock01 from "@/components/ui/timeline-01";

export function LandingSections() {
  return (
    <>
      <div className="relative space-y-0 bg-cream pb-16 pt-0 lg:pb-28">
        <SectionReveal>
          <TimelineBlock01 />
        </SectionReveal>

        <SectionReveal delayMs={180}>
          <ArticlePreviewSection />
        </SectionReveal>

        <SectionReveal delayMs={200}>
          <PigmentExperienceLedger
            colors={["var(--forest)", "var(--sage)", "var(--gold)"]}
          />
        </SectionReveal>

        <SectionReveal delayMs={220}>
          <MyMentorInvitationWall />
        </SectionReveal>
      </div>
      <CountdownSection />
    </>
  );
}
