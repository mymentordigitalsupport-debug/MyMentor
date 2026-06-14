// ============================================================
// My Mentor — Shared TypeScript Types
// ============================================================

export type GuidancePath = "christian" | "religious";
export type UserRole = "user" | "admin";
export type AccountStatus = "active" | "suspended" | "disabled" | "anonymized";
export type MoodValue = "low" | "heavy" | "uncertain" | "hopeful" | "steady" | "strong";

export type BlockType =
  | "welcome"
  | "reading"
  | "mentor_note"
  | "video"
  | "audio"
  | "pause_reflect"
  | "journal_prompt"
  | "mood_checkin"
  | "quiz"
  | "daily_action"
  | "complete";

export type ResourceCategory =
  | "worksheet"
  | "audio"
  | "video"
  | "reading"
  | "support";

// ── Database row types ──────────────────────────────────────

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  anonymous_name: string | null;
  is_anonymous: boolean;
  guidance_path: GuidancePath;
  role: UserRole;
  goal: string | null;
  onboarding_completed: boolean;
  account_status: AccountStatus;
  account_status_reason: string | null;
  account_status_updated_at: string;
  anonymized_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CourseVersion {
  id: string;
  course_id: string;
  guidance_path: GuidancePath;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  course_version_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  description: string | null;
  estimated_minutes: number | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonContentBlock {
  id: string;
  lesson_id: string;
  block_type: BlockType;
  content: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MentorVideo {
  id: string;
  title: string;
  url: string | null;
  thumbnail: string | null;
  duration_s: number | null;
  created_at: string;
  updated_at: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  url: string | null;
  duration_s: number | null;
  created_at: string;
  updated_at: string;
}

export interface ReflectionPrompt {
  id: string;
  lesson_id: string | null;
  course_version_id: string | null;
  prompt_text: string;
  guidance_path: GuidancePath | null;
  created_at: string;
  updated_at: string;
}

export interface PauseReflectCard {
  id: string;
  lesson_id: string | null;
  question: string;
  context: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: Array<{ text: string; is_correct: boolean }>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  lesson_id: string | null;
  prompt_id: string | null;
  title: string | null;
  body: string;
  mood: MoodValue | null;
  created_at: string;
  updated_at: string;
}

export interface MoodCheckin {
  id: string;
  user_id: string;
  lesson_id: string | null;
  mood: MoodValue;
  note: string | null;
  created_at: string;
}

export interface SavedInsight {
  id: string;
  user_id: string;
  lesson_id: string | null;
  text: string;
  created_at: string;
}

export interface UserCourseProgress {
  id: string;
  user_id: string;
  course_version_id: string;
  started_at: string;
  completed_at: string | null;
  last_active_at: string;
}

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  started_at: string;
  completed_at: string | null;
}

export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  description: string | null;
  url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ── UI / helper types ───────────────────────────────────────

export interface MoodOption {
  value: MoodValue;
  label: string;
  emoji: string;
  color: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { value: "low",       label: "Low",       emoji: "🌧",  color: "bg-rose/20 text-rose border-rose/30" },
  { value: "heavy",     label: "Heavy",     emoji: "🌫",  color: "bg-muted/20 text-muted border-muted/30" },
  { value: "uncertain", label: "Uncertain", emoji: "🌀",  color: "bg-gold/20 text-gold border-gold/30" },
  { value: "hopeful",   label: "Hopeful",   emoji: "🌤",  color: "bg-sage/20 text-sage border-sage/30" },
  { value: "steady",    label: "Steady",    emoji: "🌿",  color: "bg-forest/20 text-forest border-forest/30" },
  { value: "strong",    label: "Strong",    emoji: "☀️",  color: "bg-gold/30 text-forest border-gold/40" },
];

export const ANONYMOUS_NAMES = [
  "QuietSteps", "Gentle Tide", "Morning Path", "Calm Horizon",
  "Still Waters", "Soft Ground", "Open Sky", "Warm Light",
  "Steady Flame", "New Season", "Quiet River", "Rising Dawn",
];
