import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MOOD_OPTIONS, type MoodValue } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function JournalEntryPage({ params }: { params: Promise<{ entryId: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { entryId } = await params;
  const { data: entry } = await supabase.from("journal_entries").select("id,title,body,mood,created_at").eq("id", entryId).eq("user_id", user.id).maybeSingle();
  if (!entry) notFound();

  const mood = MOOD_OPTIONS.find((option) => option.value === entry.mood as MoodValue);
  const date = new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(entry.created_at));

  return <article className="mx-auto w-full max-w-3xl pb-10"><Link href="/journal" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline"><ArrowLeft className="h-4 w-4" />Back to journal</Link><header className="mt-8 border-b border-mist pb-7"><p className="text-sm text-muted">{date}{mood ? ` · ${mood.emoji} ${mood.label}` : ""}</p><h1 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.04em] text-forest sm:text-5xl">{entry.title || "Journal entry"}</h1></header><div className="mt-8 whitespace-pre-wrap text-base leading-8 text-text">{entry.body}</div></article>;
}
