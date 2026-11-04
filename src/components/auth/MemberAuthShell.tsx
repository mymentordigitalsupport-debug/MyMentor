import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sprout } from "lucide-react";
import { PublicNavigation } from "@/components/landing/PublicNavigation";

function Brand() {
  return (
    <Link href="/" className="login-brand" aria-label="MyMentor home">
      <Image src="/assets/images/favicon.png" alt="" width={38} height={43} priority />
      <span>MyMentor</span>
    </Link>
  );
}

function LeafSprig({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 150 235" fill="none" aria-hidden="true">
      <path d="M125 225C105 173 48 122 47 22" stroke="#82926a" strokeWidth="2.4" />
      <path d="M49 76C17 62 13 30 22 5C44 24 57 45 49 76Z" fill="#a5ad7b" />
      <path d="M60 117C27 116 7 95 4 69C34 75 54 90 60 117Z" fill="#879568" />
      <path d="M69 137C89 106 88 82 83 60C60 78 54 108 69 137Z" fill="#677f55" />
      <path d="M87 170C53 170 33 152 26 129C55 129 77 145 87 170Z" fill="#a2ad79" />
      <path d="M96 187C115 162 117 136 112 114C91 128 85 159 96 187Z" fill="#98a76d" />
      <path d="M111 203C81 189 62 192 47 207C72 219 94 214 111 203Z" fill="#788a5b" />
      <path d="M23 12L48 75M9 73L59 116M82 67L69 135M31 132L86 169M110 120L96 186M52 207L110 203" stroke="#d4d3a4" strokeOpacity=".48" />
    </svg>
  );
}

export function MemberAuthShell({ children, mode = "login" }: { children: ReactNode; mode?: "login" | "register" }) {
  const isRegister = mode === "register";

  return (
    <main className={`member-login${isRegister ? " member-register" : ""}`}>
      <PublicNavigation overDark />

      <div className="login-scene">
        <div className="login-side-note login-side-note--left" aria-hidden="true">
          <svg viewBox="0 0 110 55" fill="none"><path d="M5 45C30 14 69 13 97 27M81 9L99 27L76 30" /></svg>
          <span>Learn<br />Share<br />Get guidance<br />Grow.</span>
        </div>

        <section className="login-paper" aria-labelledby="login-title">
          <span className="login-tape" aria-hidden="true" />
          <div className="login-paper-content">
            <Brand />
            <div className="login-intro">
              <span className="login-emphasis" aria-hidden="true"><i /><i /><i /></span>
              <h1 id="login-title">{isRegister ? "Join MyMentor" : "Welcome back"}</h1>
              <svg className="login-heading-underline" viewBox="0 0 200 20" fill="none" aria-hidden="true"><path d="M3 10C53 0 139 0 197 7M24 17C72 6 136 7 185 11" /></svg>
              <p>{isRegister ? "A place to learn, grow, and take your next step." : "Continue your learning journey with a community that grows with you."}</p>
            </div>
            {children}
          </div>
          <LeafSprig className="login-leaves login-leaves--paper" />
        </section>

        <div className="login-photo-wrap">
          <div className="login-photo-border">
            <div className="login-photo">
              <Image src="/assets/images/member-login-mentoring.webp" alt="A mentor and a young learner sharing ideas over a laptop in a sunlit library" fill sizes="(max-width: 760px) 100vw, 55vw" className="login-photo-image" priority quality={90} />
            </div>
          </div>
          <aside className="login-pinned-note">
            <span className="login-pushpin" aria-hidden="true" />
            <p>{isRegister ? <>A fresh start.<br />A little guidance.<br />Your own pace.</> : <>Different<br />perspectives.<br />A kinder internet.<br />Real progress.</>}</p>
            <span className="login-note-line" aria-hidden="true" />
          </aside>
          <div className="login-photo-rays" aria-hidden="true"><i /><i /><i /></div>
          <div className="login-photo-caption">
            <Sprout size={37} strokeWidth={1.7} aria-hidden="true" />
            <p>{isRegister ? <>Every journey starts<br /><span>with a little courage.</span></> : <>Learn, grow, and make<br /><span>progress together.</span></>}</p>
            <svg viewBox="0 0 150 16" fill="none" aria-hidden="true"><path d="M3 10C48 0 95 0 147 9M19 15C57 6 98 6 138 13" /></svg>
          </div>
        </div>

        <div className="login-side-note login-side-note--right" aria-hidden="true">
          <svg viewBox="0 0 145 90" fill="none"><path d="M2 53C40 14 20 112 59 64S112 2 143 5" /></svg>
          <span>People<br />Ideas<br />Growth<br />Together.</span>
        </div>
      </div>
      <LeafSprig className="login-leaves login-leaves--bottom" />
      <div className="login-bottom-paper" aria-hidden="true" />
    </main>
  );
}
