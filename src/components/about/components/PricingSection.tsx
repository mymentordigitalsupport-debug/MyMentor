import React from 'react';
import { ArrowRight, Check, Download } from 'lucide-react';

const plans = [
  {
    price: 'R29',
    label: 'Start with a teaser',
    title: 'Uprooting Drug Abuse',
    description: 'Explore the opening chapter and get a feel for the practical, faith-led journey inside the book.',
    features: ['Opening chapter access', 'A guided first step', 'Read before you commit'],
    href: '/register',
    featured: false,
  },
  {
    price: 'R79',
    label: 'Complete library',
    title: 'All three books',
    description: 'Download the complete My Mentor book collection and keep the guidance with you wherever you go.',
    features: ['All three books', 'Full access to every book', 'Download and read at your pace'],
    href: '/register',
    featured: true,
  },
] as const;

export function PricingSection() {
  return (
    <section id="pricing" className="relative z-10 bg-[#1F1710] px-4 py-20 text-[#FAF0E3] xs:px-6 sm:px-10 sm:py-28 md:px-16 lg:px-20">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-sans text-[10px] font-bold uppercase tracking-[.28em] text-[#E2C374]">Simple access</p>
          <h2 className="mt-4 font-serif-heading text-4xl font-normal italic tracking-tight sm:text-6xl">Choose your starting point</h2>
          <p className="mt-5 text-sm leading-7 text-[#FAF0E3]/70 sm:text-base">
            Start small with a teaser, or get the complete collection for one simple payment.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <article key={plan.price} className={`relative flex flex-col rounded-[28px] p-7 sm:p-9 ${plan.featured ? 'bg-[#FAF0E3] text-[#1F1710] shadow-[0_20px_55px_rgba(0,0,0,.28)]' : 'border border-[#FAF0E3]/20 bg-[#2B2118]'}`}>
              {plan.featured && <span className="absolute right-6 top-6 rounded-full bg-[#E2C374] px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#1F1710]">Best value</span>}
              <p className={`text-[10px] font-bold uppercase tracking-[.2em] ${plan.featured ? 'text-[#8B6D2D]' : 'text-[#E2C374]'}`}>{plan.label}</p>
              <div className="mt-5 flex items-end gap-2">
                <span className="font-display text-6xl font-black tracking-[-.07em]">{plan.price}</span>
                <span className={`pb-2 text-sm ${plan.featured ? 'text-[#5C5145]' : 'text-[#FAF0E3]/60'}`}>once-off</span>
              </div>
              <h3 className="mt-5 font-serif-heading text-3xl italic">{plan.title}</h3>
              <p className={`mt-3 text-sm leading-7 ${plan.featured ? 'text-[#5C5145]' : 'text-[#FAF0E3]/70'}`}>{plan.description}</p>
              <ul className="mt-6 space-y-3 border-t border-current/10 pt-6 text-sm">
                {plan.features.map((feature) => <li key={feature} className="flex items-center gap-3"><Check size={16} className={plan.featured ? 'text-[#8B6D2D]' : 'text-[#E2C374]'} aria-hidden="true" />{feature}</li>)}
              </ul>
              <a href={plan.href} className={`mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:-translate-y-0.5 ${plan.featured ? 'bg-[#1F1710] text-[#FAF0E3] hover:bg-[#3A2B1E]' : 'border border-[#E2C374]/60 text-[#FAF0E3] hover:bg-[#E2C374] hover:text-[#1F1710]'}`}>
                <Download size={16} aria-hidden="true" /> Get started <ArrowRight size={16} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
        <p className="mt-7 text-center text-xs leading-6 text-[#FAF0E3]/50">Create an account to choose your payment option. Your access is unlocked after payment confirmation.</p>
      </div>
    </section>
  );
}
