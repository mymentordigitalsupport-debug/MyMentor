# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the landing page around the existing hero video and add scroll-triggered bottom-up sections using the My Mentor color system and Poppins/Open Sans typography.

**Architecture:** Keep the landing page self-contained so the authenticated app remains untouched. Introduce a small scroll-reveal utility component for section entrances, update the root typography tokens, and compose the landing page from focused content sections that each own their own copy, layout, and CTA behavior.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, `next/font/google`, existing My Mentor design tokens.

---

### Task 1: Update global typography tokens

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Load the new fonts**

```tsx
import { Open_Sans, Poppins } from "next/font/google";
```

- [ ] **Step 2: Apply the font variables to the root layout**

```tsx
const poppins = Poppins({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700"] });
```

- [ ] **Step 3: Keep existing colors but remove gradient-heavy landing assumptions**

```css
body {
  background: var(--cream);
  font-family: var(--font-body);
}
```

### Task 2: Build landing scroll reveal primitives

**Files:**
- Create: `src/components/landing/SectionReveal.tsx`
- Create: `src/hooks/useInViewReveal.ts`

- [ ] **Step 1: Add an intersection observer hook**

```ts
export function useInViewReveal<T extends HTMLElement>() { /* observer that toggles visible state once */ }
```

- [ ] **Step 2: Add a section wrapper that animates from bottom to top**

```tsx
export function SectionReveal({ children, className }: { children: React.ReactNode; className?: string }) { /* translateY + opacity transition */ }
```

- [ ] **Step 3: Respect reduced motion**

```ts
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { /* show instantly */ }
```

### Task 3: Rebuild the landing page sections

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/landing/HeroSection.tsx`
- Create: `src/components/landing/LandingSections.tsx`

- [ ] **Step 1: Keep the current video hero as the opening frame**

```tsx
<HeroSection />
```

- [ ] **Step 2: Add stacked sections for mission, books, platform flow, founder, and CTA**

```tsx
export function LandingSections() { return <>...</>; }
```

- [ ] **Step 3: Remove any gradient overlays from the landing page shell**

```tsx
<main className="min-h-screen bg-cream text-text">
```

- [ ] **Step 4: Use scroll reveal on each section and stagger inner cards**

```tsx
<SectionReveal><section>...</section></SectionReveal>
```

### Task 4: Tune landing copy and trust cues

**Files:**
- Modify: `src/components/landing/LandingSections.tsx`

- [ ] **Step 1: Write the books section using the three books already in the project**
- [ ] **Step 2: Add the founder/owner section using the name Craig**
- [ ] **Step 3: Add a single strong register CTA**

### Task 5: Verify the landing page

**Files:**
- None

- [ ] **Step 1: Run lint on the touched files**

```bash
npm.cmd run lint
```

- [ ] **Step 2: Open the landing page and confirm the hero remains fixed while sections reveal upward**
- [ ] **Step 3: Check mobile stacking and font rendering**

