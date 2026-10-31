// ============================================================
// My Mentor — Shared Utilities
// ============================================================

/**
 * Merge class names — lightweight alternative to clsx/cn.
 * Filters out falsy values and joins with a space.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a date string into a human-readable format.
 * e.g. "27 May 2026"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format a date string into a short format.
 * e.g. "27 May"
 */
export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Return a time-of-day greeting.
 * e.g. "Good morning", "Good afternoon", "Good evening"
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Pick a random anonymous display name from the list.
 */
export function randomAnonymousName(names: string[]): string {
  return names[Math.floor(Math.random() * names.length)] ?? "QuietSteps";
}

/**
 * Calculate percentage, clamped 0–100.
 */
export function percent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + "…";
}

/**
 * Slugify a string for URL use.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
