import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Compass, BookOpen, User, ShieldCheck, Sparkles } from 'lucide-react';
import { CTAButton } from './CTAButton';
import { getTargetDate, calculateTimeRemaining, TimeRemaining } from '../utils/CountdownTimer';
import { MY_MENTOR_DATA } from '../data/landingData';

interface CountdownSectionProps {
  onSignUp?: () => void;
  onExploreBooks?: () => void;
  onSignIn?: (role: 'user' | 'admin') => void;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({
  onSignUp,
  onExploreBooks,
  onSignIn,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 19,
    isComplete: false,
  });

  useEffect(() => {
    const target = getTargetDate();
    setTimeLeft(calculateTimeRemaining(target));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(target));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'auto' });
  };

  return (
    <section
      id="invitation"
      className="relative w-full select-none -mt-10 xs:-mt-12 sm:-mt-18 md:-mt-24 pt-16 xs:pt-20 sm:pt-28 md:pt-36 pb-12 xs:pb-16 sm:pb-20 md:pb-24 min-h-[85vh] sm:min-h-screen flex flex-col justify-between items-center bg-[#070707] rounded-b-[25px] shadow-[0_16px_40px_rgba(0,0,0,0.35)] text-center overflow-hidden z-[5]"
    >
      {/* Subtle starfield texture */}
      <div className="absolute inset-0 bg-starfield opacity-35 pointer-events-none" />

      {/* Warm soft gold glow behind center content */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.22, 0.32, 0.22] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[650px] h-[220px] sm:h-[400px] pointer-events-none blur-[60px] sm:blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #D9B267 0%, transparent 70%)',
        }}
      />

      {/* Main Final Invitation Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 xs:px-6 sm:px-10 flex flex-col items-center pt-2 sm:pt-6">
        {/* Section Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5C175]/10 border border-[#E5C175]/25 text-[#E5C175] text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold mb-3 sm:mb-4"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5C175] animate-pulse" />
          Final Invitation
        </motion.div>

        {/* Headline in Large Gold Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif-heading font-normal text-2xl xs:text-3xl sm:text-4xl md:text-[48px] leading-tight text-[#DEBA66] tracking-tight max-w-2xl"
        >
          “Start with one course, one chapter, and one action. That is enough to begin.”
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 text-xs sm:text-sm md:text-[15px] text-[#D8D4CC] max-w-lg mx-auto leading-relaxed font-sans font-light"
        >
          {MY_MENTOR_DATA.finalInvitation.platformNote}
        </motion.p>

        {/* Next Cohort Timer Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 xs:mt-8 sm:mt-10 w-full max-w-md rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-7 shadow-[0_12px_40px_rgba(201,161,58,0.22)] border border-[#F2D794]/40"
          style={{
            background: 'linear-gradient(180deg, #E8C782 0%, #D9B267 100%)',
          }}
        >
          {/* Top Label */}
          <div className="flex items-center justify-center gap-1.5 text-[#1C160E] text-[9.5px] xs:text-[10px] sm:text-xs font-bold tracking-[0.18em] uppercase mb-3 sm:mb-5">
            <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>COMMUNITY ENROLLMENT WINDOW</span>
          </div>

          {/* 4 Columns: Days, Hours, Minutes, Seconds */}
          <div className="grid grid-cols-4 gap-1.5 xs:gap-2 sm:gap-4 text-center">
            {/* Days */}
            <div className="flex flex-col items-center">
              <span className="font-sans font-extrabold text-xl xs:text-2xl sm:text-3xl text-[#1C160E] leading-none">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="font-sans text-[9px] xs:text-[10px] sm:text-xs font-medium text-[#4D3915] mt-1">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center">
              <span className="font-sans font-extrabold text-xl xs:text-2xl sm:text-3xl text-[#1C160E] leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="font-sans text-[9px] xs:text-[10px] sm:text-xs font-medium text-[#4D3915] mt-1">
                Hours
              </span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <span className="font-sans font-extrabold text-xl xs:text-2xl sm:text-3xl text-[#1C160E] leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="font-sans text-[9px] xs:text-[10px] sm:text-xs font-medium text-[#4D3915] mt-1">
                Minutes
              </span>
            </div>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <span className="font-sans font-extrabold text-xl xs:text-2xl sm:text-3xl text-[#1C160E] leading-none tabular-nums">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="font-sans text-[9px] xs:text-[10px] sm:text-xs font-medium text-[#4D3915] mt-1">
                Seconds
              </span>
            </div>
          </div>
        </motion.div>

        {/* Two CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 xs:mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          <CTAButton
            id="invitation-signup-btn"
            variant="gold-rect"
            icon="sparkles"
            onClick={onSignUp}
            className="px-7 py-3 text-xs sm:text-sm font-bold"
          >
            Sign up
          </CTAButton>
          <CTAButton
            id="invitation-books-btn"
            variant="dark-gold-border"
            icon="book"
            onClick={onExploreBooks || ((e) => scrollToSection('books', e))}
            href="#books"
            className="px-7 py-3 text-xs sm:text-sm"
          >
            Explore the books
          </CTAButton>
        </motion.div>
      </div>

      {/* Grounded, Calm Platform Footer */}
      <footer className="w-full max-w-[1280px] mx-auto px-4 xs:px-6 sm:px-10 mt-16 sm:mt-24 pt-10 border-t border-white/10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E5C175] flex items-center justify-center text-[#1A1814] font-serif font-bold text-xs">
                M
              </div>
              <h3 className="font-serif-heading font-bold text-xl text-white tracking-tight">
                {MY_MENTOR_DATA.brand.name}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#B8B1A5] font-light max-w-md leading-relaxed">
              {MY_MENTOR_DATA.brand.subtagline}
            </p>

            <p className="text-[11px] sm:text-xs text-[#8A8377] font-light max-w-md leading-relaxed">
              Built to feel calm, grounded, and useful. The goal is simple: one clear path, one honest step at a time.
            </p>
          </div>

          {/* Explore Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#E5C175] mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-[#C5BFB4]">
              <li>
                <a
                  href="#mission"
                  onClick={(e) => scrollToSection('mission', e)}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-[#E5C175]" />
                  <span>Mission</span>
                </a>
              </li>
              <li>
                <a
                  href="#books"
                  onClick={(e) => scrollToSection('books', e)}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#E5C175]" />
                  <span>Books</span>
                </a>
              </li>
              <li>
                <a
                  href="#creator"
                  onClick={(e) => scrollToSection('creator', e)}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#E5C175]" />
                  <span>Creator</span>
                </a>
              </li>
              <li>
                <a
                  href="#books"
                  onClick={(e) => scrollToSection('books', e)}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C175]" />
                  <span>Start</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Get Started Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#E5C175] mb-3">
              Get Started
            </h4>
            <ul className="space-y-2 text-xs text-[#C5BFB4]">
              <li>
                <button
                  onClick={onSignUp}
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5C175]" />
                  <span>Sign up</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSignIn && onSignIn('user')}
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <span>Sign in</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSignIn && onSignIn('admin')}
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5 text-[#9A9388] hover:text-[#D4CDBC]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9A9388]" />
                  <span>Admin login</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Tagline bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#787165] gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-[#E5C175]">My Mentor</span>
            <span>—</span>
            <span>Walk with purpose. Build with clarity.</span>
          </div>
          <div className="text-[10px] text-[#605A50]">
            © {new Date().getFullYear()} My Mentor Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </section>
  );
};
