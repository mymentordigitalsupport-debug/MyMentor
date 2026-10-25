CREATE TABLE IF NOT EXISTS public.transactional_email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  resend_email_id TEXT,
  last_error TEXT,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactional_email_events_retry_idx
  ON public.transactional_email_events (status, next_attempt_at)
  WHERE status IN ('queued', 'failed', 'sending');

ALTER TABLE public.transactional_email_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.claim_transactional_email_event(p_event_key TEXT)
RETURNS SETOF public.transactional_email_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.transactional_email_events
  SET status = 'sending', attempts = attempts + 1, updated_at = now()
  WHERE event_key = p_event_key
    AND (
      (status IN ('queued', 'failed') AND next_attempt_at <= now())
      OR (status = 'sending' AND updated_at < now() - interval '15 minutes')
    )
  RETURNING *;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_transactional_email_event(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_transactional_email_event(TEXT) TO service_role;
