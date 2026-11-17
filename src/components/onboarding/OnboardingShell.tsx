"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Heart, Leaf, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ANONYMOUS_NAMES, MOOD_OPTIONS, type GuidancePath, type MoodValue } from "@/types";
import { randomAnonymousName } from "@/lib/utils";
import { COURSE_LIBRARY, normalizeCourseKey } from "@/lib/course-library";
import { BotanicalSprig } from "@/components/threads/ThreadPaper";
import styles from "./OnboardingShell.module.css";

export type OnboardingJourney = {
  courseId: string;
  versionId: string;
  title: string;
  guidancePath: GuidancePath;
  accessLevel: "chapter_1" | "full_course";
};

export type OnboardingProfile = {
  displayName: string;
  anonymousName: string | null;
  isAnonymous: boolean;
  goal: string;
  mood: MoodValue | null;
};

type Props = { journey: OnboardingJourney; profile: OnboardingProfile };
const STEPS = ["Welcome", "Guidance", "Your name", "Your intention", "Check in"] as const;
const GOALS = ["Take one healthy step each day", "Understand myself better", "Rebuild trust with my family", "Find freedom from dependency"];
const MOOD_IMAGES: Record<MoodValue, string> = {
  low: "/assets/images/low.png",
  heavy: "/assets/images/heavy.png",
  uncertain: "/assets/images/uncertain.png",
  hopeful: "/assets/images/hopeful.png",
  steady: "/assets/images/steady.png",
  strong: "/assets/images/strong.png",
};

