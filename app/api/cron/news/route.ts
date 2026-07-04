import { NextRequest, NextResponse } from 'next/server';
import { getTrendingTopics, getPostDetails } from '@/lib/reddit';
import { getTrendingHNTopics, getHNComments } from '@/lib/hackernews';
import { getTrendingPapers } from '@/lib/papers';
import { selectTopTopics } from '@/lib/topic-ranking';
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

    // Fetch from all sources in parallel, keeping each source's results separate
    // so none of them can crowd another out during selection (see selectTopTopics).
    const [redditTopics, hnTopics, paperTopics] = await Promise.all([
      getTrendingTopics(5),
      getTrendingHNTopics(5),
      getTrendingPapers(5),
    ]);

    const topics = selectTopTopics([redditTopics, hnTopics, paperTopics], 3);

    if (topics.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new trending topics found',
        articlesCreated: 0,
      });
    }

    const results: string[] = [];

    for (const topic of topics) {
      let comments: string[] = [];
      if (topic.source === 'hackernews') {
        const storyId = parseInt(topic.permalink.split('id=')[1]);
        comments = await getHNComments(storyId);
      } else if (topic.source === 'papers') {
        // Papers use abstract as context, no comments to fetch
      } else {
        comments = await getPostDetails(topic.permalink);
      }

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
