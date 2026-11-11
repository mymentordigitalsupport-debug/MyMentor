"use client";

import React, { useRef, useState } from "react";
import { ReadAlongText } from "@/components/ui/read-along-text";
import InkReveal from "@/components/ui/ink-reveal";

interface AuthorSectionProps { onSignUp?: () => void; onExploreBooks?: () => void; }

const WAVEFORM = [15, 28, 18, 37, 25, 43, 19, 31, 14, 35, 24, 46, 17, 29, 39, 21, 32, 13, 26, 41, 18, 34, 23, 15, 28, 38, 20, 30, 16, 36];
const MESSAGE = `I know what substance abuse can do to a person. And I know how deeply it can affect their family, their friends, and everyone who cares about them. I know because I've lived through it. But that's not where my story ends. I found a new direction in life. I became a counsellor, I started writing books, and eventually, I created MY MENTOR. Because everything I've experienced, everything I've learned... what good is it if I keep it to myself? There are parents trying to protect their children. Families looking for answers. People who desperately want to change their lives but don't know where to begin. That's who MY MENTOR is for. I believe that when we share knowledge, stand together, and work toward one purpose, we can change lives. And that's what I want MY MENTOR to be part of.`;

function clock(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

export const AuthorSection: React.FC<AuthorSectionProps> = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progress = duration ? currentTime / duration : 0;

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <section id="creator" className="relative z-30 overflow-hidden bg-[#FAF0E3] px-5 py-16 text-[#211d17] sm:px-8 sm:py-20 lg:px-12 lg:py-0">
      <div className="relative mx-auto grid max-w-[1380px] items-center lg:min-h-[min(760px,calc(100vh-84px))] lg:grid-cols-[55fr_45fr]">
        <div className="relative z-10 max-w-[760px] pb-10 pt-4 lg:pb-16 lg:pt-16">
          <div className="mb-10 flex items-center gap-4"><span className="h-px w-10 bg-[#a88849]" /><p className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#4d6c4d] sm:text-xs">The person behind MY MENTOR</p></div>
          <h2 className="max-w-[720px] font-serif-heading text-[clamp(3.4rem,6.1vw,6.7rem)] font-medium leading-[0.87] tracking-[-0.068em] text-[#211d17]">A person's past does not have to define their <i className="font-normal text-[#31533a]">future.</i></h2>
          <p className="mt-9 max-w-[570px] font-sans text-[16px] leading-8 text-[#5c574c] sm:text-[17px]">Craig Petersen's personal journey through substance abuse and recovery shaped his commitment to helping others. Guided by faith, he became a certified substance abuse counsellor and author, creating MY MENTOR to make practical education, knowledge and support more accessible.</p>
          <div className="mt-12 flex items-end gap-5 border-t border-[#c9b991] pt-6"><span className="mb-1 h-9 w-px bg-[#a88849]" aria-hidden="true" /><p className="font-sans text-sm leading-6 text-[#4b5746]"><span className="block font-serif-heading text-[1.45rem] leading-6 text-[#263d2c]">Craig Petersen</span>Founder of MY MENTOR · Certified Substance Abuse Counsellor · Author</p></div>

          <div className="mt-7 max-w-[620px] rounded-[18px] border border-[#dfd1b9] bg-[#f7eddf] px-5 py-4 sm:px-6">
            <audio ref={audioRef} src="/about/craig.mp3" preload="metadata" onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onEnded={() => { setIsPlaying(false); setCurrentTime(0); }} />
            <div className="flex items-center gap-3">
              <button type="button" onClick={toggleAudio} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1f432f] text-sm text-[#f7eddf] transition hover:bg-[#31533a] focus:outline-none focus:ring-2 focus:ring-[#a88849] focus:ring-offset-2" aria-label={isPlaying ? "Pause Craig's message" : "Play Craig's message"}>{isPlaying ? "||" : "▷"}</button>
              <div><p className="font-sans text-sm font-semibold text-[#342c23]">A Word from Craig</p><p className="mt-0.5 font-sans text-xs text-[#756b5c]">A personal message from the founder</p></div>
              <span className="ml-auto font-mono text-xs tabular-nums text-[#756b5c]">{clock(currentTime)} / {duration ? clock(duration) : "--:--"}</span>
            </div>
            <button type="button" onClick={(event) => { const box = event.currentTarget.getBoundingClientRect(); seek(((event.clientX - box.left) / box.width) * duration); }} className="mt-4 flex h-12 w-full items-center gap-[3px] text-left focus:outline-none focus:ring-2 focus:ring-[#a88849]" aria-label="Seek through Craig's message">
              {WAVEFORM.map((height, index) => <span key={index} className={`w-[3px] rounded-full ${index / WAVEFORM.length <= progress ? "bg-[#af7b25]" : "bg-[#cfc2af]"}`} style={{ height }} />)}
            </button>
            <ReadAlongText text={MESSAGE} currentTime={currentTime} duration={duration} onSeek={seek} className="mt-4 max-h-40 overflow-y-auto pr-2" />
            <div className="mt-3 flex justify-between font-sans text-[10px] text-[#756b5c]"><span>Follow along or select a word to jump ahead</span><span>{duration ? clock(duration) : "Loading audio"}</span></div>
          </div>
        </div>
        <div className="relative mx-auto flex h-[440px] w-full max-w-[520px] items-end justify-center sm:h-[560px] lg:absolute lg:bottom-0 lg:right-[-1.5%] lg:h-[min(720px,calc(100vh-90px))] lg:max-w-[600px]">
          <InkReveal imageSrc="/assets/images/books/Uprooting drug abuse.png" maskColor="#FAF0E3" brushSize={120} lifetime={1200} />
          <div className="pointer-events-none absolute bottom-[7%] right-[4%] z-10 h-[77%] w-[72%] border border-[#b4965b] sm:right-[8%]" aria-hidden="true" />
          <div className="pointer-events-none absolute bottom-[2%] right-[0%] z-10 h-[72%] w-[74%] border-l-[10px] border-t-[10px] border-[#31533a]/90 sm:right-[4%]" aria-hidden="true" />
          <img src="/about/Professional Portrait Cutout.png" alt="Craig Petersen — Founder of MY MENTOR" className="relative z-20 block h-full w-auto max-w-full object-contain object-bottom" loading="lazy" draggable={false} />
        </div>
      </div>
    </section>
  );
};