export function OnboardingShell({ journey, profile }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(profile.isAnonymous);
  const [displayName, setDisplayName] = useState(profile.isAnonymous ? profile.anonymousName ?? profile.displayName : profile.displayName);
  const [guidancePath, setGuidancePath] = useState<GuidancePath>(journey.guidancePath);
  const [goal, setGoal] = useState(profile.goal);
  const [mood, setMood] = useState<MoodValue | null>(profile.mood);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const nickname = useRef(profile.anonymousName || randomAnonymousName(ANONYMOUS_NAMES));
  const heading = useRef<HTMLHeadingElement>(null);
  const cover = COURSE_LIBRARY.find((item) => normalizeCourseKey(journey.title).startsWith(normalizeCourseKey(item.title)))?.image;

  function moveTo(next: number) {
    setError("");
    setStep(next);
  }

  async function continueWithGuidance() {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/account/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guidancePath }),
      });
      const body = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(body?.error ?? "Unable to save your guidance choice.");
      moveTo(2);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save your guidance choice.");
    } finally {
      setSaving(false);
    }
  }

  async function finish() {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.replace("/login?next=/onboarding");
        return;
      }
      const name = isAnonymous ? nickname.current : displayName.trim();
      if (!name) { setSaving(false); moveTo(1); return; }

      const { error: profileError } = await supabase.from("profiles").update({
        display_name: name,
        anonymous_name: isAnonymous ? name : null,
        is_anonymous: isAnonymous,
        display_name_mode: isAnonymous ? "nickname" : "real_name",
        preferred_guidance_path: guidancePath,
        selected_course_id: journey.courseId,
        personal_goal: goal.trim() || null,
        mood_baseline: mood,
        onboarding_completed: true,
      }).eq("user_id", user.id).select("user_id").single();
      if (profileError) throw profileError;

      if (mood) {
        const { error: moodError } = await supabase.from("mood_checkins").insert({
          user_id: user.id,
          mood,
          mood_label: mood,
          note: "Initial daily check-in",
        });
        if (moodError) throw moodError;
      }
      router.replace("/today");
      router.refresh();
    } catch {
      setError("We couldn’t save your details. Please try again.");
      setSaving(false);
    }
  }

  const accessLabel = journey.accessLevel === "full_course" ? "Full course access" : "Chapter 1 access";
  const guidanceLabel = guidancePath === "christian" ? "Christian guidance" : "Religious guidance";

  return <main className={styles.root}>
    <div className={styles.grain} aria-hidden="true" />
    <header className={styles.header}>
      <div className={styles.brand}><span className={styles.brandIcon}><Leaf size={22} strokeWidth={1.7} /></span><span>MyMentor</span></div>
      <span className={styles.headerAside}>A little guidance. Your own pace.</span>
    </header>

    <div className={styles.layout}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}><span /> YOUR STARTING POINT <span /></p>
        <h1>Every journey<br />begins with <em>one step.</em></h1>
        <p className={styles.introText}>Your place to reflect, learn, and move forward is ready. Let’s make it feel like yours.</p>
        <div className={styles.scribble} aria-hidden="true">Your story.<br />Your pace.<br />Your next step.<svg viewBox="0 0 160 30"><path d="M3 21c32-12 97-21 151-7" /></svg></div>
        <BotanicalSprig className={styles.sprig} />
      </div>

      <section className={styles.paper} aria-label="Set up your journey">
        <span className={styles.tape} aria-hidden="true" />
        <div className={styles.paperInner}>
          <div className={styles.progressTop}><span>GETTING STARTED</span><span>{String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}</span></div>
          <nav className={styles.progress} aria-label="Onboarding progress">{STEPS.map((label, index) => <div key={label} className={styles.progressItem} data-current={index === step} data-complete={index < step}>
            <span className={styles.progressDot}>{index < step ? <Check size={13} strokeWidth={2.8} /> : index + 1}</span><span>{label}</span>
          </div>)}</nav>

          <AnimatePresence mode="wait" initial={false}><motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} onAnimationComplete={() => heading.current?.focus()} className={styles.step}>
            {step === 0 && <>
              <div className={styles.stepIcon}><Sparkles size={25} strokeWidth={1.6} /></div>
              <p className={styles.kicker}>A warm welcome</p>
              <h2 ref={heading} tabIndex={-1}>You belong here.</h2>
              <p className={styles.description}>No pressure to have it all figured out. We’ll start with a few small details, then you can begin learning at your own pace.</p>
              <div className={styles.journeyCard}>
                {cover && <Image src={cover} width={71} height={96} alt="" className={styles.bookCover} />}
                <div><span>YOUR APPROVED JOURNEY</span><strong>{journey.title}</strong><small>{guidanceLabel} · {accessLabel}</small></div>
                <Check className={styles.journeyCheck} size={18} aria-hidden="true" />
              </div>
              <p className={styles.privacyNote}><ShieldCheck size={17} /> Your reflections stay yours.</p>
            </>}

            {step === 1 && <>
              <div className={styles.stepIcon}><Sparkles size={25} strokeWidth={1.6} /></div>
              <p className={styles.kicker}>Choose your path</p>
              <h2 ref={heading} tabIndex={-1}>What kind of guidance feels right?</h2>
              <p className={styles.description}>Both paths cover the same journey. Choose the voice and support that feels most natural to you.</p>
              <div className={styles.guidanceChoices} role="radiogroup" aria-label="Guidance path">
                <button type="button" role="radio" aria-checked={guidancePath === "religious"} onClick={() => setGuidancePath("religious")}>
                  <Leaf size={24} aria-hidden="true" /><span><strong>Religious guidance</strong><small>Spiritual reflection, purpose, and identity growth.</small></span>
                </button>
                <button type="button" role="radio" aria-checked={guidancePath === "christian"} onClick={() => setGuidancePath("christian")}>
                  <Heart size={24} aria-hidden="true" /><span><strong>Christian guidance</strong><small>Scripture, prayer, and faith-based encouragement.</small></span>
                </button>
              </div>
              <p className={styles.privacyNote}><ShieldCheck size={17} /> You can change this later in settings.</p>
            </>}

            {step === 2 && <>
              <div className={styles.stepIcon}><Heart size={25} strokeWidth={1.6} /></div>
              <p className={styles.kicker}>Make it yours</p>
              <h2 ref={heading} tabIndex={-1}>What should we call you?</h2>
              <p className={styles.description}>Choose the name that feels right. You can change it later in settings.</p>
              <div className={styles.identityChoices} role="group" aria-label="Name preference">
                <button type="button" className={styles.choiceTab} aria-pressed={!isAnonymous} onClick={() => setIsAnonymous(false)}>Use my name</button>
                <button type="button" className={styles.choiceTab} aria-pressed={isAnonymous} onClick={() => setIsAnonymous(true)}>Use a nickname</button>
              </div>
              {isAnonymous ? <div className={styles.nickname}><span>YOUR PRIVATE NICKNAME</span><strong>{nickname.current}</strong><p>Use this name around MyMentor.</p></div> : <label className={styles.field}><span>Your name</span><input autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} placeholder="The name you’d like us to use" /></label>}
              <p className={styles.privacyNote}><LockKeyhole size={17} /> Your name is never shown in your course progress.</p>
            </>}

            {step === 3 && <>
              <div className={styles.stepIcon}><Leaf size={25} strokeWidth={1.6} /></div>
              <p className={styles.kicker}>A personal intention</p>
              <h2 ref={heading} tabIndex={-1}>What brings you here?</h2>
              <p className={styles.description}>A few words can help you remember why you started. Only you can see this.</p>
              <div className={styles.suggestions}>{GOALS.map((item) => <button key={item} type="button" aria-pressed={goal === item} onClick={() => setGoal(item)}>{item}</button>)}</div>
              <label className={styles.field}><span>Or write your own</span><textarea rows={3} maxLength={500} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="I want to..." /></label>
              <p className={styles.skipHint}>You can leave this blank for now.</p>
            </>}

            {step === 4 && <>
              <div className={styles.stepIcon}><Heart size={25} strokeWidth={1.6} /></div>
              <p className={styles.kicker}>Just for today</p>
              <h2 ref={heading} tabIndex={-1}>How are you feeling?</h2>
              <p className={styles.description}>There’s no right answer. This is a private check-in you can skip.</p>
              <div className={styles.moods} role="group" aria-label="How you feel today">{MOOD_OPTIONS.map((item) => <button key={item.value} type="button" aria-pressed={mood === item.value} onClick={() => setMood(mood === item.value ? null : item.value)}>
                <Image src={MOOD_IMAGES[item.value]} alt="" width={68} height={68} className={styles.moodImage} aria-hidden="true" />
                {item.label}
              </button>)}</div>
              <div className={styles.finalNote}><Sparkles size={20} /><p>One step at a time is enough. Your course is ready whenever you are.</p></div>
            </>}
          </motion.div></AnimatePresence>

          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.actions}>
            {step > 0 && <button type="button" className={styles.back} onClick={() => moveTo(step - 1)} disabled={saving}><ArrowLeft size={17} />Back</button>}
            <button type="button" className={styles.next} onClick={step === STEPS.length - 1 ? () => void finish() : step === 1 ? () => void continueWithGuidance() : () => moveTo(step + 1)} disabled={saving || (step === 2 && !isAnonymous && !displayName.trim())}>
              {saving ? "Saving…" : step === STEPS.length - 1 ? "Enter my journey" : step === 0 ? "Let’s begin" : "Continue"}<ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
    <div className={styles.bottomTear} aria-hidden="true" />
  </main>;
}
