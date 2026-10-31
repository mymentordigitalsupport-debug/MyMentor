import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenText, PenLine } from "lucide-react";
import { JournalEntryCard } from "@/components/journal/JournalEntryCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JournalEntry } from "@/types";

export const metadata = { title: "Journal" };

export default async function JournalPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("id,user_id,lesson_id,title,body,mood,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const journalEntries = (entries ?? []).map((entry) => ({ ...entry, prompt_id: null })) as JournalEntry[];

  return <div className="mx-auto w-full max-w-6xl pb-10"><header className="flex flex-col gap-5 border-b border-mist pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Private space</p><h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-forest sm:text-5xl">Your journal</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Keep the thoughts, reflections, and small wins worth returning to.</p></div><Link href="/journal/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-cream transition hover:bg-[#435d4d]"><PenLine className="h-4 w-4" />New entry</Link></header>{journalEntries.length ? <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Journal entries">{journalEntries.map((entry) => <JournalEntryCard key={entry.id} entry={entry} />)}</section> : <section className="mt-8 rounded-[28px] border border-dashed border-sage/35 bg-cream px-6 py-14 text-center"><BookOpenText className="mx-auto h-9 w-9 text-sage" /><h2 className="mt-4 font-serif text-2xl font-semibold text-forest">Your first page is waiting.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Write freely, or save a reflection while working through a lesson.</p><Link href="/journal/new" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-5 text-sm font-semibold text-cream transition hover:bg-[#435d4d]">Write an entry</Link></section>}</div>;
}
