import { BookOpenText, CheckCheck, Heart, Lightbulb, Users, type LucideIcon } from "lucide-react";
import type { OverviewData } from "@/lib/admin/overview";

const icons: LucideIcon[] = [Users, BookOpenText, CheckCheck, Heart, Lightbulb];
const colors = ["#63855b", "#b5792f", "#63855b", "#c46651", "#b5792f"];

export function OverviewStatsSection({ stats }: { stats: OverviewData["stats"] }) {
  return <section aria-label="Platform totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
    {stats.map((stat, index) => {
      const Icon = icons[index];
      return <article key={stat.title} className="flex min-h-44 flex-col rounded-[26px] border border-[#e6e0d6] bg-white p-5 shadow-[0_10px_24px_rgba(16,24,40,0.04)]">
        <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f0f2e9]" style={{ color: colors[index] }}><Icon className="h-5 w-5" /></span><h2 className="pt-1 text-sm font-semibold leading-5 text-[#25352b]">{stat.title}</h2></div>
        <p className="mt-4 text-4xl leading-none tracking-tight text-[#182820]">{stat.value.toLocaleString()}</p>
        <p className="mt-auto pt-3 text-xs font-medium leading-5 text-[#536653]">{stat.recent.toLocaleString()} {stat.recentLabel}</p>
      </article>;
    })}
  </section>;
}
