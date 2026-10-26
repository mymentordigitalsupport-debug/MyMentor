"use client";

import * as React from "react";

export type PigmentPalette = "ember" | "tide" | "moss" | "mono";

export type LedgerItem = {
  company: string;
  role: string;
  years: string;
  mark?: string;
  location?: string;
  industry?: string;
  link?: { label: string; href: string };
  summary?: string[];
  tags?: string[];
  colors?: [string, string, string];
  logo?: React.ReactNode;
};

export type PigmentExperienceLedgerProps = {
  items?: LedgerItem[];
  heading?: string;
  intro?: string;
  footnote?: string;
  cta?: { label: string; href: string } | null;
  palette?: PigmentPalette;
  colors?: [string, string, string];
  strength?: number;
  defaultOpen?: number | null;
  open?: number | null;
  onToggle?: (index: number | null) => void;
  labels?: { position?: string; location?: string; industry?: string; link?: string; tags?: string };
  uppercase?: boolean;
  minHeight?: number | string;
  background?: string;
  ink?: string;
  fontFamily?: string;
  className?: string;
  style?: React.CSSProperties;
};

export const PALETTES = {
  ember: ["#f2266f", "#ff7417", "#ffcf33"],
  tide: ["#08706c", "#17b09c", "#c3ee8a"],
  moss: ["#4b6b17", "#93bb27", "#ece07a"],
  mono: ["#1b2027", "#535c68", "#c5cbd3"],
};

export function nextOpen(current: number | null, index: number): number | null {
  return current === index ? null : index;
}

const DEFAULT_ITEMS: LedgerItem[] = [
  { company: "What is My Mentor?", role: "About the platform", years: "FAQ 01", industry: "Getting started", summary: ["My Mentor is a private, structured place to work through practical recovery guidance at your own pace.", "It brings lessons, reflections, mood check-ins, and progress together so each next step feels clear."], tags: ["Guidance", "Reflection", "Progress"] },
  { company: "Which course can I take?", role: "Available course", years: "FAQ 02", industry: "Courses", summary: ["Uprooting Drug Abuse is the course currently available in My Mentor.", "It includes two guidance paths, so you can follow the version that best fits your needs while working through the same course structure."], tags: ["Uprooting Drug Abuse", "Two paths"] },
  { company: "Do I need to finish quickly?", role: "Learning at your pace", years: "FAQ 03", industry: "Progress", summary: ["No. The course is designed for steady return, not pressure or perfection.", "Take one lesson, reflect on it, and come back when you are ready for the next honest step."], tags: ["Your pace", "Consistency"] },
  { company: "Is my progress private?", role: "Your account", years: "FAQ 04", industry: "Privacy", summary: ["Your lessons, reflections, mood check-ins, and progress are connected to your own account.", "My Mentor is built to give you a personal space to engage with the work."], tags: ["Private", "Personal"] },
  { company: "Can I write for My Mentor?", role: "Articles and authors", years: "FAQ 05", industry: "Community", link: { label: "Apply to become an author", href: "/authors-register" }, summary: ["Writers can apply to become an author through the author application portal.", "Approved authors can submit articles for an administrator to review before they are published."], tags: ["Authors", "Articles"] },
];

const DISPLAY_STACK = '"Neue Haas Grotesk Display Pro", "Helvetica Neue", "Inter Display", Helvetica, Arial, system-ui, sans-serif';

