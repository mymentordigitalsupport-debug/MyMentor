import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUp, Sparkles, BookOpen } from 'lucide-react';
import { MY_MENTOR_DATA } from '../data/landingData';

interface ScrollExperienceProps {
  onSignUp?: () => void;
  onExploreBooks?: () => void;
}

export const ScrollExperience: React.FC<ScrollExperienceProps> = ({
  onSignUp,
  onExploreBooks,
}) => {
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [showFloatingBar, setShowFloatingBar] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setShowFloatingBar(latest > 380);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  };

  const scrollToBooks = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExploreBooks) {
      onExploreBooks();
    } else {
      const el = document.getElementById('books');
      if (el) el.scrollIntoView({ behavior: 'auto' });
    }
  };

  return (
    <>
      {/* 1. Top Reading Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-[100] pointer-events-none">
        <motion.div
          className="h-full bg-gradient-to-r from-[#C9A13A] via-[#E2C374] to-[#F3D794] origin-left shadow-[0_1px_8px_rgba(201,161,58,0.6)]"
          style={{ scaleX }}
        />
      </div>

      {/* 2. Floating Quick Action & Smooth Return Dock */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={
          showFloatingBar
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 30, scale: 0.95 }
        }
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed bottom-5 right-4 xs:right-6 sm:right-8 z-50 pointer-events-auto flex items-center gap-2 ${
          !showFloatingBar ? 'pointer-events-none' : ''
        }`}
      >
        {/* Quick Offer Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-[#1A1A1A]/95 backdrop-blur-md text-white border border-[#DEBA66]/40 px-3.5 py-2 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-1.5 pl-1 pr-2 border-r border-white/10 text-xs text-[#E5C77D] font-serif">
            <span className="font-medium">{MY_MENTOR_DATA.brand.name}</span>
            <span className="text-[10px] text-[#A69E8F] font-sans">3 Courses</span>
          </div>

          <button
            onClick={scrollToBooks}
            className="flex items-center gap-1 text-xs font-medium text-[#EAE6DF] hover:text-white hover:bg-white/10 active:scale-95 px-2.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-[#DEBA66]" />
            <span>Books</span>
          </button>

          <button
            onClick={onSignUp}
            className="flex items-center gap-1 text-xs font-semibold text-[#181511] bg-gradient-to-b from-[#E7C77E] to-[#CA9F44] hover:brightness-110 active:scale-95 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#181511]" />
            <span>Sign up</span>
          </button>
        </div>

        {/* Smooth Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="group flex items-center justify-center w-11 h-11 rounded-full bg-[#FAF0E3] hover:bg-white text-[#2B231B] border border-[#DFCBB5] shadow-[0_8px_25px_rgba(0,0,0,0.18)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4 text-[#8C6D2D] group-hover:-translate-y-0.5 transition-transform duration-200 stroke-[2.5]" />
        </button>
      </motion.div>
    </>
  );
};
