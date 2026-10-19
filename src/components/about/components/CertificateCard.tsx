import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Award } from 'lucide-react';

interface CertificateCardProps {
  title: string;
  subtitle: string;
  courseNumber: string;
  description: string;
  authorName?: string;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  title,
  subtitle,
  courseNumber,
  description,
  authorName = 'Craig Peterson',
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative w-full max-w-[340px] aspect-[1.35/1] bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E8] to-[#F3E7D3] rounded-2xl p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)] border-2 border-[#D4AF37] flex flex-col justify-between select-none pointer-events-none group"
    >
      {/* Inner ornamental foil border */}
      <div className="absolute inset-2 border border-[#C5A059]/40 rounded-xl pointer-events-none" />
      <div className="absolute inset-3 border border-dashed border-[#C5A059]/30 rounded-lg pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-[#1A1611] flex items-center justify-center text-[#E5C175] text-[10px] font-bold">
            M
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C6D2D]">
            My Mentor Certificate
          </span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#8C6D2D]/15 text-[#8C6D2D] uppercase">
          Course {courseNumber}
        </span>
      </div>

      {/* Center Title & Seal */}
      <div className="text-center relative z-10 my-2">
        <div className="w-10 h-10 mx-auto mb-1.5 rounded-full bg-gradient-to-b from-[#E7C77E] via-[#BA913C] to-[#8C681D] p-[1.5px] shadow-sm flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#1A1814] flex items-center justify-center text-[#E5C175]">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <h3 className="font-serif-heading font-bold text-base sm:text-lg text-[#1C160E] leading-tight uppercase tracking-wide">
          {title}
        </h3>
        <p className="font-sans text-[10px] text-[#7A6E5F] mt-0.5 italic">
          {subtitle}
        </p>
      </div>

      {/* Bottom Signatures / Seal */}
      <div className="flex items-end justify-between pt-2 border-t border-[#D4AF37]/30 relative z-10 text-left">
        <div>
          <p className="font-serif-heading italic font-normal text-xs text-[#1C160E]">
            {authorName}
          </p>
          <p className="text-[8px] uppercase tracking-wider text-[#8C6D2D]">
            Founder & Instructor
          </p>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-bold text-[#8C6D2D] bg-[#D4AF37]/10 px-2 py-1 rounded-full border border-[#D4AF37]/30">
          <Award className="w-3 h-3" />
          <span>Verified Seal</span>
        </div>
      </div>
    </motion.div>
  );
};
