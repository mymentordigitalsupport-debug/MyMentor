import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import type { OverviewData } from "@/lib/admin/overview";

const moodColors = ["#6f9274", "#c8a459", "#d78470", "#8f9d77", "#9a7b75"];

export function OverviewInsightsSection({ courses, moods, moodTotal }: Pick<OverviewData, "courses" | "moods" | "moodTotal">) {
  return <section className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
    <article className="rounded-[28px] border border-[#e6e0d6] bg-white px-5 py-6 shadow-[0_10px_24px_rgba(16,24,40,0.04)] sm:px-6">
      <div className="flex items-center gap-3"><h2 className="text-lg font-semibold text-[#25352b]">Course Health</h2><Info className="h-4 w-4 text-[#718073]" aria-label="Based on enrolled members and completed lessons" /></div>
      <p className="mt-1 text-xs text-[#536653]">Progress from actual member enrollments and completed lessons</p>
      {courses.length ? <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[470px] text-left text-xs"><thead className="border-b border-[#e6e0d6] text-[#4d5d51]"><tr><th className="pb-3 font-semibold">Course</th><th className="pb-3 font-semibold">Members</th><th className="pb-3 font-semibold">Avg progress</th><th className="pb-3 font-semibold">Completed</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id} className="border-b border-[#f0ebe3] last:border-0"><td className="py-4 pr-3 font-semibold text-[#263a2c]">{course.title}</td><td className="py-4 text-[#263a2c]">{course.participants}</td><td className="py-4"><span className="font-semibold text-[#263a2c]">{course.avgProgress}%</span><div className="mt-2 h-1.5 w-20 rounded-full bg-[#ebe7de]"><div className="h-full rounded-full bg-[#688863]" style={{ width: `${course.avgProgress}%` }} /></div></td><td className="py-4 font-semibold text-[#263a2c]">{course.completionRate}%</td></tr>)}</tbody></table></div> : <p className="mt-8 rounded-xl bg-[#f7f4ee] p-5 text-sm text-[#536653]">No published courses yet.</p>}
      <Link href="/admin/courses" className="mt-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-[#2d5035] hover:underline">View all courses <ArrowRight className="h-4 w-4" /></Link>
    </article>
    <article className="rounded-[28px] border border-[#e6e0d6] bg-white px-5 py-6 shadow-[0_10px_24px_rgba(16,24,40,0.04)] sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-[#25352b]">Emotional Pulse</h2><p className="mt-1 text-xs text-[#536653]">Mood check-ins from the last 7 days</p></div><span className="rounded-full border border-[#dfd8cc] px-3 py-2 text-xs font-semibold text-[#354b3a]">{moodTotal} check-ins</span></div>
      {moods.length ? <div className="mt-8 space-y-5">{moods.map((mood, index) => { const percent = Math.round(mood.count / moodTotal * 100); return <div key={mood.label} className="grid grid-cols-[minmax(6rem,1fr)_3fr_auto] items-center gap-4 text-xs"><span className="truncate font-semibold capitalize text-[#263a2c]">{mood.label}</span><div className="h-3 rounded-full bg-[#f1eee7]"><div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: moodColors[index % moodColors.length] }} /></div><span className="min-w-16 text-right font-semibold text-[#354b3a]">{mood.count} · {percent}%</span></div>; })}</div> : <div className="mt-8 flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-[#d9d2c6] bg-[#faf8f4] p-6 text-center text-sm text-[#536653]">No mood check-ins recorded in the last 7 days.</div>}
    </article>
  </section>;
}