export default function PigmentExperienceLedger({
  items = DEFAULT_ITEMS,
  heading = "Frequently asked questions",
  intro = "A few clear answers about getting started with My Mentor and making the platform work for you.",
  footnote = "Still unsure? Start with one lesson and return when you are ready.",
  cta = { label: "Create your account", href: "/register" },
  palette = "ember",
  colors,
  strength = 0.82,
  defaultOpen = 0,
  open,
  onToggle,
  labels,
  uppercase = false,
  minHeight = "100svh",
  background,
  ink,
  fontFamily,
  className,
  style,
}: PigmentExperienceLedgerProps) {
  const controlled = open !== undefined;
  const [inner, setInner] = React.useState<number | null>(defaultOpen);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const openIndex = controlled ? open ?? null : inner;
  const paletteColors = colors ?? PALETTES[palette];
  const labelsWithDefaults = { position: labels?.position ?? "Position", location: labels?.location ?? "Location", industry: labels?.industry ?? "Industry", link: labels?.link ?? "Website", tags: labels?.tags ?? "Skills" };
  const rootStyle = {
    "--pel-bg": background ?? "var(--color-background, #ffffff)",
    "--pel-ink": ink ?? "var(--color-foreground, #111111)",
    "--pel-muted": ink ? `color-mix(in oklab, ${ink} 62%, transparent)` : "var(--color-muted-foreground, #6b6b6b)",
    "--pel-line": ink ? `color-mix(in oklab, ${ink} 16%, transparent)` : "var(--color-border, #e5e5e5)",
    "--pel-display": fontFamily ?? DISPLAY_STACK,
    "--pel-case": uppercase ? "uppercase" : "none",
    "--pel-core": paletteColors[0], "--pel-body": paletteColors[1], "--pel-edge": paletteColors[2],
    "--pel-strength": strength,
    minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
    ...style,
  } as React.CSSProperties;
  const toggle = (index: number) => {
    const next = nextOpen(openIndex, index);
    if (!controlled) setInner(next);
    onToggle?.(next);
  };

  return (
    <section className={`pel-root ${className ?? ""}`} style={rootStyle} aria-label={heading}>
      <style>{`
        .pel-root{position:relative;isolation:isolate;overflow:hidden;padding:clamp(3rem,7vw,6.5rem) clamp(1.25rem,5vw,5rem);background:var(--pel-bg);color:var(--pel-ink)}.pel-wrap{max-width:84rem;margin:auto}.pel-head{margin-bottom:clamp(1.75rem,4vw,3.25rem)}.pel-title{margin:0;font:500 clamp(2.1rem,4.6vw,4rem)/1 var(--pel-display);letter-spacing:-.04em}.pel-intro{max-width:40ch;margin:.9rem 0 0;color:var(--pel-muted);line-height:1.5}.pel-list{list-style:none;margin:0;padding:0;border-top:1px solid var(--pel-line)}.pel-row{position:relative;overflow:hidden;border-bottom:1px solid var(--pel-line)}.pel-row:before{content:"";position:absolute;inset:-35% -8%;opacity:0;transition:opacity .35s ease;background:radial-gradient(ellipse at var(--px,68%) 48%,var(--pel-core),var(--pel-body) 28%,var(--pel-edge) 48%,transparent 68%);filter:blur(16px);mix-blend-mode:multiply}.pel-row[data-lit=true]:before{opacity:calc(var(--pel-strength) * .33)}.pel-trigger{position:relative;z-index:1;display:grid;width:100%;grid-template-columns:minmax(8.5rem,15rem) minmax(0,1fr);gap:1.5rem;align-items:center;border:0;background:transparent;padding:clamp(1.1rem,2.3vw,1.85rem) .9rem;color:inherit;text-align:inherit;cursor:pointer}.pel-trigger:focus-visible{outline:2px solid var(--pel-ink);outline-offset:-2px}.pel-when{display:flex;align-items:center;gap:.85rem;color:var(--pel-muted);font-size:clamp(.92rem,1.25vw,1.06rem);font-style:italic}.pel-x{position:relative;width:.78rem;height:.78rem}.pel-x:before,.pel-x:after{content:"";position:absolute;top:50%;left:0;width:100%;height:1.5px;background:currentColor}.pel-x:after{transform:rotate(90deg)}.pel-row[data-open=true] .pel-x{transform:rotate(45deg)}.pel-namecell{display:flex;min-width:0;flex-direction:column;align-items:flex-end;text-align:right}.pel-name{white-space:nowrap;font:600 clamp(2.25rem,7.4vw,6.4rem)/.9 var(--pel-display);letter-spacing:-.045em;text-transform:var(--pel-case)}.pel-mark{font-size:.6em;vertical-align:.62em}.pel-role{display:inline-flex;align-items:center;gap:.55rem;margin-top:.6rem;color:var(--pel-muted);font-size:.72rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase}.pel-panel{position:relative;z-index:1;display:grid;grid-template-rows:0fr;transition:grid-template-rows .32s cubic-bezier(.23,1,.32,1)}.pel-row[data-open=true] .pel-panel{grid-template-rows:1fr}.pel-clip{overflow:hidden}.pel-body{display:grid;grid-template-columns:minmax(8.5rem,15rem) minmax(0,.85fr) minmax(0,1.3fr);gap:1.25rem 1.5rem;padding:.15rem .9rem clamp(1.6rem,3.2vw,2.6rem);opacity:0;transform:translateY(-6px);transition:.28s ease}.pel-row[data-open=true] .pel-body{opacity:1;transform:none}.pel-meta{grid-column:2;display:grid;grid-template-columns:auto minmax(0,1fr);gap:.6rem 1.75rem;margin:0;font-size:.875rem}.pel-label{color:var(--pel-muted)}.pel-meta dd{margin:0;font-weight:600}.pel-meta a{color:inherit;text-underline-offset:3px}.pel-copy{grid-column:3;max-width:56ch;line-height:1.55}.pel-copy p{margin:0 0 .8em}.pel-tags{display:flex;flex-wrap:wrap;gap:.4rem;margin:1.1rem 0 0;padding:0;list-style:none}.pel-tags li{border:1px solid currentColor;border-radius:999px;padding:.4rem .7rem;font-size:.75rem}.pel-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem 2rem;margin-top:1.4rem;color:var(--pel-muted);font-size:.875rem}.pel-note{margin:0}.pel-cta{color:var(--pel-ink);font:600 1.06rem var(--pel-display);text-underline-offset:5px}@media (max-width:640px){.pel-trigger{grid-template-columns:1fr;gap:.7rem}.pel-when{justify-content:space-between}.pel-namecell{align-items:flex-start;text-align:left}.pel-name{font-size:clamp(2rem,12.5vw,3.4rem)}.pel-body{grid-template-columns:1fr}.pel-meta,.pel-copy{grid-column:1}.pel-foot{align-items:flex-start;flex-direction:column}}`}</style>
      <style>{`.pel-body--faq{grid-template-columns:minmax(8.5rem,15rem) minmax(0,1.3fr)}.pel-body--faq .pel-copy{grid-column:2}@media (max-width:640px){.pel-body--faq .pel-copy{grid-column:1}}`}</style>
      <div className="pel-wrap">
        <header className="pel-head"><h2 className="pel-title">{heading}</h2><p className="pel-intro">{intro}</p></header>
        <ol className="pel-list">{items.map((item, index) => {
          const isOpen = openIndex === index;
          const isLit = isOpen || hovered === index;
          return <li key={`${item.company}-${index}`} className="pel-row" data-open={isOpen} data-lit={isLit} onPointerEnter={(event) => { setHovered(index); event.currentTarget.style.setProperty("--px", `${event.nativeEvent.offsetX}px`); }} onPointerLeave={() => setHovered(null)}>
            <button type="button" className="pel-trigger" aria-expanded={isOpen} onClick={() => toggle(index)}><span className="pel-when"><span>({item.years})</span><span className="pel-x" /></span><span className="pel-namecell"><span className="pel-name">{item.company}{item.mark && <sup className="pel-mark">{item.mark}</sup>}</span></span></button>
            <div className="pel-panel"><div className="pel-clip"><div className="pel-body pel-body--faq">{(item.summary?.length || item.tags?.length) ? <div className="pel-copy">{item.summary?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{item.tags?.length ? <ul className="pel-tags" aria-label={labelsWithDefaults.tags}>{item.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul> : null}</div> : null}</div></div></div>
          </li>;
        })}</ol>
        {(footnote || cta) && <footer className="pel-foot">{footnote && <p className="pel-note">{footnote}</p>}{cta && <a className="pel-cta landing-user-profile" href={cta.href}><span className="landing-user-profile-inner"><span>{cta.label} ↓</span></span></a>}</footer>}
      </div>
    </section>
  );
}
