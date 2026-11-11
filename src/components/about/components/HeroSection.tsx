import React from 'react';
import { motion } from 'framer-motion';
import { VoiceBook } from './VoiceBook';
import { MY_MENTOR_DATA } from '../data/landingData';

interface HeroSectionProps {
  onSignUp?: () => void;
  onExploreBooks?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <section className="relative z-50 flex min-h-[680px] w-full flex-col select-none bg-[#070707] sm:min-h-[720px] lg:min-h-[760px] xl:min-h-[790px]">
      <div className="relative z-20 flex w-full flex-1 flex-col justify-between overflow-visible rounded-b-[25px] bg-[#FAF0E3] pb-8 pt-20 shadow-[0_16px_40px_rgba(0,0,0,0.08)] xs:pt-20 sm:pb-20 sm:pt-16 md:pb-28 md:pt-14">
        <div className="relative mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-between px-4 xs:px-6 sm:px-10 md:px-16 lg:px-20">
          <div className="relative z-10 mx-auto mt-4 max-w-5xl text-center xs:mt-6 sm:mt-10 md:mt-14">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="select-none font-display text-[34px] font-black uppercase leading-[0.88] tracking-tight text-[#1F1710] xs:text-[44px] sm:text-[72px] sm:leading-[0.86] md:text-[96px] md:leading-[0.85] lg:text-[116px]"
            >
              <span className="block">{MY_MENTOR_DATA.hero.headlineLine1}</span>
              <span className="block text-[#A77C2B]">{MY_MENTOR_DATA.hero.headlineLine2}</span>
            </motion.h1>
          </div>

          <div className="relative z-10 flex w-full items-end justify-between pt-4 xs:pt-6 sm:pt-12 md:pt-16">
            <div className="flex -translate-x-1 flex-col items-start xs:-translate-x-2 sm:-translate-x-5 md:-translate-x-8 lg:-translate-x-12">
              <a
                href="#mission"
                className="group flex cursor-pointer items-center gap-2 p-1.5 text-[#3A3025] transition-all duration-200 hover:translate-y-1 hover:text-black sm:p-2"
                aria-label="Scroll to mission and why My Mentor exists"
              >
                <svg width="24" height="36" viewBox="0 0 24 36" fill="none" className="h-7 w-4 animate-bounce stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round text-[#785E2F] xs:h-8 xs:w-5 sm:h-9 sm:w-6">
                  <line x1="12" y1="2" x2="12" y2="32" />
                  <polyline points="5 24 12 32 19 24" />
                </svg>
                <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-[#785E2F] opacity-0 transition-opacity group-hover:opacity-100 md:inline sm:text-xs">Why My Mentor Exists</span>
              </a>
            </div>

            <div className="max-w-[150px] translate-x-1 text-right xs:max-w-[200px] xs:translate-x-2 sm:max-w-[280px] sm:translate-x-5 sm:text-left md:max-w-[340px] md:translate-x-8 lg:hidden xl:absolute xl:right-10 xl:top-[320px] xl:block xl:max-w-[240px] xl:translate-x-0">
              <p className="font-sans text-[10px] font-normal leading-snug text-[#3E342B] xs:text-[11.5px] sm:text-xs md:text-sm">
                {MY_MENTOR_DATA.hero.subtext}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-[-56px] z-40 flex justify-center sm:bottom-[-28px] md:bottom-[-12px] lg:bottom-[-80px] xl:bottom-[-120px]">
          <VoiceBook variant="hero" />
        </div>
      </div>
    </section>
  );
};
