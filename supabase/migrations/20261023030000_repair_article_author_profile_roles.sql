-- Fresh repair migration for databases where the original role constraint
-- was already applied before author roles were introduced.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK ("role" IN ('user', 'author_pending', 'author', 'author_rejected', 'admin'));
