import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Compass } from "lucide-react";
import { BotanicalSprig, CommunityTexture, PaperPin, PaperSurface } from "@/components/threads/ThreadPaper";
import styles from "@/components/threads/ThreadsCommunity.module.css";
import { getMemberResources } from "@/lib/resource-library";
import { MemberResourceLibrary } from "@/components/resources/MemberResourceLibrary";

export const metadata: Metadata = { title: "Resources" };
export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const textureId = "resources-board";
  const resources = await getMemberResources();

  return (
    <div className={styles.community} style={{ "--community-grain": `url(#${textureId}-grain)`, "--community-fibres": `url(#${textureId}-fibres)` } as CSSProperties}>
      <CommunityTexture id={textureId} />
      <div className={styles.boardLayout}>
        <aside className={styles.leftRail}>
          <section className={styles.invitation}><PaperSurface seed={41} warm /><PaperPin className={styles.invitationPin} /><div className={styles.invitationContent}><span className={styles.newThread}>Your toolkit</span><h2>Keep what<br />helps close.</h2><p>A growing collection of gentle support for your journey.</p></div><BotanicalSprig className={styles.invitationLeaves} /></section>
          <section className={styles.kindness}><PaperSurface seed={48} /><PaperPin className={styles.kindnessPin} /><div className={styles.kindnessContent}><h2><Compass size={23} />Start small</h2><p>You do not need to use everything. Choose what feels useful today.</p></div></section>
        </aside>
        <section className={styles.mainColumn}>
          <header className={styles.composer}><PaperSurface seed={54} /><div className={styles.composerContent}><p className={styles.dialogEyebrow}>Resources</p><h1 className="m-0 font-serif text-[clamp(34px,4vw,52px)] font-semibold leading-none tracking-[-.05em]">Support for your next step.</h1><p className="mt-4 max-w-2xl text-[16px] leading-7 text-[#74796d]">Reading, listening, and practical tools—here when you need them.</p></div></header>
          <MemberResourceLibrary resources={resources} />
        </section>
      </div>
    </div>
  );
}
