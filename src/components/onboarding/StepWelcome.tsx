"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-6xl lg:text-7xl mb-8 lg:mb-12"
        aria-hidden="true"
      >
        🌱
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="font-serif text-4xl lg:text-5xl text-forest font-semibold mb-6 lg:mb-8 leading-snug"
      >
        You took a brave step
        <br />
        by being here.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="text-muted text-base lg:text-lg leading-relaxed mb-6 max-w-md lg:max-w-xl"
      >
        This is a safe, private space. There is no judgment here — only
        support, guidance, and one step at a time.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-muted/70 text-sm lg:text-base italic mb-12 lg:mb-16"
      >
        &ldquo;You do not need to solve your whole life today.&rdquo;
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="w-full max-w-xs"
      >
        <Button onClick={onNext} fullWidth size="lg">
          I&apos;m ready to begin
        </Button>
      </motion.div>
    </div>
  );
}
