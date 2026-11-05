import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MoodValue } from "@/types";

const moodImagePaths: Record<MoodValue, string> = {
  low: "/assets/images/low.png",
  heavy: "/assets/images/heavy.png",
  uncertain: "/assets/images/uncertain.png",
  hopeful: "/assets/images/hopeful.png",
  steady: "/assets/images/steady.png",
  strong: "/assets/images/strong.png",
};

export function MoodImage({ mood, size = 39, className }: { mood: MoodValue; size?: number; className?: string }) {
  return <Image src={moodImagePaths[mood]} alt="" aria-hidden="true" width={size} height={size} className={cn("object-contain", className)} />;
}
