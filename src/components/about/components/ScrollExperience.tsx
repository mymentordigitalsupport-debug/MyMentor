import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface ScrollExperienceProps {
  onSignUp?: () => void;
  onExploreBooks?: () => void;
}

export const ScrollExperience: React.FC<ScrollExperienceProps> = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      {/* 1. Top Reading Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-[100] pointer-events-none">
        <motion.div
          className="h-full bg-gradient-to-r from-[#C9A13A] via-[#E2C374] to-[#F3D794] origin-left shadow-[0_1px_8px_rgba(201,161,58,0.6)]"
          style={{ scaleX }}
        />
      </div>
    </>
  );
};
