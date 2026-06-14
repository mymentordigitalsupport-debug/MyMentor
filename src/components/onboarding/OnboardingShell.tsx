"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type GuidancePath, type MoodValue, ANONYMOUS_NAMES } from "@/types";
import { randomAnonymousName } from "@/lib/utils";

import { StepWelcome } from "./StepWelcome";
import { StepDisplayName } from "./StepDisplayName";
import { StepChooseJourney } from "./StepChooseJourney";
import { StepGuidancePath } from "./StepGuidancePath";
import { StepSetGoal } from "./StepSetGoal";
import { StepMoodBaseline } from "./StepMoodBaseline";

export interface OnboardingData {
  displayName: string;
  isAnonymous: boolean;
  courseVersionId: string;
  guidancePath: GuidancePath;
  goal: string;
  mood: MoodValue | null;
}

const TOTAL_STEPS = 6;

export function OnboardingShell() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    isAnonymous: false,
    courseVersionId: "",
    guidancePath: "religious",
    goal: "",
    mood: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSelection() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("selected_course_id, is_anonymous, display_name, username, anonymous_name, preferred_guidance_path")
        .eq("user_id", user.id)
        .maybeSingle();

      if (isMounted) {
        setSelectedCourseId((profile?.selected_course_id as string | null) ?? null);
        setData((current) => ({
          ...current,
          isAnonymous: Boolean(profile?.is_anonymous),
          displayName:
            ((profile?.is_anonymous ? profile?.anonymous_name : (profile?.username ?? profile?.display_name)) as string | null) ??
            current.displayName,
          guidancePath:
            ((profile?.preferred_guidance_path as GuidancePath | null) ?? current.guidancePath),
        }));
      }
    }

    void loadSelection();

    return () => {
      isMounted = false;
    };
  }, []);

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function update(partial: Partial<OnboardingData>) {
    setData((d) => ({ ...d, ...partial }));
  }

  async function finish(finalMood: MoodValue | null) {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const displayName =
      data.isAnonymous && !data.displayName
        ? randomAnonymousName(ANONYMOUS_NAMES)
        : data.displayName || user.email?.split("@")[0] || "Friend";

    // Update profile
    await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        username: data.isAnonymous ? null : displayName,
        anonymous_name: data.isAnonymous ? displayName : null,
        is_anonymous: data.isAnonymous,
        display_name_mode: data.isAnonymous ? "nickname" : "real_name",
        preferred_guidance_path: data.guidancePath,
        personal_goal: data.goal || null,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);

    // Save mood baseline if provided
    if (finalMood) {
      await supabase.from("mood_checkins").insert({
        user_id: user.id,
        mood: finalMood,
        mood_label: finalMood,
        note: "Onboarding baseline",
      });
    }

    // Start course progress if a version was chosen
    if (data.courseVersionId) {
      await supabase.from("user_course_progress").upsert({
        user_id: user.id,
        course_version_id: data.courseVersionId,
      });
    }

    router.push("/today");
    router.refresh();
  }

  const steps = [
    <StepWelcome key="welcome" onNext={next} />,
    <StepDisplayName
      key="name"
      value={data.displayName}
      isAnonymous={data.isAnonymous}
      onChange={(displayName, isAnonymous) => {
        update({ displayName, isAnonymous });
        next();
      }}
    />,
    <StepGuidancePath
      key="path"
      value={data.guidancePath}
      onChange={(guidancePath) => {
        update({ guidancePath });
        next();
      }}
    />,
    <StepChooseJourney
      key="course"
      guidancePath={data.guidancePath}
      courseId={selectedCourseId}
      onSelect={(courseVersionId, guidancePath) => {
        update({ courseVersionId, guidancePath });
        next();
      }}
    />,
    <StepSetGoal
      key="goal"
      value={data.goal}
      onChange={(goal) => {
        update({ goal });
        next();
      }}
    />,
    <StepMoodBaseline
      key="mood"
      onComplete={(mood) => finish(mood)}
      saving={saving}
    />,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cream via-sand to-cream">
      {/* Progress dots */}
      {step > 0 && (
        <div className="flex items-center justify-center gap-2 pt-8 pb-4">
          {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < step
                  ? "w-6 h-2 bg-sage"
                  : i === step - 1
                  ? "w-6 h-2 bg-sage"
                  : "w-2 h-2 bg-mist"
              }`}
            />
          ))}
        </div>
      )}

      {/* Step content - improved desktop layout */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 lg:py-16">
        <div className="w-full max-w-2xl lg:max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 flex flex-col"
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

