-- The original profiles role constraint predates the article-author workflow.
-- Keep existing roles valid while allowing author applications and review outcomes.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK ("role" IN ('user', 'author_pending', 'author', 'author_rejected', 'admin'));
