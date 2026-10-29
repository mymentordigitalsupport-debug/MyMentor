"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowDown, ArrowRight, BookOpen, Brain, BriefcaseBusiness, Heart, Leaf, MessageCircle, Search, Users } from "lucide-react";
import { PublicNavigation } from "@/components/landing/PublicNavigation";
import { easeTear, Pin, rng } from "@/components/layout/PushpinFooter";
import styles from "./ThreadsHero.module.css";

const topics = [
  { label: "Mindset", icon: Brain },
  { label: "Career", icon: BriefcaseBusiness },
  { label: "Learning", icon: BookOpen },
  { label: "Life", icon: Leaf },
  { label: "Community", icon: Users },
];

const starters = [
  { topic: "Mindset", title: "How do you stay consistent when motivation fades?", body: "I’ve been struggling to keep up with my goals lately. What routines or mindset shifts have helped you stay consistent over time?", icon: Brain },
  { topic: "Career", title: "Switching careers at 30+ — is it worth it?", body: "For those who made a career switch later in life, how did you handle the uncertainty? Would love to hear your experiences and advice.", icon: BriefcaseBusiness },
  { topic: "Learning", title: "Best resources to learn web development in 2026?", body: "Looking for up-to-date, beginner-friendly resources. Open to free and paid options. What actually worked for you?", icon: BookOpen },
  { topic: "Life", title: "How do you deal with self-doubt?", body: "Some days I feel like I’m not doing enough. Would love to hear how you manage self-doubt and stay kind to yourself.", icon: Leaf },
];

// Seeded fibre edges keep server and browser renders identical.
function paperOutline(seed: number) {
  const random = rng(seed);
  const points: string[] = [];
  for (let i = 0; i <= 28; i++) points.push(`${(i / 28 * 100).toFixed(2)}% ${(random() * 1.1).toFixed(2)}%`);
  for (let i = 1; i <= 28; i++) points.push(`${(99 + random()).toFixed(2)}% ${(i / 28 * 100).toFixed(2)}%`);
  for (let i = 27; i >= 0; i--) points.push(`${(i / 28 * 100).toFixed(2)}% ${(99 + random()).toFixed(2)}%`);
  for (let i = 27; i > 0; i--) points.push(`${(random() * 1.1).toFixed(2)}% ${(i / 28 * 100).toFixed(2)}%`);
  return `polygon(${points.join(",")})`;
}

function tearPoints(offset: number, seed: number) {
  const random = rng(seed);
  const anchors = [[0, 124], [65, 135], [210, 82], [375, 15], [465, 55], [605, 74], [733, 119], [879, 57], [939, 65], [1080, 103], [1196, 111], [1360, 63], [1440, 84], [1530, 115], [1640, 145], [1672, 141]];
  const points: [number, number][] = [];
  for (let x = 0; x <= 1672; x += 6) {
    const index = anchors.findIndex((point) => point[0] >= x);
    const right = anchors[Math.max(1, index)];
    const left = anchors[Math.max(0, index - 1)];
    const t = (x - left[0]) / (right[0] - left[0]);
    const y = left[1] + (right[1] - left[1]) * t + (random() - .5) * 6 + Math.sin(x * .095) * 1.7 + offset;
    points.push([x, y]);
  }
  return points;
}

function tearPath(points: [number, number][], progress = 1) {
  let path = "M0 180";
  for (const [x, targetY] of points) {
    // The footer's tear easing and outward delay: the centre opens first,
    // followed by a small overshoot as the fibres at each edge settle.
    const lag = Math.abs(x / 1672 - .5) * .8 + .04;
    const y = progress >= 1 ? targetY : 180 + (targetY - 180) * easeTear((progress - lag) / .5);
    path += `L${x} ${y.toFixed(2)}`;
  }
  return `${path}L1672 180Z`;
}

const tearLayers = [tearPoints(-9, 16), tearPoints(-3, 16), tearPoints(27, 28)];
const settledTears = tearLayers.map((points) => tearPath(points));

