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
    <section className="relative w-full select-none min-h-[100dvh] sm:min-h-screen flex flex-col z-50 bg-[#070707]">
      {/* Full-width Cream Hero Container with rounded bottom corners (#FAF0E3) */}
      <div className="relative w-full flex-1 bg-[#FAF0E3] rounded-b-[25px] pt-20 xs:pt-20 sm:pt-16 md:pt-14 pb-8 sm:pb-20 md:pb-28 overflow-visible shadow-[0_16px_40px_rgba(0,0,0,0.08)] z-20 flex flex-col justify-between">
        <div className="w-full max-w-[1360px] mx-auto px-4 xs:px-6 sm:px-10 md:px-16 lg:px-20 flex-1 flex flex-col justify-between">
          {/* Headline: WE TRANSFORM TOGETHER */}
          <div className="mt-4 xs:mt-6 sm:mt-10 md:mt-14 text-center relative z-10 max-w-5xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-black text-[#1F1710] text-[34px] xs:text-[44px] sm:text-[72px] md:text-[96px] lg:text-[116px] leading-[0.88] sm:leading-[0.86] md:leading-[0.85] tracking-tight uppercase select-none"
            >
              <span className="block">{MY_MENTOR_DATA.hero.headlineLine1}</span>
              <span className="block text-[#A77C2B]">{MY_MENTOR_DATA.hero.headlineLine2}</span>
            </motion.h1>
          </div>

          {/* 3D Rotated Transformation Volume / Poster */}
          <div className="relative z-20 flex justify-center -mt-8 xs:-mt-10 sm:-mt-18 md:-mt-28 -mb-14 xs:-mb-18 sm:-mb-32 md:-mb-48 translate-y-[22px] xs:translate-y-[34px] sm:translate-y-[60px] md:translate-y-[80px] pointer-events-none">
            <VoiceBook
              variant="hero"
              titleLine1="MY MENTOR"
              titleLine2="TRANSFORMATION"
              subtitle="Truth • Structure • Care"
              tagline="Walk out of survival and into purpose."
              authorName="Craig"
            />
          </div>

          {/* Bottom elements: Scroll Down Indicator & Tagline text */}
          <div className="relative z-10 flex items-end justify-between w-full pt-4 xs:pt-6 sm:pt-12 md:pt-16 translate-y-2 xs:translate-y-4 sm:translate-y-8 md:translate-y-12">
            <div className="flex flex-col items-start -translate-x-1 xs:-translate-x-2 sm:-translate-x-5 md:-translate-x-8 lg:-translate-x-12">
              <a
                href="#mission"
                className="p-1.5 sm:p-2 text-[#3A3025] hover:text-black hover:translate-y-1 transition-all duration-200 cursor-pointer pointer-events-auto flex items-center gap-2 group"
                aria-label="Scroll to mission and why My Mentor exists"
              >
                <svg
                  width="24"
                  height="36"
                  viewBox="0 0 24 36"
                  fill="none"
                  className="w-4 h-7 xs:w-5 xs:h-8 sm:w-6 sm:h-9 stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round animate-bounce text-[#785E2F]"
                >
                  <line x1="12" y1="2" x2="12" y2="32" />
                  <polyline points="5 24 12 32 19 24" />
                </svg>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#785E2F] opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline">
                  Why My Mentor Exists
                </span>
              </a>
            </div>

            <div className="max-w-[150px] xs:max-w-[200px] sm:max-w-[280px] md:max-w-[340px] text-right sm:text-left pointer-events-auto translate-x-1 xs:translate-x-2 sm:translate-x-5 md:translate-x-8 lg:translate-x-12">
              <p className="font-sans text-[10px] xs:text-[11.5px] sm:text-xs md:text-sm text-[#3E342B] font-normal leading-snug">
                {MY_MENTOR_DATA.hero.subtext}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
