"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AlignmentWord {
  text: string;
  start: number;
  end: number;
}

const EMPTY_ALIGNMENT_WORDS: AlignmentWord[] = [];

interface AudioBlockContent {
  title?: string;
  url?: string;
  transcript?: string;
  alignment?: {
    version?: number;
    words?: AlignmentWord[];
  };
}

export function AudioBlock({ content }: { content: AudioBlockContent }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const frameRef = useRef<number | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const words = content.alignment?.words ?? EMPTY_ALIGNMENT_WORDS;

  const syncToAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || words.length === 0) return;
    const time = audio.currentTime;
    let low = 0;
    let high = words.length - 1;
    let active = -1;
    while (low <= high) {
      const middle = (low + high) >> 1;
      if (words[middle].start <= time) {
        active = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
    const nextCount = audio.ended ? words.length : active + 1;
    setRevealedCount((current) => current === nextCount ? current : nextCount);
  }, [words]);

  const stopTracking = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  const startTracking = useCallback(() => {
    stopTracking();
    const tick = () => {
      syncToAudio();
      const audio = audioRef.current;
      if (audio && !audio.paused && !audio.ended) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [stopTracking, syncToAudio]);

  useEffect(() => {
    setRevealedCount(0);
    setShowAll(false);
    return stopTracking;
  }, [content.url, stopTracking]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setShowAll(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  return (
    <div className="bg-cream border border-mist rounded-2xl p-5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sage/15 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-sage">
            <path
              d="M9 18V5l12-2v13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">
            Audio
          </p>
          <p className="font-medium text-text text-sm truncate">
            {content.title ?? "Guided Audio"}
          </p>
        </div>
      </div>

      {content.url ? (
        <audio
          ref={audioRef}
          src={content.url}
          controls
          controlsList="nodownload noplaybackrate"
          preload="metadata"
          onPlay={startTracking}
          onPause={() => { syncToAudio(); stopTracking(); }}
          onSeeked={syncToAudio}
          onTimeUpdate={syncToAudio}
          onEnded={() => { setRevealedCount(words.length); stopTracking(); }}
          onContextMenu={(event) => event.preventDefault()}
          className="w-full mt-4"
          aria-label={content.title ?? "Audio track"}
        />
      ) : (
        <p className="text-xs text-muted mt-3 text-center">Audio coming soon</p>
      )}

      {content.transcript && words.length > 0 ? (
        <div className="mt-5 rounded-xl border border-mist bg-white/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Read along</p>
            <button
              type="button"
              className="text-xs font-medium text-forest underline decoration-sage/50 underline-offset-4"
              onClick={() => {
                setShowAll((current) => !current);
                if (showAll) syncToAudio();
              }}
            >
              {showAll ? "Follow audio" : "Show full text"}
            </button>
          </div>
          <p className="text-base leading-relaxed text-text" aria-label={content.transcript}>
            {words.map((word, index) => {
              const visible = showAll || index < revealedCount;
              const current = !showAll && index === revealedCount - 1;
              return (
                <span
                  key={`${index}-${word.start}`}
                  aria-hidden="true"
                  className={visible ? (current ? "rounded bg-gold/20" : "") : "invisible"}
                >
                  {word.text}
                </span>
              );
            })}
          </p>
          {!showAll && revealedCount === 0 ? (
            <p className="mt-3 text-xs text-muted">Press play to begin.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
