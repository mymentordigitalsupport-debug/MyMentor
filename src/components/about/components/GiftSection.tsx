import React from 'react';

interface GiftSectionProps {
  onSignUp?: (courseId?: string) => void;
}

const lessons = [
  'Lesson 1: God’s Original Design for Humanity',
  'Lesson 2: Created in the Image of God',
  'Lesson 3: The Purpose of Life',
  'Lesson 4: The Garden of Eden',
  'Lesson 5: Freedom, Choice, and Responsibility',
  'Lesson 6: The First Temptation',
  'Lesson 7: The Fall of Man',
  'Lesson 8: The Consequences of Disobedience',
  'Lesson 9: God’s Creation and the Plant Kingdom',
  'Lesson 10: Understanding the Origins of Drug Abuse',
] as const;

export const GiftSection: React.FC<GiftSectionProps> = () => {
  return (
    <section id="books" className="relative z-10 -mt-10 flex w-full flex-col items-center bg-[#FAF0E3] px-4 pb-16 pt-20 text-[#1F1710] xs:px-6 xs:pt-24 sm:-mt-14 sm:px-10 sm:pb-24 sm:pt-32 md:px-16 md:pb-32 lg:px-20">
      <div className="w-full max-w-[1280px]">
        <div className="px-1 py-2 xs:px-2 sm:px-4 lg:px-6">
          <div>
            <h2 className="mb-9 text-center font-serif-heading text-4xl font-normal italic tracking-tight text-[#1F1710] xs:text-5xl sm:mb-12 sm:text-6xl lg:text-[68px]">
              What You’ll Learn
            </h2>

            <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,40%)_minmax(0,1fr)] lg:gap-10">
              <svg className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full lg:block" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
                <path d="M 355 310 C 382 310, 412 310, 440 310" fill="none" stroke="#A79568" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="440" cy="310" r="5" fill="#879577" />
              </svg>

              <div className="relative z-10 flex min-h-[310px] items-center justify-center sm:min-h-[440px] lg:min-h-[620px]">
                <div className="absolute bottom-[10%] h-8 w-[72%] rounded-[100%] bg-[#9F8A61]/35 blur-xl" aria-hidden="true" />
                <img
                  src="/assets/images/books/Uprooting drug abuse.png"
                  alt="Uprooting Drug Abuse book cover"
                  className="relative z-10 block h-auto w-[min(82%,410px)] select-none object-contain drop-shadow-[0_26px_20px_rgba(49,37,21,0.30)]"
                  draggable={false}
                />
              </div>

              <div className="relative z-10 mx-auto w-full max-w-[680px] pl-7 sm:pl-10 lg:pl-12">
                <div className="absolute bottom-5 left-0 top-5 w-px bg-[#A79568]/70" aria-hidden="true" />
                <div className="absolute left-[-5px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#879577] shadow-[0_0_0_5px_rgba(135,149,119,0.14)]" aria-hidden="true" />

                <ol className="space-y-3 sm:space-y-3.5">
                  {lessons.map((lesson) => (
                    <li key={lesson} className="relative">
                      <span className="absolute -left-7 top-1/2 h-px w-7 -translate-y-1/2 bg-[#A79568]/70 sm:-left-10 sm:w-10 lg:-left-12 lg:w-12" aria-hidden="true" />
                      <div className="rounded-2xl bg-[#FFFDF8] px-5 py-4 shadow-[0_8px_18px_rgba(7,20,12,0.14)] sm:px-6 sm:py-[18px]">
                        <p className="text-sm font-medium leading-snug text-[#243426] sm:text-[15px] lg:text-base">{lesson}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
