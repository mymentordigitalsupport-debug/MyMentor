"use client";

import Timeline from "@/components/ui/timeline-01-utils/timeline";

const timelineData = [
  {
    title: "Begin where you are",
    description: "Choose Uprooting Drug Abuse and the guidance path that helps you take an honest first step.",
    date: "01",
    image: "/assets/images/hero-pathway-recovery.jpg",
  },
  {
    title: "Learn and reflect",
    description: "Move through one lesson at a time, using reflections and check-ins to make the guidance your own.",
    date: "02",
    image: "/assets/images/hero-pathway-healing.jpg",
  },
  {
    title: "Keep coming back",
    description: "Build a steadier rhythm through small, practical actions that support real and lasting change.",
    date: "03",
    image: "/assets/images/hero-pathway-growth.jpg",
  },
];

const TimelineBlock01 = () => {
  return (
    <section className="overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="border-x border-b border-border px-6 py-10 md:px-10 md:py-16 lg:px-16 lg:py-20">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-normal text-foreground">The My Mentor rhythm</div>
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground">A steadier way forward.</h2>
              <p className="md:text-lg text-base text-muted-foreground leading-relaxed">My Mentor gives you a clear, private structure for learning, reflection, and returning to the work at your own pace.</p>
            </div>
          </div>
        </div>
        <div className="md:border-x border-r border-border"><Timeline items={timelineData} /></div>
        <div className="border-x border-t border-border h-18 md:h-28" />
      </div>
    </section>
  );
};

export default TimelineBlock01;
