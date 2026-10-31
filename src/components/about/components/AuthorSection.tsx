import React from 'react';
import { motion } from 'framer-motion';
import { AuthorPortrait } from './AuthorPortrait';
import { MY_MENTOR_DATA } from '../data/landingData';

interface AuthorSectionProps {
  onSignUp?: () => void;
  onExploreBooks?: () => void;
}

export const AuthorSection: React.FC<AuthorSectionProps> = () => {
  const founder = MY_MENTOR_DATA.founder;

  return (
    <section
      id="creator"
      className="relative w-full select-none z-30 flex flex-col bg-[#FAF0E3] rounded-b-[25px]"
    >
      {/* Full-width Cream Author Container (#FAF0E3) with rounded bottom corners */}
      <div className="relative w-full flex-1 bg-[#FAF0E3] rounded-b-[25px] pt-6 xs:pt-8 sm:pt-10 md:pt-12 pb-12 xs:pb-16 sm:pb-20 md:pb-24 overflow-visible flex flex-col justify-center items-center">
        <div className="w-full max-w-[1360px] mx-auto px-4 xs:px-6 sm:px-10 md:px-16 text-center">
          {/* Founder Silhouette Portrait with Floating Pills and Craig Tag */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <AuthorPortrait />
          </motion.div>

          {/* Centered Bio Text */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 xs:mt-8 sm:mt-10 max-w-2xl mx-auto text-center px-2 xs:px-4"
          >
            <p className="font-sans text-sm sm:text-base text-[#382D22] leading-[1.7] font-normal">
              {founder.bio}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
