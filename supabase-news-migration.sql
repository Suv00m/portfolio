-- =============================================
-- Blog Posts table (migrated from GitHub API)
-- =============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail TEXT,
  links JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_created_at ON blog_posts(created_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read blogs" ON blog_posts FOR SELECT TO public USING (true);
CREATE POLICY "Service role all blogs" ON blog_posts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- News Articles table for automated AI/tech news pipeline
-- =============================================
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  thumbnail TEXT,
  source_urls TEXT[] DEFAULT '{}',
  source_subreddit TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);

-- RLS: public read, service_role write
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON news_articles FOR SELECT TO public USING (true);
CREATE POLICY "Service role all" ON news_articles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Auto-update updated_at trigger
-- Create the function if it doesn't exist (may already exist from blog migration)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
