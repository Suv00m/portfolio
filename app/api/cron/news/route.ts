import { NextRequest, NextResponse } from 'next/server';
import { getTrendingTopics, getPostDetails } from '@/lib/reddit';
import { generateNewsArticle } from '@/lib/news-generator';
import { createNewsArticle } from '@/lib/news';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const topics = await getTrendingTopics(3);

    if (topics.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new trending topics found',
        articlesCreated: 0,
      });
    }

    const results: string[] = [];

    for (const topic of topics) {
      const comments = await getPostDetails(topic.permalink);
      const article = await generateNewsArticle(topic, comments);

      if (article) {
        const created = await createNewsArticle(article);
        if (created) {
          results.push(created.slug);
        }
      }
    }

    return NextResponse.json({
      success: true,
      articlesCreated: results.length,
      slugs: results,
    });
  } catch (error) {
    console.error('Cron news error:', error);
    return NextResponse.json(
      { success: false, error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
