"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ANONYMOUS_NAMES } from "@/types";
import { randomAnonymousName } from "@/lib/utils";

interface StepDisplayNameProps {
  value: string;
  isAnonymous: boolean;
  onChange: (displayName: string, isAnonymous: boolean) => void;
}

export function StepDisplayName({ value, isAnonymous, onChange }: StepDisplayNameProps) {
  const [typedName, setTypedName] = useState(value);
  const [suggestedName] = useState(() => value || randomAnonymousName(ANONYMOUS_NAMES));

  async function handleContinue() {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const nextDisplayName = isAnonymous
      ? suggestedName
      : typedName.trim() || "Friend";

    if (user) {
      await supabase
        .from("profiles")
        .update({
          display_name: nextDisplayName,
          username: isAnonymous ? null : nextDisplayName,
          anonymous_name: isAnonymous ? suggestedName : null,
          is_anonymous: isAnonymous,
          display_name_mode: isAnonymous ? "nickname" : "real_name",
        })
        .eq("user_id", user.id);
    }

    onChange(nextDisplayName, isAnonymous);
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-10">
      <h2 className="mb-2 font-serif text-2xl font-semibold text-forest">
        {isAnonymous ? "What is your nickname?" : "What is your full name?"}
      </h2>
      <p className="mb-8 text-sm leading-relaxed text-muted">
        {isAnonymous
          ? "Your nickname stays private and will be used throughout your journey."
          : "Your name is only visible to you and can be updated later."}
      </p>

      {isAnonymous ? (
        <div className="mb-8 rounded-2xl border border-sage/20 bg-sage/10 px-4 py-4">
          <p className="text-sm text-forest">
            You&apos;ll be known as <strong>{suggestedName}</strong>.
          </p>
        </div>
      ) : (
        <div className="mb-8">
          <Input
            label="Your full name"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="e.g. Alex Johnson"
            autoFocus
          />
        </div>
      )}

      <div className="mt-auto">
        <Button
          onClick={handleContinue}
          fullWidth
          size="lg"
          disabled={!isAnonymous && !typedName.trim()}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
