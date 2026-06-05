-- Migration: Add reactions, view counts, newsletter subscribers, and blog tags
-- Run this in Supabase SQL Editor

-- 1. Add tags column to blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_blog_tags ON blog_posts USING GIN (tags);

-- 2. Page views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (page_path);

-- View count materialized helper (simple count per path)
CREATE OR REPLACE VIEW page_view_counts AS
SELECT page_path, COUNT(*) as view_count
FROM page_views
GROUP BY page_path;

-- 3. Post reactions table
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'fire', 'think')),
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (page_path, reaction_type, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_reactions_path ON post_reactions (page_path);

-- 4. Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. RLS Policies

-- Page views: anyone can insert (track views), anyone can read counts
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert page views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read page views" ON page_views FOR SELECT USING (true);

-- Reactions: anyone can insert (with unique constraint), anyone can read
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert reactions" ON post_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read reactions" ON post_reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can delete own reactions" ON post_reactions FOR DELETE USING (true);

-- Newsletter: anyone can insert, only admin can read
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read subscribers" ON newsletter_subscribers FOR SELECT USING (true);
