import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { getTrendingTopics, getPostDetails } from '@/lib/reddit';
import { generateNewsArticle } from '@/lib/news-generator';
import { createNewsArticle } from '@/lib/news';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json().catch(() => ({}));
    const count = Math.min(body.count || 3, 5);
    const subreddits = body.subreddits || undefined;

    const topics = await getTrendingTopics(count, subreddits);

    if (topics.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new trending topics found',
        articlesCreated: 0,
      });
    }

    const results: { slug: string; title: string }[] = [];

    for (const topic of topics) {
      const comments = await getPostDetails(topic.permalink);
      const article = await generateNewsArticle(topic, comments);

      if (article) {
        const created = await createNewsArticle(article);
        if (created) {
          results.push({ slug: created.slug, title: created.title });
        }
      }
    }

    return NextResponse.json({
      success: true,
      articlesCreated: results.length,
      articles: results,
    });
  } catch (error) {
    console.error('Generate news error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate news' },
      { status: 500 }
    );
  }
}
