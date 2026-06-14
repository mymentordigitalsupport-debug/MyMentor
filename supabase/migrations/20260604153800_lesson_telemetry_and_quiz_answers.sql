CREATE TABLE IF NOT EXISTS lesson_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_version_id UUID REFERENCES course_versions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lesson_step_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES lesson_attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  block_id UUID REFERENCES lesson_content_blocks(id) ON DELETE SET NULL,
  step_key TEXT NOT NULL,
  step_order INT,
  event_type TEXT NOT NULL DEFAULT 'viewed' CHECK (event_type IN ('viewed')),
  entered_at TIMESTAMPTZ NOT NULL,
  left_at TIMESTAMPTZ,
  duration_ms INT NOT NULL DEFAULT 0 CHECK (duration_ms >= 0),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lesson_quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES lesson_attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  block_id UUID REFERENCES lesson_content_blocks(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  selected_answer TEXT NOT NULL,
  correct_answer TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  duration_ms INT CHECK (duration_ms IS NULL OR duration_ms >= 0),
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT lesson_quiz_answers_attempt_block_unique UNIQUE (attempt_id, block_id)
);

ALTER TABLE lesson_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_step_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own lesson attempts"
  ON lesson_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own lesson step events"
  ON lesson_step_events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own lesson quiz answers"
  ON lesson_quiz_answers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lesson_attempts_user_lesson_started
  ON lesson_attempts(user_id, lesson_id, started_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_attempts_user_lesson_unique
  ON lesson_attempts(user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_lesson_attempts_lesson_status
  ON lesson_attempts(lesson_id, status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_step_events_attempt_entered
  ON lesson_step_events(attempt_id, entered_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_step_events_user_lesson
  ON lesson_step_events(user_id, lesson_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_quiz_answers_user_answered
  ON lesson_quiz_answers(user_id, answered_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_quiz_answers_attempt
  ON lesson_quiz_answers(attempt_id, answered_at DESC);
