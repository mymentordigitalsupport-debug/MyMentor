"use client";

import { useEffect, useRef, useState } from "react";

interface TimelineItem {
  title: string;
  description: string;
  date: string;
  image: string;
}

export default function Timeline({ items }: { items: TimelineItem[] }) {
  const [visible, setVisible] = useState<number[]>([]);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setVisible((current) => current.includes(index) ? current : [...current, index]);
          }
        });
      },
      { threshold: 0.18 },
    );
    itemRefs.current.forEach((item) => item && observer.observe(item));
    return () => observer.disconnect();
  }, [items.length]);

  return (
    <ol className="relative mx-auto max-w-5xl py-10 md:py-16">
      <div aria-hidden="true" className="absolute bottom-0 left-[1.9rem] top-0 w-px bg-border md:left-1/2" />
      {items.map((item, index) => {
        const reverse = index % 2 === 1;
        return (
          <li key={`${item.date}-${item.title}`} ref={(element) => { itemRefs.current[index] = element; }} data-index={index} className={`relative grid gap-6 px-6 py-8 transition-all duration-700 md:grid-cols-2 md:gap-16 md:px-10 lg:px-16 ${visible.includes(index) ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"}`}>
            <span className="absolute left-6 top-12 z-10 flex h-4 w-4 -translate-x-1/2 rounded-full border-4 border-background bg-foreground md:left-1/2" />
            <div className={`pl-8 md:pl-0 ${reverse ? "md:order-2" : ""}`}>
              <p className="text-sm font-medium text-muted-foreground">{item.date}</p>
              <h3 className="mt-2 text-2xl font-medium tracking-tight text-foreground">{item.title}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
            <div className={`overflow-hidden rounded-2xl border border-border bg-muted ${reverse ? "md:order-1" : ""}`}>
              <img src={item.image} alt="" className="h-56 w-full object-cover md:h-64" />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
