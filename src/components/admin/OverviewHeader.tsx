import { CalendarDays } from "lucide-react";

export function OverviewHeader() {
  return <section className="flex flex-wrap items-start justify-between gap-5 px-1 py-1">
    <div><h1 className="text-4xl font-semibold tracking-tight text-[#182820] sm:text-5xl">Overview</h1><p className="mt-2 text-sm text-[#48584d]">Live activity across My Mentor</p></div>
    <div className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d9d3c9] bg-white px-4 text-sm font-semibold text-[#25392c]"><CalendarDays className="h-4 w-4" />Updated when you open this page</div>
  </section>;
}
