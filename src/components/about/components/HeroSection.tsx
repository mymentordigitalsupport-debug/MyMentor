import React from 'react';
import { motion } from 'framer-motion';
import { VoiceBook } from './VoiceBook';
import { MY_MENTOR_DATA } from '../data/landingData';
import { CTAButton } from './CTAButton';

interface HeroSectionProps {
  onSignUp?: () => void;
  onExploreBooks?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <section className="relative z-50 flex min-h-[760px] w-full flex-col select-none bg-[#070707] xs:min-h-[800px] sm:min-h-[840px] lg:min-h-[900px] xl:min-h-[940px]">
      <div className="relative z-20 flex w-full flex-1 flex-col justify-between overflow-visible rounded-b-[25px] bg-[#FAF0E3] pb-8 pt-20 shadow-[0_16px_40px_rgba(0,0,0,0.08)] xs:pt-20 sm:pb-20 sm:pt-16 md:pb-28 md:pt-14">
        <div className="relative mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-start px-4 xs:px-6 sm:px-10 md:px-16 lg:justify-between lg:px-20">
          <div className="relative z-10 mx-auto mt-4 max-w-5xl text-center xs:mt-6 sm:mt-10 md:mt-14">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="select-none font-display text-[47px] font-black uppercase leading-[0.88] tracking-tight text-[#1F1710] xs:text-[57px] sm:text-[85px] sm:leading-[0.86] md:text-[77px] md:leading-[0.85] lg:text-[129px]"
            >
              <span className="block">{MY_MENTOR_DATA.hero.headlineLine1}</span>
              <span className="block text-[#A77C2B]">{MY_MENTOR_DATA.hero.headlineLine2}</span>
            </motion.h1>
          </div>

          <div className="about-hero-copy relative z-10 mt-8 flex w-full items-start justify-between gap-3 pt-0 sm:mt-10 lg:mt-0 lg:items-end lg:pt-16">
            <div className="flex -translate-x-1 flex-col items-start xs:-translate-x-2 sm:-translate-x-5 md:-translate-x-8 lg:-translate-x-12">
              <CTAButton href="#pricing" variant="dark-rect" className="!rounded-[10px]">Download Books</CTAButton>
            </div>

            <div className="max-w-[230px] min-w-0 text-right sm:max-w-[340px] sm:text-left lg:hidden xl:absolute xl:right-10 xl:top-[320px] xl:block xl:max-w-[240px]">
              <p className="font-sans text-xs font-normal leading-relaxed text-[#3E342B] sm:text-sm">
                {MY_MENTOR_DATA.hero.subtext}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-[70px] z-40 flex justify-center sm:bottom-[-28px] md:bottom-[-12px] lg:bottom-[-80px] xl:bottom-[-120px]">
          <VoiceBook variant="hero" />
        </div>
      </div>
    </section>
  );
};
