export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

const STORAGE_KEY = "voice_control_countdown_target";

export function getTargetDate(): Date {
  const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored) {
    const parsed = new Date(stored);
    if (!isNaN(parsed.getTime()) && parsed.getTime() > Date.now()) {
      return parsed;
    }
  }

  // Default to 23 days, 21 hours, 46 minutes, 36 seconds from now (matching reference screenshot)
  const target = new Date();
  target.setDate(target.getDate() + 23);
  target.setHours(target.getHours() + 21);
  target.setMinutes(target.getMinutes() + 46);
  target.setSeconds(target.getSeconds() + 36);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, target.toISOString());
    } catch {
      // Ignore storage errors
    }
  }
  return target;
}

export function calculateTimeRemaining(targetDate: Date): TimeRemaining {
  const totalMs = targetDate.getTime() - Date.now();

  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  const seconds = Math.floor((totalMs / 1000) % 60);
  const minutes = Math.floor((totalMs / 1000 / 60) % 60);
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, isComplete: false };
}
