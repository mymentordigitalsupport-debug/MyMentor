import Link from "next/link";
import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CommunityTexture, PaperPin, PaperSurface } from "@/components/threads/ThreadPaper";
import styles from "@/components/threads/ThreadsCommunity.module.css";

export const metadata = { title: "New journal entry" };

export default async function NewJournalEntryPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const textureId = "new-journal-board";
  return <div className={styles.community} style={{ "--community-grain": `url(#${textureId}-grain)`, "--community-fibres": `url(#${textureId}-fibres)` } as CSSProperties}><CommunityTexture id={textureId} /><div className={styles.boardLayout}><aside className={styles.leftRail}><section className={styles.kindness}><PaperSurface seed={91} warm /><PaperPin className={styles.kindnessPin} /><div className={styles.kindnessContent}><h2>One honest sentence.</h2><p>There is no right way to begin. Write what is true right now.</p></div></section></aside><section className={`${styles.mainColumn} ${styles.composer}`}><PaperSurface seed={94} /><PaperPin className={styles.conversationPinRight} /><div className={styles.composerContent}><Link href="/journal" className="inline-flex items-center gap-2 text-sm text-[#637d50] hover:underline"><ArrowLeft className="h-4 w-4" />Back to journal</Link><p className={`${styles.dialogEyebrow} mt-8`}>New reflection</p><h1 className="m-0 font-serif text-4xl font-semibold tracking-[-.04em]">Write an entry</h1><div className="mt-7"><JournalEditor userId={user.id} /></div></div></section></div></div>;
}
