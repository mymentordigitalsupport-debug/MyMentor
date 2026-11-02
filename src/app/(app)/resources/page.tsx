import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { BookOpen, Compass, HeartHandshake, Headphones, ArrowRight } from "lucide-react";
import { BotanicalSprig, CommunityTexture, PaperPin, PaperSurface } from "@/components/threads/ThreadPaper";
import styles from "@/components/threads/ThreadsCommunity.module.css";

export const metadata: Metadata = {
  title: "Resources",
};

export default function ResourcesPage() {
  const textureId = "resources-board";
  const resources = [
    { icon: BookOpen, title: "Guided reading", body: "Thoughtful material to support the work you are already doing." },
    { icon: Headphones, title: "Listen and reflect", body: "Short audio practices for moments when reading is not what you need." },
    { icon: HeartHandshake, title: "Support tools", body: "Practical prompts and grounding exercises for your next small step." },
  ];
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
          <section className={`${styles.feed} mt-8`} aria-label="Resource categories">{resources.map(({ icon: Icon, title, body }, index) => <article key={title} className={styles.conversation} data-decoration={index % 3}><PaperSurface seed={60 + index} warm={index === 1} /><PaperPin className={index % 2 ? styles.conversationPinRight : styles.conversationPinLeft} /><div className={styles.conversationContent}><div className={styles.conversationMeta}><span className={styles.topicBadge}>Coming soon</span></div><h3><Icon className="mr-3 inline-block h-5 w-5 text-[#637d50]" />{title}</h3><p className={styles.conversationBody}>{body}</p><button type="button" className={`${styles.greenButton} mt-5`} disabled>Explore soon <ArrowRight size={16} /></button></div></article>)}</section>
        </section>
      </div>
    </div>
  );
}
