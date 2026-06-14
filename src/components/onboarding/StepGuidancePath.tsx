"use client";

import { type GuidancePath } from "@/types";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface StepGuidancePathProps {
  value: GuidancePath;
  onChange: (path: GuidancePath) => void;
}

const OPTIONS: Array<{
  value: GuidancePath;
  label: string;
  description: string;
  emoji: string;
}> = [
  {
    value: "religious",
    label: "Religious Guidance",
    description:
      "Recovery mentorship grounded in spiritual reflection, purpose, and identity growth.",
    emoji: "🌿",
  },
  {
    value: "christian",
    label: "Christian Guided",
    description:
      "Faith-integrated mentorship with scripture, prayer, and spiritual encouragement woven through every lesson.",
    emoji: "✝️",
  },
];

export function StepGuidancePath({ value, onChange }: StepGuidancePathProps) {
  const [selected, setSelected] = useState<GuidancePath>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  async function handleContinue() {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from("profiles")
        .update({
          preferred_guidance_path: selected,
        })
        .eq("user_id", user.id);
    }
    
    onChange(selected);
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-10">
      <h2 className="font-serif text-2xl text-forest font-semibold mb-2">
        Choose your guidance style
      </h2>
      <p className="text-muted text-sm mb-8 leading-relaxed">
        Both paths lead to the same destination. Choose what feels most
        natural to you.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelected(opt.value)}
            className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
              selected === opt.value
                ? "border-sage bg-sage/10"
                : "border-mist bg-cream hover:border-sage/40"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5" aria-hidden="true">
                {opt.emoji}
              </span>
              <div>
                <p className="font-medium text-text mb-1">{opt.label}</p>
                <p className="text-sm text-muted leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto">
        <Button onClick={handleContinue} fullWidth size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
