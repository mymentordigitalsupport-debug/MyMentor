import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CTAButton } from './CTAButton';
import { VoiceBook } from './VoiceBook';
import {
  CheckCircle2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Compass,
  ArrowRight,
  Bookmark,
  X,
  Star,
} from 'lucide-react';

interface GiftSectionProps {
  onSignUp?: (courseId?: string) => void;
}

export const GiftSection: React.FC<GiftSectionProps> = ({ onSignUp }) => {
  const [showExcerptModal, setShowExcerptModal] = useState(false);

  const bulletPoints = [
    {
      id: 'denial',
      title: 'Disarming Denial & The False Refuge',
      description:
        'Confronts internal rationalizations with unflinching honesty and radical grace.',
    },
    {
      id: 'routine',
      title: 'The 24-Hour Routine Architecture',
      description:
        'Replaces chaotic idle hours with calibrated morning, midday, and evening anchors.',
    },
    {
      id: 'urge-surfing',
      title: 'The 10-Minute Urge-Surfing Protocol',
      description:
        'A field-tested sequence to ride out intense neurological cravings without giving in.',
    },
    {
      id: 'restitution',
      title: 'Restitution Without Self-Pity',
      description:
        'A step-by-step roadmap for rebuilding shattered trust and shedding toxic shame.',
    },
    {
      id: 'triggers',
      title: 'Identifying Triggers & Breaking Old Patterns',
      description: 'Recognize the situations and habits that can undermine recovery.',
    },
    {
      id: 'support',
      title: 'Building a Trusted Support Network',
      description: 'Choose trusted people who can offer honest support and accountability.',
    },
    {
      id: 'pressure',
      title: 'Preparing for High-Pressure Moments',
      description: 'Create a practical action plan for difficult moments and setbacks.',
    },
    {
      id: 'leadership',
      title: 'From Survival to Community Leadership',
      description:
        'Turn past scars into wisdom that guides and strengthens others.',
    },
  ];

  return (
    <section
      id="books"
      className="relative w-full select-none -mt-10 xs:-mt-12 sm:-mt-18 md:-mt-24 pt-16 xs:pt-20 sm:pt-28 md:pt-36 pb-14 xs:pb-16 sm:pb-24 md:pb-32 min-h-[75vh] sm:min-h-screen flex flex-col justify-center items-center bg-[#7A9272] rounded-b-[25px] shadow-[0_16px_40px_rgba(0,0,0,0.08)] z-10 overflow-hidden text-white"
    >
      <div className="w-full max-w-[1360px] mx-auto px-4 xs:px-6 sm:px-10 md:px-16 relative z-10">
        {/* Section Header: What You'll Learn */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif-heading italic font-normal text-3xl xs:text-4xl sm:text-5xl md:text-[52px] text-white tracking-tight"
          >
            What You’ll Learn
          </motion.h2>
        </div>

        {/* Two-Column Grid: Book on Left, Connected Pill Cards on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left Column: Book Image */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex flex-col items-center justify-center relative"
          >
            <div aria-hidden="true" className="pointer-events-none absolute left-[calc(50%+180px)] right-[-77px] top-1/2 hidden h-[2px] -translate-y-1/2 bg-white/70 lg:block" />
            <div
              className="relative cursor-pointer py-4 sm:py-6"
              onClick={() => setShowExcerptModal(true)}
            >
              <VoiceBook variant="learn" authorName="Craig" />
            </div>
          </motion.div>

          {/* Right Column: Connected Pill Cards with Tree Line Structure */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 flex flex-col justify-center gap-3.5 sm:gap-4 relative pl-8 lg:pl-5"
          >
            {/* Incoming line and center junction. */}
            <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
              <div className="absolute left-[13px] top-1/2 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md" />
            </div>

            {bulletPoints.map((point, index) => (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 * index }}
                className="relative flex items-center"
              >
                {/* The trunk curves into the first and last cards. */}
                {index === 0 ? (
                  <div aria-hidden="true" className="absolute -left-2 top-1/2 -bottom-2 hidden w-2 rounded-tl-[8px] border-l-2 border-t-2 border-white/70 lg:block" />
                ) : index === bulletPoints.length - 1 ? (
                  <div aria-hidden="true" className="absolute -left-2 -top-2 bottom-1/2 hidden w-2 rounded-bl-[8px] border-b-2 border-l-2 border-white/70 lg:block" />
                ) : (
                  <>
                    <div aria-hidden="true" className="absolute -left-2 -top-2 -bottom-2 hidden w-[2px] bg-white/70 lg:block" />
                    <div aria-hidden="true" className="absolute -left-2 hidden h-[2px] w-2 bg-white/70 lg:block" />
                  </>
                )}

                {/* Pill Card */}
                <div 
                  onClick={() => setShowExcerptModal(true)}
                  className="flex-1 bg-white text-[#2C2319] px-6 py-3.5 sm:py-4 rounded-[9px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-lg transition-all cursor-pointer border border-white/80 hover:border-[#E5C175] group"
                >
                  <p className="text-xs sm:text-sm md:text-[15px] font-medium text-[#2C2319] group-hover:text-[#8C6D2D] transition-colors">
                    {point.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Chapter 1 Excerpt Modal */}
      <AnimatePresence>
        {showExcerptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl bg-[#FAF0E3] text-[#1C160E] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EADBCA] max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowExcerptModal(false)}
                className="absolute top-4 right-4 p-2 text-[#5A4F42] hover:text-black rounded-full hover:bg-black/5 transition-colors"
                aria-label="Close excerpt"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C160E]/5 border border-[#1C160E]/10 text-[#785E2F] text-[10px] uppercase tracking-widest font-semibold mb-3">
                <Bookmark className="w-3 h-3 text-[#785E2F]" />
                <span>Chapter 1 Excerpt</span>
              </div>

              <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#1C160E]">
                The Illusion of Control & The Anatomy of Bondage
              </h3>
              <p className="text-xs text-[#7A6E5F] mt-1 font-mono">
                From My Mentor: Transformation • By Craig
              </p>

              <div className="mt-5 space-y-3.5 text-xs sm:text-sm text-[#382D22] leading-relaxed font-serif">
                <p>
                  “Every person in bondage believes a private lie: <em>I can stop whenever I decide to.</em> Denial is not the absence of intelligence; it is an emotional fortress built to protect us from looking at the destruction we are causing.
                </p>
                <p>
                  We don’t begin to heal when someone shouts at us. We heal when the pain of continuing in the lie becomes heavier than the fear of facing the truth.
                </p>
                <p>
                  Transformation is not a sudden flash of perfection. It is waking up tomorrow morning, acknowledging where we are broken without self-pity, and taking one structured action before lunch.
                </p>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-white border border-[#E5D7C5]">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#8C6D2D] mb-1">
                  Chapter 1 Daily Action Protocol:
                </h5>
                <p className="text-xs sm:text-[13px] text-[#1E1A16]">
                  Write down the exact physical cost of your last slip—who was hurt, what was spent, and what was lost. Place it where you will see it before making your first decision of the day.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-between">
                <button
                  onClick={() => setShowExcerptModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#5A4F42] hover:text-black rounded-lg hover:bg-black/5 transition-colors"
                >
                  Close Preview
                </button>

                <CTAButton
                  id="modal-book-cta"
                  variant="gold-rect"
                  icon="sparkles"
                  onClick={() => {
                    setShowExcerptModal(false);
                    onSignUp && onSignUp('uprooting-drug-abuse');
                  }}
                  className="px-5 py-2 text-xs sm:text-sm"
                >
                  Get Complete Access
                </CTAButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
