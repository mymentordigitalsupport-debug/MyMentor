"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Open_Sans, Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

function toInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatLabel(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function OverviewHeader() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(() => new Date(2025, 4, 25));
  const [endDate, setEndDate] = useState(() => new Date(2025, 4, 31));
  const [draftStart, setDraftStart] = useState(() => toInputValue(new Date(2025, 4, 25)));
  const [draftEnd, setDraftEnd] = useState(() => toInputValue(new Date(2025, 4, 31)));

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function applyDates() {
    const nextStart = parseLocalDate(draftStart);
    const nextEnd = parseLocalDate(draftEnd);

    if (!nextStart || !nextEnd || nextStart > nextEnd) {
      return;
    }

    setStartDate(nextStart);
    setEndDate(nextEnd);
    setIsOpen(false);
  }

  return (
    <section className="flex items-start justify-between gap-6 px-1 py-1">
      <div className="space-y-1">
        <h1 className={`${poppins.className} text-[3rem] leading-none text-black`}>
          Overview
        </h1>
        <p className={`${openSans.className} text-[15px] text-black/65`}>
          Analytics summary of your platform
        </p>
      </div>

      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className={`${openSans.className} inline-flex items-center gap-3 rounded-xl border border-black/8 bg-white px-4 py-3 text-sm font-semibold text-black shadow-[0_1px_2px_rgba(0,0,0,0.04)]`}
        >
          <CalendarDays className="h-4 w-4 text-black/70" />
          <span>{formatLabel(startDate, endDate)}</span>
          <ChevronDown className="h-4 w-4 text-black/70" />
        </button>

        {isOpen ? (
          <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-[310px] rounded-2xl border border-black/8 bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
            <div className={`${openSans.className} space-y-3`}>
              <div className="space-y-1">
                <label htmlFor="overview-start" className="text-sm font-semibold text-black">
                  Start date
                </label>
                <input
                  id="overview-start"
                  type="date"
                  value={draftStart}
                  onChange={(event) => setDraftStart(event.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="overview-end" className="text-sm font-semibold text-black">
                  End date
                </label>
                <input
                  id="overview-end"
                  type="date"
                  value={draftEnd}
                  onChange={(event) => setDraftEnd(event.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none"
                />
              </div>

              <button
                type="button"
                onClick={applyDates}
                className="w-full rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white"
              >
                Apply
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
