"use client";

import * as React from "react";

export type ReadAlongWord = { text: string; index: number; pause: number };
export type ReadAlongSchedule = { words: ReadAlongWord[]; timings: number[]; duration: number };

const sentenceEnd = /[.!?…]+["')\]]*$/;
const clauseEnd = /[,;:]+["')\]]*$/;

export function getReadAlongSchedule(text: string, wordsPerSecond = 2.6, punctuationPause = 240): ReadAlongSchedule {
  const words = text.split(/\s+/).filter(Boolean).map((value, index) => ({
    text: value,
    index,
    pause: sentenceEnd.test(value) ? punctuationPause : clauseEnd.test(value) ? punctuationPause / 2 : 0,
  }));
  const timings: number[] = [];
  let cursor = 0;
  for (const word of words) {
    timings.push(cursor);
    cursor += 1 / wordsPerSecond + word.pause / 1000;
  }
  return { words, timings, duration: cursor };
}

export function useReducedMotion() {
  const [reduced, setReduced] = React.useState(true);
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function indexAt(time: number, timings: number[], duration: number) {
  if (time < 0 || time >= duration) return time >= duration ? timings.length : -1;
  let index = 0;
  while (index + 1 < timings.length && timings[index + 1] <= time) index += 1;
  return index;
}

type ReadAlongTextProps = {
  text: string;
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
  className?: string;
};

export function ReadAlongText({ text, currentTime, duration, onSeek, className = "" }: ReadAlongTextProps) {
  const schedule = React.useMemo(() => getReadAlongSchedule(text), [text]);
  const timings = React.useMemo(() => {
    if (!duration || !schedule.duration) return schedule.timings;
    const scale = duration / schedule.duration;
    return schedule.timings.map((time) => time * scale);
  }, [duration, schedule]);
  const active = indexAt(currentTime, timings, duration || schedule.duration);

  return (
    <p className={`font-sans text-sm leading-7 ${className}`} aria-label="Read along with Craig's message">
      {schedule.words.map((word, index) => {
        const state = index < active ? "text-[#5f5749]" : index === active ? "bg-[#c89a3b]/20 text-[#253c2b]" : "text-[#978e80]";
        return <React.Fragment key={word.index}>{index ? " " : null}<button type="button" onClick={() => onSeek?.(timings[index] ?? 0)} className={`rounded px-0.5 text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#a88849] ${state}`}>{word.text}</button></React.Fragment>;
      })}
    </p>
  );
}

export default ReadAlongText;
