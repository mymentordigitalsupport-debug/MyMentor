import Link from "next/link";
import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { BookOpenText, PenLine } from "lucide-react";
import { JournalEntryCard } from "@/components/journal/JournalEntryCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JournalEntry } from "@/types";
import { BotanicalSprig, CommunityTexture, PaperPin, PaperSurface } from "@/components/threads/ThreadPaper";
import styles from "@/components/threads/ThreadsCommunity.module.css";

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

  const textureId = "journal-board";
  return <div className={styles.community} style={{ "--community-grain": `url(#${textureId}-grain)`, "--community-fibres": `url(#${textureId}-fibres)` } as CSSProperties}>
    <CommunityTexture id={textureId} />
    <div className={styles.boardLayout}>
      <aside className={styles.leftRail}>
        <section className={styles.invitation}><PaperSurface seed={11} warm /><PaperPin className={styles.invitationPin} /><div className={styles.invitationContent}><span className={styles.newThread}>Your private space</span><h2>Make room<br />for your story.</h2><p>Keep the thoughts, reflections, and small wins worth returning to.</p><Link href="/journal/new" className={styles.greenButton}><PenLine size={16} /><span>Write a reflection</span></Link></div><BotanicalSprig className={styles.invitationLeaves} /></section>
        <section className={styles.kindness}><PaperSurface seed={18} /><PaperPin className={styles.kindnessPin} /><div className={styles.kindnessContent}><h2><BookOpenText size={23} />Just for you</h2><p>Your journal is private. Begin with a feeling, a lesson, or one honest sentence.</p></div></section>
      </aside>
      <section className={styles.mainColumn}>
        <header className={styles.composer}><PaperSurface seed={24} /><div className={styles.composerContent}><p className={styles.dialogEyebrow}>Personal journal</p><h1 className="m-0 font-serif text-[clamp(34px,4vw,52px)] font-semibold leading-none tracking-[-.05em]">Your journal</h1><p className="mt-4 max-w-2xl text-[16px] leading-7 text-[#74796d]">A gentle record of where you have been and where you are going.</p><Link href="/journal/new" className={`${styles.greenButton} mt-5`}><PenLine size={16} />New entry</Link></div></header>
        {journalEntries.length ? <section className={`${styles.feed} mt-8`} aria-label="Journal entries">{journalEntries.map((entry) => <JournalEntryCard key={entry.id} entry={entry} />)}</section> : <section className={`${styles.emptyState} mt-8`}><PaperSurface seed={32} warm /><div><BookOpenText size={36} /><h3>Your first page is waiting.</h3><p>Write freely, or save a reflection while working through a lesson.</p><Link href="/journal/new" className={styles.greenButton}>Write an entry</Link></div></section>}
      </section>
    </div>
  </div>;
}
