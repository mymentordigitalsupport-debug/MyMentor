import React from 'react';
import { BookOpen, Gift } from 'lucide-react';

export type ButtonVariant = 'white-pill' | 'dark-rect' | 'gold-rect' | 'dark-gold-border';

interface CTAButtonProps {
  variant: ButtonVariant;
  icon?: 'sparkles' | 'gift' | 'book';
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  id?: string;
  href?: string;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  variant,
  icon,
  children,
  onClick,
  className = '',
  id,
  href = '#offer',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
      return;
    }
    
    // If it's an in-page anchor link and no custom modal action interrupted it
    if (href && href.startsWith('#') && href.length > 1) {
      const targetElement = document.querySelector(href);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }
  };

  const iconNode =
    icon === 'sparkles' ? (
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5 text-current fill-current transition-transform duration-300 group-hover:rotate-12"
      >
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
    ) : icon === 'gift' ? (
      <Gift className="w-3.5 h-3.5 text-current stroke-[2.2] transition-transform duration-300 group-hover:-rotate-6" />
    ) : icon === 'book' ? (
      <BookOpen className="w-3.5 h-3.5 text-current" />
    ) : null;

  const baseStyles =
    "group inline-flex items-center justify-center gap-1.5 sm:gap-2 font-sans font-medium transition-all duration-300 ease-out cursor-pointer select-none active:scale-[0.96] active:translate-y-0.5";

  let variantStyles = "";

  switch (variant) {
    case 'white-pill':
      variantStyles =
        "bg-white text-[#1E1A17] text-[11px] xs:text-xs sm:text-[13px] px-3 xs:px-3.5 sm:px-5 py-1.5 xs:py-2 sm:py-2.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(142,110,45,0.18)] hover:-translate-y-0.5 border border-black/5 whitespace-nowrap";
      break;
    case 'dark-rect':
      variantStyles =
        "bg-[#181818] text-white text-xs sm:text-sm font-medium px-4 xs:px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:bg-black hover:shadow-[0_8px_25px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 border border-white/10 whitespace-nowrap";
      break;
    case 'gold-rect':
      variantStyles =
        "bg-gradient-to-b from-[#E5C677] to-[#C89F43] text-[#1A140C] text-xs sm:text-sm font-semibold px-4 xs:px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-[0_4px_16px_rgba(200,159,67,0.25)] hover:shadow-[0_8px_26px_rgba(200,159,67,0.4)] hover:brightness-105 hover:-translate-y-0.5 border border-[#F4DC98]/40 whitespace-nowrap";
      break;
    case 'dark-gold-border':
      variantStyles =
        "bg-[#161616] text-white text-xs sm:text-sm font-medium px-4 xs:px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.25)] border border-[#DEBA66]/60 hover:border-[#DEBA66] hover:shadow-[0_6px_22px_rgba(222,186,102,0.22)] hover:-translate-y-0.5 whitespace-nowrap";
      break;
  }

  return (
    <a
      id={id}
      href={href}
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {iconNode}
      <span>{children}</span>
    </a>
  );
};