function useHeroEntrance() {
  const root = useRef<HTMLElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const [entry, setEntry] = useState<"pending" | "playing" | "complete">("pending");

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    let timer = 0;
    let frame = 0;
    let started = false;

    const settle = () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      observer?.disconnect();
      paths.current.forEach((path, index) => path?.setAttribute("d", settledTears[index]));
      setEntry("complete");
    };

    const begin = () => {
      if (started) return;
      started = true;
      observer?.disconnect();
      if (motion.matches) return settle();

      paths.current.forEach((path, index) => path?.setAttribute("d", tearPath(tearLayers[index], 0)));
      setEntry("playing");
      // Match the footer: chrome assembles, the pin drops at 640ms,
      // then its impact at 1140ms starts the 1550ms paper tear.
      timer = window.setTimeout(() => {
        const start = performance.now();
        const draw = (now: number) => {
          const progress = Math.min(1, (now - start) / 1550);
          paths.current.forEach((path, index) => path?.setAttribute("d", tearPath(tearLayers[index], progress)));
          if (progress < 1) frame = requestAnimationFrame(draw);
          else settle();
        };
        frame = requestAnimationFrame(draw);
      }, 1140);
    };

    const onMotionChange = () => { if (motion.matches) settle(); };
    motion.addEventListener("change", onMotionChange);
    if (motion.matches) settle();
    else if (typeof IntersectionObserver === "undefined") begin();
    else {
      observer = new IntersectionObserver(([intersection]) => {
        if (intersection.isIntersecting) begin();
      }, { threshold: .08 });
      observer.observe(element);
    }

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      observer?.disconnect();
      motion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return { root, paths, entry };
}

function PaperTextures({ id }: { id: string }) {
  return <svg className={styles.textureDefinitions} aria-hidden="true"><defs>
    <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".76" numOctaves="3" stitchTiles="stitch" seed="42" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <filter id={`${id}-fibres`} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".065" numOctaves="3" stitchTiles="stitch" seed="7" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
  </defs></svg>;
}

function Sprig() {
  return <svg className={styles.sprig} viewBox="0 0 180 150" fill="none" aria-hidden="true">
    <defs><linearGradient id="threads-leaf" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c0c8a2" /><stop offset="1" stopColor="#657a59" /></linearGradient></defs>
    <path d="M90 148c-3-40-5-78 18-125M88 109 39 60m51 61 43-51" stroke="#aab591" strokeWidth="3" />
    <path d="M84 101C57 100 38 80 30 52c28-1 51 18 54 49Z" fill="url(#threads-leaf)" />
    <path d="M94 75c-4-32 10-56 29-65 6 31-7 54-29 65Z" fill="url(#threads-leaf)" />
    <path d="M94 117c9-31 30-43 56-43-7 28-27 43-56 43Z" fill="url(#threads-leaf)" />
    <path d="M84 101 35 56m59 19 27-61m-27 103 53-40" stroke="#e0e3c9" strokeOpacity=".6" />
    <path d="m52 73 1-15m10 27 2-20m42-17 12-2m-17 14 13-1m-1 42 1-13m10 5 1-11" stroke="#d7ddbf" strokeOpacity=".4" />
  </svg>;
}

type ThreadsHeroProps = {
  searchValue?: string;
  onSearch: (query: string) => void;
  onStartConversation: (prompt: string) => void;
};

