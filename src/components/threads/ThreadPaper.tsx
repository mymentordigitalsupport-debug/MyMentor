"use client";

import { useId } from "react";
import { Pin, rng } from "@/components/layout/PushpinFooter";
import styles from "./ThreadsCommunity.module.css";

function outline(seed: number) {
  const random = rng(seed);
  const points: string[] = [];
  for (let i = 0; i <= 46; i++) points.push(`${i / 46 * 100}% ${random() * .7}%`);
  for (let i = 1; i <= 28; i++) points.push(`${99.7 + random() * .3}% ${i / 28 * 100}%`);
  for (let i = 45; i >= 0; i--) points.push(`${i / 46 * 100}% ${99.3 + random() * .7}%`);
  for (let i = 27; i > 0; i--) points.push(`${random() * .3}% ${i / 28 * 100}%`);
  return `polygon(${points.join(",")})`;
}

export function PaperSurface({ seed = 7, warm = false }: { seed?: number; warm?: boolean }) {
  return <span className={`${styles.paperSurface} ${warm ? styles.warmPaper : ""}`} style={{ clipPath: outline(seed) }} aria-hidden="true" />;
}

export function PaperPin({ className = "" }: { className?: string }) {
  const id = `community-pin-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return <span className={`${styles.pin} ${className}`} aria-hidden="true"><Pin base="#27503c" id={id} /></span>;
}

export function PaperTape({ className = "" }: { className?: string }) {
  return <span className={`${styles.tape} ${className}`} aria-hidden="true" />;
}

export function BotanicalSprig({ className = "" }: { className?: string }) {
  const id = `community-leaf-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return <svg className={`${styles.sprig} ${className}`} viewBox="0 0 140 170" fill="none" aria-hidden="true">
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2=".8"><stop stopColor="#c2c7a2" /><stop offset=".45" stopColor="#89966d" /><stop offset="1" stopColor="#536b43" /></linearGradient></defs>
    <path d="M58 168C69 134 75 101 63 20M67 123l39-37M70 101 35 73M65 77l24-31M70 143 34 116" stroke="#73815a" strokeWidth="2.2" strokeLinecap="round" />
    <g fill={`url(#${id})`}>
      <path d="M64 48C47 35 48 15 55 4c17 12 21 30 9 44Z" />
      <path d="M66 78c-1-24 12-41 30-45 0 23-9 38-30 45Z" />
      <path d="M70 102C46 99 30 84 25 65c26 1 41 13 45 37Z" />
      <path d="M72 118c7-24 22-34 44-33-5 22-19 34-44 33Z" />
      <path d="M68 141c-25-2-42-14-49-34 25-3 43 10 49 34Z" />
      <path d="M62 155c9-25 29-35 50-30-10 23-25 33-50 30Z" />
    </g>
    <g stroke="#d7ddbd" strokeWidth=".8" opacity=".75"><path d="M64 48 55 8M66 78l28-42M70 102 29 69M72 118l40-30M68 141l-45-31M62 155l46-27" /></g>
  </svg>;
}

export function CommunityTexture({ id }: { id: string }) {
  return <svg className={styles.textureDefinitions} aria-hidden="true"><defs>
    <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".76" numOctaves="3" stitchTiles="stitch" seed="42" /><feColorMatrix type="saturate" values="0" /></filter>
    <filter id={`${id}-fibres`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="3" stitchTiles="stitch" seed="7" /><feColorMatrix type="saturate" values="0" /></filter>
  </defs></svg>;
}

export function CommunityFooterTear() {
  const anchors = [[0, 73], [160, 88], [300, 39], [430, 27], [560, 62], [740, 93], [900, 52], [1050, 35], [1210, 77], [1330, 82], [1440, 70]];
  const random = rng(63);
  const points: [number, number][] = [];
  for (let x = 0; x <= 1440; x += 6) {
    const index = Math.max(1, anchors.findIndex((point) => point[0] >= x));
    const left = anchors[index - 1];
    const right = anchors[index];
    const amount = (x - left[0]) / (right[0] - left[0]);
    points.push([x, left[1] + (right[1] - left[1]) * amount + (random() - .5) * 6]);
  }
  const edge = points.reverse().map(([x, y]) => `L${x} ${y.toFixed(1)}`).join("");
  return <div className={styles.footerTear} aria-hidden="true"><svg viewBox="0 0 1440 110" preserveAspectRatio="none"><path d={`M0 -5H1440${edge}Z`} fill="#f6f3ed" /></svg></div>;
}

export function DemoAvatar({ variant }: { variant: "patrick" | "arjun" | "nadia" | "daniel" | "you" }) {
  if (variant !== "you") return <img className={styles.avatar} src={`/assets/images/threads-demo/${variant}.jpg`} alt="" width={29} height={29} loading="lazy" />;
  const [background, skin, hair, shirt] = ["#d4dfc9", "#d4a37b", "#4f3d2a", "#31563f"];
  return <svg className={styles.avatar} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill={background} /><path d="M3 32c0-8 5-12 13-12s13 4 13 12" fill={shirt} />
    <path d="M13 18h6v7h-6z" fill={skin} /><ellipse cx="16" cy="12" rx="7" ry="9" fill={skin} />
    <path d="M9 13c-3-12 14-16 14-2-5-1-9-7-14 2Z" fill={hair} /><circle cx="13" cy="13" r=".55" fill="#2b2522" /><circle cx="19" cy="13" r=".55" fill="#2b2522" /><path d="M14 17q2 1.5 4 0" fill="none" stroke="#875b4b" strokeWidth=".7" />
  </svg>;
}
