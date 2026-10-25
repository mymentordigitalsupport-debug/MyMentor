import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "New journal entry" };

export default async function NewJournalEntryPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <div className="mx-auto w-full max-w-2xl pb-10"><Link href="/journal" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline"><ArrowLeft className="h-4 w-4" />Back to journal</Link><header className="mt-8 border-b border-mist pb-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">New reflection</p><h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-forest">Write an entry</h1></header><div className="mt-7 rounded-[28px] border border-mist bg-cream p-5 shadow-[0_18px_50px_-38px_rgba(31,42,36,0.38)] sm:p-7"><JournalEditor userId={user.id} /></div></div>;
}