export function ThreadsHero({ searchValue, onSearch, onStartConversation }: ThreadsHeroProps) {
  const { root, paths, entry } = useHeroEntrance();
  const id = `threads-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  useEffect(() => {
    if (searchValue !== undefined) {
      setQuery(searchValue);
      setActiveTopic(topics.some((topic) => topic.label === searchValue) ? searchValue : "");
    }
  }, [searchValue]);
  const [grain, setGrain] = useState("");
  useEffect(() => {
    // Same fine, transparent grain tile as PushpinFooter, rather than dot patterns.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 160;
    const context = canvas.getContext("2d");
    if (!context) return;
    const pixels = context.createImageData(160, 160);
    const random = rng(42);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const value = random() < .5 ? 0 : 255;
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
      pixels.data[i + 3] = Math.floor(random() * 46);
    }
    context.putImageData(pixels, 0, 0);
    setGrain(canvas.toDataURL());
  }, []);
  const textureStyle = {
    "--threads-grain": `url(#${id}-grain)`,
    "--threads-fibres": `url(#${id}-fibres)`,
    "--threads-grain-tile": grain ? `url(${grain})` : "none",
  } as CSSProperties;

  function search(event: FormEvent) {
    event.preventDefault();
    setActiveTopic("");
    onSearch(query.trim());
  }

  return <section ref={root} className={styles.hero} style={textureStyle} data-entry={entry} aria-labelledby="threads-hero-title">
    <PaperTextures id={id} />
    <div className={styles.greenBoard}>
      <div className={styles.navigation}><PublicNavigation brandLabel="MyMentor" /></div>
      <div className={styles.copy}>
        <p className={styles.eyebrow}><span />Threads<span /></p>
        <h1 id="threads-hero-title" className={styles.title}>Threads that<br /><span>move <span className={styles.you}>you</span> <span className={styles.underlined}>forward<svg viewBox="0 0 285 18" preserveAspectRatio="none" aria-hidden="true"><path d="M3 13C78-2 191-1 280 8M15 17C94 6 187 3 269 11" /></svg></span></span></h1>
        <p className={styles.description}>A community for real conversations. Ask questions, share experiences,<br className={styles.desktopBreak} /> learn from others, and get guidance on what matters to you.</p>
        <form onSubmit={search} className={styles.search} role="search" aria-label="Search community threads">
          <Search size={23} strokeWidth={1.8} aria-hidden="true" />
          <label htmlFor="threads-hero-search" className="sr-only">Search threads, topics or questions</label>
          <input id="threads-hero-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search threads, topics or questions..." maxLength={200} />
          <button type="submit" aria-label="Search threads"><ArrowRight size={23} /></button>
        </form>
        <nav className={styles.topics} aria-label="Thread topics">{topics.map(({ label, icon: Icon }) => <button key={label} type="button" aria-pressed={activeTopic === label} onClick={() => {
          const next = activeTopic === label ? "" : label;
          setActiveTopic(next);
          setQuery(next);
          onSearch(next);
        }}><Icon size={21} strokeWidth={1.7} /><span>{label}</span></button>)}</nav>
      </div>

      <div className={styles.leftScribble} aria-hidden="true"><svg viewBox="0 0 100 46"><path d="M7 21c26-11 47-7 70 11m-10-21 12 22-26-2" /></svg><span>Better<br />questions.<br />Brighter<br />paths.</span></div>
      <aside className={styles.pinnedNote} aria-label="Our community promise">
        <div className={styles.noteSurface} style={{ clipPath: paperOutline(31) }} />
        <span className={styles.notePin} aria-hidden="true"><Pin base="#244d39" id={`${id}-promise-pin`} /></span>
        <p>Different<br />perspectives.<br />A kinder internet.<br />Real progress.</p>
        <svg className={styles.noteUnderline} viewBox="0 0 80 18" aria-hidden="true"><path d="M3 13Q38 2 76 4" /></svg>
      </aside>
      <svg className={styles.noteRays} viewBox="0 0 42 55" aria-hidden="true"><path d="m5 9 17 5M2 28l18-3M10 48l14-12" /></svg>
      <svg className={styles.looseThread} viewBox="0 0 160 100" aria-hidden="true"><path d="M0 18c65-28 10 65 49 37S131-9 158 3" /></svg>
      <p className={styles.rightScribble} aria-hidden="true">People<br />Ideas<br />Growth<br />Together.<svg viewBox="0 0 100 32"><path d="m6 27 83-20" /></svg></p>

      <div className={styles.tear} aria-hidden="true"><svg viewBox="0 0 1672 160" preserveAspectRatio="none">
        <defs><linearGradient id={`${id}-fold`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#e8e7e4" /><stop offset=".45" stopColor="#d5d5d1" /><stop offset="1" stopColor="#f6f3ed" /></linearGradient></defs>
        <path ref={(path) => { paths.current[0] = path; }} d={settledTears[0]} fill="#fffefa" />
        <path ref={(path) => { paths.current[1] = path; }} d={settledTears[1]} fill={`url(#${id}-fold)`} />
        <path ref={(path) => { paths.current[2] = path; }} d={settledTears[2]} fill="#f6f3ed" />
      </svg></div>
    </div>

    <div className={styles.starterBoard}>
      <Sprig />
      <div className={styles.starterGrid} aria-label="Conversation starters">{starters.map(({ topic, title, body, icon: Icon }, index) => <article className={styles.starter} key={topic} style={{ "--entry-index": index } as CSSProperties}>
        <div className={styles.noteSurface} style={{ clipPath: paperOutline(index + 10) }} />
        {(index === 0 || index === 3) && <span className={styles.cardPin} aria-hidden="true"><Pin base="#244d39" id={`${id}-card-pin-${index}`} /></span>}
        {index === 2 && <span className={styles.tape} aria-hidden="true" />}
        <div className={styles.starterContent}>
          <div className={styles.cardMeta}><span><Icon size={21} strokeWidth={1.7} />{topic}</span><span>Start a conversation</span></div>
          <h2><button type="button" onClick={() => onStartConversation(`${title}\n\n${body}`)}>{title}</button></h2>
          <p>{body}</p>
          <div className={styles.cardActions}>
            <button type="button" onClick={() => onStartConversation(`${title}\n\n${body}`)} aria-label={`Start a thread: ${title}`}><MessageCircle size={20} /><span>Discuss</span></button>
            <span className={styles.encouragement}><Heart size={19} /><span>Share your perspective</span></span>
            <ArrowRight className={styles.cardArrow} size={21} aria-hidden="true" />
          </div>
        </div>
      </article>)}</div>
      <a className={styles.more} href="#threads-conversations"><ArrowDown size={39} strokeWidth={1.1} /><span>More conversations<br />below</span></a>
    </div>
  </section>;
}
