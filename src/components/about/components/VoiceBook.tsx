import React from 'react';
import { motion } from 'framer-motion';

interface VoiceBookProps {
  variant?: 'hero' | 'learn';
  className?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  tagline?: string;
  courseNumber?: string;
  authorName?: string;
}

export const VoiceBook: React.FC<VoiceBookProps> = ({
  variant = 'hero',
  className = '',
}) => {
  const isHero = variant === 'hero';

  return (
    <div
      className={`relative select-none pointer-events-none ${className}`}
      style={{
        perspective: '1200px',
      }}
    >
      {/* Straight Book Container with gentle float */}
      <motion.div
        animate={isHero ? { y: [0, -7, 0] } : undefined}
        transition={isHero ? { duration: 5, repeat: Infinity, ease: 'easeInOut' } : undefined}
        className="relative transition-transform duration-500 ease-out rotate-0"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Main Book asset image container */}
        <div
          className={`relative overflow-hidden ${
            isHero
              ? '-rotate-6 w-[220px] h-[300px] xs:w-[260px] xs:h-[355px] sm:w-[330px] sm:h-[455px] md:w-[380px] md:h-[520px]'
              : 'w-[230px] h-[325px] xs:w-[270px] xs:h-[380px] sm:w-[350px] sm:h-[490px] md:w-[400px] md:h-[560px]'
          }`}
        >
          <img
            src="/about/Uprooting Drug Abuse_ Rootbound Shadows.png"
            alt="Uprooting Drug Abuse: Rootbound Shadows Book Cover"
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    </div>
  );
};
