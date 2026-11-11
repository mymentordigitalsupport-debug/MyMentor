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

const books = [
  { id: 'leaders', title: 'From Addicts to Leaders', src: '/assets/images/books/From Addicts to leader.png', transform: 'translateX(calc(-1 * clamp(78px, 18vw, 250px))) translateY(28px) rotateY(18deg) rotateZ(-3deg) scale(.82)', zIndex: 1 },
  { id: 'uprooting', title: 'Uprooting Drug Abuse', src: '/assets/images/books/Uprooting drug abuse.png', transform: 'translateY(-18px) scale(1)', zIndex: 3 },
  { id: 'protecting', title: 'Protecting the Next Generation', src: '/assets/images/books/Protecting the next generation.png', transform: 'translateX(clamp(78px, 18vw, 250px)) translateY(28px) rotateY(-18deg) rotateZ(3deg) scale(.82)', zIndex: 1 },
] as const;

function LearnBook({ className }: { className: string }) {
  return (
    <div className={`relative select-none ${className}`} style={{ perspective: '1200px' }}>
      <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="relative mx-auto w-[230px] xs:w-[270px] sm:w-[350px] md:w-[400px]">
        <img src={books[1].src} alt="Uprooting Drug Abuse book cover" className="block h-auto w-full select-none object-contain drop-shadow-[0_24px_22px_rgba(35,22,12,0.28)]" loading="lazy" draggable={false} />
      </motion.div>
    </div>
  );
}

function StaticBookGroup({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-[330px] w-full max-w-[980px] sm:h-[390px] md:h-[520px] lg:h-[540px] ${className}`} aria-label="My Mentor book collection">
      <div className="absolute inset-x-0 bottom-4 h-8 bg-[radial-gradient(ellipse,rgba(45,28,15,0.22),transparent_70%)] blur-md sm:bottom-8" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1400px' }}>
        {books.map((book) => (
          <div key={book.id} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: book.zIndex }}>
            <div className="w-[clamp(200px,30vw,340px)]" style={{ transform: book.transform, transformStyle: 'preserve-3d', filter: book.zIndex === 3 ? 'drop-shadow(0 32px 24px rgba(35, 22, 12, 0.34))' : 'drop-shadow(0 20px 16px rgba(35, 22, 12, 0.22))' }}>
              <img src={book.src} alt={book.title} className="block h-auto w-full select-none object-contain" loading={book.zIndex === 3 ? 'eager' : 'lazy'} draggable={false} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const VoiceBook: React.FC<VoiceBookProps> = ({ variant = 'hero', className = '' }) => {
  if (variant === 'learn') return <LearnBook className={className} />;
  return <StaticBookGroup className={className} />;
};
