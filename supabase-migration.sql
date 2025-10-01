-- ============================================
-- Blog Posts Table Setup for Supabase
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Project Settings → SQL Editor → New Query
-- ============================================

-- Drop existing table if you need to reset (CAREFUL!)
-- DROP TABLE IF EXISTS blog_posts CASCADE;

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(title) > 0),
  description TEXT NOT NULL CHECK (char_length(description) > 0),
  links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster queries on created_at
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at 
ON blog_posts(created_at DESC);

-- Create index for faster queries on id
CREATE INDEX IF NOT EXISTS idx_blog_posts_id 
ON blog_posts(id);

-- Enable Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON blog_posts;
DROP POLICY IF EXISTS "Allow service role all access" ON blog_posts;

-- Policy 1: Allow anyone to read blog posts (public access)
CREATE POLICY "Allow public read access" ON blog_posts
  FOR SELECT
  TO public
  USING (true);

-- Policy 2: Allow service role full access (for admin API operations)
-- The service role bypasses RLS, but we define this for clarity
CREATE POLICY "Allow service role all access" ON blog_posts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample blog posts (optional - remove if not needed)
INSERT INTO blog_posts (title, description, links) VALUES
(
  'Getting Started with Next.js',
  'Next.js is a powerful React framework that makes building web applications easier. In this post, we''ll explore the fundamentals of Next.js and how to get started with your first project. We''ll cover routing, server-side rendering, and the app directory structure that makes Next.js so powerful for modern web development.',
  '[
    {"text": "Next.js Documentation", "url": "https://nextjs.org"},
    {"text": "React", "url": "https://react.dev"}
  ]'::jsonb
),
(
  'Building Modern UIs with Tailwind CSS',
  'Tailwind CSS has revolutionized how we approach styling in modern web development. This utility-first framework allows developers to build beautiful, responsive interfaces quickly and efficiently. In this comprehensive guide, we''ll explore advanced Tailwind techniques, custom configurations, and best practices for maintaining scalable stylesheets.',
  '[
    {"text": "Tailwind CSS", "url": "https://tailwindcss.com"}
  ]'::jsonb
);

-- Verify the setup
SELECT 
  'Setup complete! Blog posts table created with RLS enabled.' as status,
  COUNT(*) as sample_posts
FROM blog_posts;

-- ============================================
-- Setup Complete!
-- ============================================
-- Next steps:
-- 1. Copy your Supabase URL and keys to .env.local
-- 2. Run: npm run dev
-- 3. Visit: http://localhost:3000/admin
-- 4. Create your first blog post!
-- ============================================
