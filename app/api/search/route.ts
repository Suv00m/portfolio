import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, results: [] });
  }

  const searchTerm = `%${q}%`;

  // Search blog posts and news articles in parallel
  const [blogResult, newsResult] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('id, title, thumbnail, created_at')
      .ilike('title', searchTerm)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('news_articles')
      .select('slug, title, thumbnail, created_at')
      .ilike('title', searchTerm)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const blogs = (blogResult.data || []).map((b) => ({
    type: 'blog' as const,
    title: b.title,
    href: `/blog/${b.id}`,
    thumbnail: b.thumbnail,
    date: b.created_at,
  }));

  const news = (newsResult.data || []).map((n) => ({
    type: 'news' as const,
    title: n.title,
    href: `/news/${n.slug}`,
    thumbnail: n.thumbnail,
    date: n.created_at,
  }));

  return NextResponse.json({
    success: true,
    results: [...blogs, ...news].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  });
}
