-- ============================================================
-- My Mentor — Phase 1 Database Schema
-- Run this in the Supabase SQL Editor or via CLI
-- ============================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES & IDENTITY
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT,
  anonymous_name  TEXT,
  is_anonymous    BOOLEAN NOT NULL DEFAULT false,
  guidance_path   TEXT NOT NULL DEFAULT 'religious',
  role            TEXT NOT NULL DEFAULT 'user',
  avatar_url      TEXT,
  goal            TEXT,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger function to create profile automatically on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  random_num INT;
  anon_name TEXT;
BEGIN
  -- Generate random anonymous name if needed
  random_num := floor(random() * 9999)::INT;
  anon_name := 'Anonymous ' || random_num;

  INSERT INTO public.profiles (
    user_id,
    display_name,
    anonymous_name,
    is_anonymous
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL),
    anon_name,
    COALESCE((NEW.raw_user_meta_data->>'is_anonymous')::BOOLEAN, false)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- COURSE CONTENT
-- ============================================================

CREATE TABLE IF NOT EXISTS courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  cover_image_url TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  guidance_path   TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, guidance_path)
);

CREATE TABLE IF NOT EXISTS modules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_version_id UUID NOT NULL REFERENCES course_versions(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  sort_order        INT NOT NULL DEFAULT 0,
  is_published      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id         UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  estimated_minutes INT,
  sort_order        INT NOT NULL DEFAULT 0,
  is_published      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lesson_content_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  block_type  TEXT NOT NULL,
  content     JSONB NOT NULL DEFAULT '{}',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MEDIA
-- ============================================================

CREATE TABLE IF NOT EXISTS mentor_videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  url         TEXT,
  thumbnail   TEXT,
  duration_s  INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audio_tracks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  url         TEXT,
  duration_s  INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- REFLECTION & ENGAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS reflection_prompts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id         UUID REFERENCES lessons(id) ON DELETE CASCADE,
  course_version_id UUID REFERENCES course_versions(id) ON DELETE CASCADE,
  prompt_text       TEXT NOT NULL,
  guidance_path     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pause_reflect_cards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  context     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quizzes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id     UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL DEFAULT '[]',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- USER ENGAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id   UUID REFERENCES lessons(id) ON DELETE SET NULL,
  prompt_id   UUID REFERENCES reflection_prompts(id) ON DELETE SET NULL,
  title       TEXT,
  body        TEXT NOT NULL,
  mood        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mood_checkins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id   UUID REFERENCES lessons(id) ON DELETE SET NULL,
  mood        TEXT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_insights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id   UUID REFERENCES lessons(id) ON DELETE SET NULL,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PROGRESS TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS user_course_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_version_id UUID NOT NULL REFERENCES course_versions(id) ON DELETE CASCADE,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  last_active_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_version_id)
);

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- ============================================================
-- RESOURCES
-- ============================================================

CREATE TABLE IF NOT EXISTS resources (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  category     TEXT NOT NULL,
  description  TEXT,
  url          TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Profiles: users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Journal entries: users can manage their own entries
CREATE POLICY "Users can manage own journal entries"
  ON journal_entries FOR ALL
  USING (auth.uid() = user_id);

-- Mood check-ins: users can manage their own check-ins
CREATE POLICY "Users can manage own mood checkins"
  ON mood_checkins FOR ALL
  USING (auth.uid() = user_id);

-- Saved insights: users can manage their own insights
CREATE POLICY "Users can manage own saved insights"
  ON saved_insights FOR ALL
  USING (auth.uid() = user_id);

-- User course progress: users can manage their own progress
CREATE POLICY "Users can manage own course progress"
  ON user_course_progress FOR ALL
  USING (auth.uid() = user_id);

-- User lesson progress: users can manage their own progress
CREATE POLICY "Users can manage own lesson progress"
  ON user_lesson_progress FOR ALL
  USING (auth.uid() = user_id);

-- Public read access for published content
CREATE POLICY "Anyone can read published courses"
  ON courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can read course versions"
  ON course_versions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read published modules"
  ON modules FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can read published lessons"
  ON lessons FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can read lesson content blocks"
  ON lesson_content_blocks FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read mentor videos"
  ON mentor_videos FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read audio tracks"
  ON audio_tracks FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read reflection prompts"
  ON reflection_prompts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read pause reflect cards"
  ON pause_reflect_cards FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read quizzes"
  ON quizzes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read quiz questions"
  ON quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read published resources"
  ON resources FOR SELECT
  USING (is_published = true);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_course_versions_course_id ON course_versions(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_version_id ON modules(course_version_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lesson_content_blocks_lesson_id ON lesson_content_blocks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_checkins_user_id ON mood_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_insights_user_id ON saved_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
