CREATE TABLE IF NOT EXISTS public.chatbot_conversation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_role TEXT NOT NULL CHECK (message_role IN ('user', 'assistant')),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chatbot_conversation_user_created_idx
  ON public.chatbot_conversation (user_id, created_at);

ALTER TABLE public.chatbot_conversation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read their own chatbot conversations"
  ON public.chatbot_conversation
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Members can add their own chatbot messages"
  ON public.chatbot_conversation
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
