import React from 'react';
import { motion } from 'framer-motion';
import { CTAButton } from './CTAButton';
import { CertificateCard } from './CertificateCard';
import { MY_MENTOR_DATA } from '../data/landingData';

interface TestimonialSectionProps {
  onSignUp?: () => void;
  onExploreBooks?: () => void;
}

export const TestimonialSection: React.FC<TestimonialSectionProps> = ({ onSignUp, onExploreBooks }) => {
  const handleExplore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExploreBooks) {
      onExploreBooks();
    } else {
      const el = document.getElementById('books');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="mission" className="relative w-full bg-[#FAF0E3] z-30">
      <div className="relative w-full min-h-[85vh] sm:min-h-screen flex flex-col justify-center items-center bg-[#070707] text-white py-20 sm:py-28 md:py-36 px-4 xs:px-6 sm:px-10 md:px-16 overflow-hidden rounded-b-[25px] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Background subtle star / dot grid pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative z-10 max-w-[1360px] mx-auto w-full flex flex-col items-center">
        {/* Three Certificate Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 w-full max-w-5xl mx-auto justify-items-center mb-16 sm:mb-20">
          {MY_MENTOR_DATA.courses.slice(0, 3).map((course, idx) => (
            <CertificateCard
              key={course.id}
              courseNumber={course.courseNumber}
              title={course.title}
              subtitle={course.subtitle}
              description={course.description}
              authorName="Craig Petersen"
            />
          ))}
        </div>

        {/* Quote & Description Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto text-center flex flex-col items-center"
        >
          {/* Quote */}
          <h2 className="font-serif-heading italic font-normal text-3xl xs:text-4xl sm:text-5xl md:text-[52px] leading-[1.15] text-[#F5E4BE] tracking-tight mb-6">
            “Because transformation should never be walked alone.”
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-neutral-300 leading-relaxed font-sans font-light mb-10 max-w-2xl">
            {MY_MENTOR_DATA.brand.missionStatement}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <CTAButton
              id="testimonial-signup-btn"
              variant="gold-rect"
              icon="sparkles"
              onClick={onSignUp}
              className="w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-semibold shadow-lg"
            >
              Sign up
            </CTAButton>
            <CTAButton
              id="testimonial-explore-btn"
              variant="white-pill"
              icon="book"
              onClick={handleExplore}
              href="#books"
              className="w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm border border-white/20 bg-white/10 hover:bg-white/20 text-white"
            >
              Explore the books
            </CTAButton>
          </div>
        </motion.div>
      </div>
      </div>
    </section>
  );
};
