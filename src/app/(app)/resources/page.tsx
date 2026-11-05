import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { BookOpen, Compass, HeartHandshake, Headphones, ArrowUpRight } from "lucide-react";
import { BotanicalSprig, CommunityTexture, PaperPin, PaperSurface } from "@/components/threads/ThreadPaper";
import styles from "@/components/threads/ThreadsCommunity.module.css";
import { getMemberResources } from "@/lib/resource-library";

export const metadata: Metadata = { title: "Resources" };
export const dynamic = "force-dynamic";

const iconForCategory = {
  worksheet: BookOpen,
  audio: Headphones,
  video: HeartHandshake,
  reading: BookOpen,
  support: HeartHandshake,
};

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
          <section className={`${styles.feed} mt-8`} aria-label="Member resources">
            {resources.map((resource, index) => {
              const Icon = iconForCategory[resource.category] ?? BookOpen;
              return <article key={resource.id} className={styles.conversation} data-decoration={index % 3}><PaperSurface seed={60 + index} warm={index === 1} /><PaperPin className={index % 2 ? styles.conversationPinRight : styles.conversationPinLeft} /><div className={styles.conversationContent}><div className={styles.conversationMeta}><span className={styles.topicBadge}>{resource.category}</span></div><h3><Icon className="mr-3 inline-block h-5 w-5 text-[#637d50]" />{resource.title}</h3>{resource.description ? <p className={styles.conversationBody}>{resource.description}</p> : null}{resource.url ? <a href={resource.url} target="_blank" rel="noopener noreferrer" className={`${styles.greenButton} mt-5`}>Open resource <ArrowUpRight size={16} /></a> : null}</div></article>;
            })}
            {!resources.length ? <article className={styles.conversation}><PaperSurface seed={60} warm /><div className={styles.conversationContent}><h3>Your resources are being prepared.</h3><p className={styles.conversationBody}>Please check back shortly.</p></div></article> : null}
          </section>
        </section>
      </div>
    </div>
  );
}
