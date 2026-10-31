-- Article publishing, author applications, editorial review, and role-based access.

CREATE TABLE IF NOT EXISTS article_author_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  public_name TEXT NOT NULL,
  bio TEXT NOT NULL,
  expertise_summary TEXT NOT NULL,
  intended_topics TEXT[] NOT NULL DEFAULT '{}',
  motivation TEXT NOT NULL,
  website_url TEXT,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS article_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS article_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS article_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES article_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content_markdown TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'changes_requested', 'rejected', 'published', 'archived')),
  submitted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS article_article_tags (
  article_id UUID NOT NULL REFERENCES article_articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES article_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE IF NOT EXISTS article_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES article_articles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'changes_requested', 'rejected', 'published', 'archived')),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_articles_status_published ON article_articles(status, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_article_articles_author ON article_articles(author_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_applications_status ON article_author_applications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_reviews_article ON article_reviews(article_id, created_at DESC);

ALTER TABLE article_author_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_reviews ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.article_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles AS profile
    WHERE profile.user_id = auth.uid() AND profile."role" = 'admin'
  );
$$;

CREATE POLICY "Article applications are visible to their applicant"
  ON article_author_applications FOR SELECT
  USING (user_id = auth.uid() OR public.article_is_admin());
CREATE POLICY "Article applications can be created by their applicant"
  ON article_author_applications FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Article applications are managed by admins"
  ON article_author_applications FOR UPDATE
  USING (public.article_is_admin()) WITH CHECK (public.article_is_admin());

CREATE POLICY "Article categories are publicly readable"
  ON article_categories FOR SELECT USING (true);
CREATE POLICY "Article categories are managed by admins"
  ON article_categories FOR ALL USING (public.article_is_admin()) WITH CHECK (public.article_is_admin());
CREATE POLICY "Article tags are publicly readable"
  ON article_tags FOR SELECT USING (true);
CREATE POLICY "Article tags are managed by admins"
  ON article_tags FOR ALL USING (public.article_is_admin()) WITH CHECK (public.article_is_admin());

CREATE POLICY "Published articles are publicly readable"
  ON article_articles FOR SELECT
  USING ((status = 'published' AND deleted_at IS NULL) OR author_id = auth.uid() OR public.article_is_admin());
CREATE POLICY "Authors can create their own draft articles"
  ON article_articles FOR INSERT
  WITH CHECK (author_id = auth.uid() AND status = 'draft' AND EXISTS (SELECT 1 FROM profiles AS profile WHERE profile.user_id = auth.uid() AND profile."role" = 'author'));
CREATE POLICY "Authors can update their own unpublished articles"
  ON article_articles FOR UPDATE
  USING (author_id = auth.uid() AND status IN ('draft', 'changes_requested', 'rejected'))
  WITH CHECK (author_id = auth.uid() AND status IN ('draft', 'changes_requested', 'rejected'));
CREATE POLICY "Admins manage all articles"
  ON article_articles FOR ALL USING (public.article_is_admin()) WITH CHECK (public.article_is_admin());

CREATE POLICY "Article tags follow article visibility"
  ON article_article_tags FOR SELECT USING (true);
CREATE POLICY "Article tags are managed by admins"
  ON article_article_tags FOR ALL USING (public.article_is_admin()) WITH CHECK (public.article_is_admin());

CREATE POLICY "Reviews are visible to an article author or admin"
  ON article_reviews FOR SELECT
  USING (public.article_is_admin() OR EXISTS (SELECT 1 FROM article_articles WHERE id = article_id AND author_id = auth.uid()));
CREATE POLICY "Reviews are managed by admins"
  ON article_reviews FOR ALL USING (public.article_is_admin()) WITH CHECK (public.article_is_admin());

INSERT INTO article_categories (name, slug, description)
VALUES ('Recovery', 'recovery', 'Articles supporting recovery, healing, and lasting change.')
ON CONFLICT (slug) DO NOTHING;
