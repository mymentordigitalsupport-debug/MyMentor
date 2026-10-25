import React from 'react';
import { motion } from 'framer-motion';
import { MY_MENTOR_DATA } from '../data/landingData';

export const AuthorPortrait: React.FC = () => {
  const tags = MY_MENTOR_DATA.founder.tags;
  const tagTopLeft = tags.find((t) => t.position === 'top-left')?.text || 'Trust & Structure';
  const tagBottomLeft = tags.find((t) => t.position === 'bottom-left')?.text || 'Daily Action';
  const tagTopRight = tags.find((t) => t.position === 'top-right')?.text || 'Humane Care';
  const tagBottomRight = tags.find((t) => t.position === 'bottom-right')?.text || 'Built in Service';

  return (
    <div className="relative mx-auto flex flex-col items-center max-w-[500px] pt-1 sm:pt-4 select-none">
      {/* Container with relative positioning for floating tags */}
      <div className="relative w-full flex justify-center items-center">
        {/* Floating Tag 1: Top Left */}
        <motion.div
          initial={{ opacity: 0, x: -24, y: -10 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 xs:left-1 sm:left-4 top-12 xs:top-16 sm:top-20 z-20"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.08, y: -6 }}
            className="bg-white text-[#78551E] text-[9px] xs:text-[10px] sm:text-xs font-semibold px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 rounded-[10px] shadow-[0_4px_14px_rgba(130,90,30,0.1)] border border-[#EDE0CE]/80 whitespace-nowrap transition-shadow duration-300 hover:shadow-[0_8px_20px_rgba(130,90,30,0.2)] cursor-default"
          >
            {tagTopLeft}
          </motion.div>
        </motion.div>

        {/* Floating Tag 2: Bottom Left */}
        <motion.div
          initial={{ opacity: 0, x: -24, y: 10 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-1 xs:left-2 sm:left-6 bottom-16 xs:bottom-20 sm:bottom-24 z-20"
        >
          <motion.div
            animate={{ y: [0, 3.5, 0] }}
            transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            whileHover={{ scale: 1.08, y: -6 }}
            className="bg-white text-[#78551E] text-[9px] xs:text-[10px] sm:text-xs font-semibold px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 rounded-[10px] shadow-[0_4px_14px_rgba(130,90,30,0.1)] border border-[#EDE0CE]/80 whitespace-nowrap transition-shadow duration-300 hover:shadow-[0_8px_20px_rgba(130,90,30,0.2)] cursor-default"
          >
            {tagBottomLeft}
          </motion.div>
        </motion.div>

        {/* Floating Tag 3: Top Right */}
        <motion.div
          initial={{ opacity: 0, x: 24, y: -10 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 xs:right-1 sm:right-6 top-16 xs:top-20 sm:top-24 z-20"
        >
          <motion.div
            animate={{ y: [0, -3.5, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            whileHover={{ scale: 1.08, y: -6 }}
            className="bg-white text-[#78551E] text-[9px] xs:text-[10px] sm:text-xs font-semibold px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 rounded-[10px] shadow-[0_4px_14px_rgba(130,90,30,0.1)] border border-[#EDE0CE]/80 whitespace-nowrap transition-shadow duration-300 hover:shadow-[0_8px_20px_rgba(130,90,30,0.2)] cursor-default"
          >
            {tagTopRight}
          </motion.div>
        </motion.div>

        {/* Floating Tag 4: Bottom Right */}
        <motion.div
          initial={{ opacity: 0, x: 24, y: 10 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 xs:right-1 sm:right-4 bottom-16 xs:bottom-20 sm:bottom-24 z-20"
        >
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
            whileHover={{ scale: 1.08, y: -6 }}
            className="bg-white text-[#78551E] text-[9px] xs:text-[10px] sm:text-xs font-semibold px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 rounded-[10px] shadow-[0_4px_14px_rgba(130,90,30,0.1)] border border-[#EDE0CE]/80 whitespace-nowrap transition-shadow duration-300 hover:shadow-[0_8px_20px_rgba(130,90,30,0.2)] cursor-default"
          >
            {tagBottomRight}
          </motion.div>
        </motion.div>

        {/* Founder portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center justify-end"
        >
          <img
            src="/about/Professional Portrait Cutout.png"
            alt="Craig Petersen — Founder and Builder of My Mentor"
            className="-translate-y-[36px] h-[360px] w-auto max-w-[280px] object-contain object-bottom pointer-events-none select-none drop-shadow-xl [mask-image:linear-gradient(to_bottom,#000_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_70%,transparent_100%)] xs:h-[420px] xs:max-w-[340px] sm:h-[500px] sm:max-w-[420px] md:h-[560px] md:max-w-[460px]"
            loading="eager"
            draggable={false}
          />
        </motion.div>
      </div>

      {/* Founder Name Brand: Craig */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        className="relative z-20 -mt-9 sm:-mt-8 text-center"
      >
        <h3 className="font-serif-heading italic font-normal text-2xl xs:text-3xl sm:text-4xl text-[#1C160E] tracking-tight">
          Craig Petersen
        </h3>
        <p className="font-sans text-xs sm:text-sm text-[#7D6B57] font-medium -mt-1">
          Owner and builder of My Mentor
        </p>
      </motion.div>
    </div>
  );
};
