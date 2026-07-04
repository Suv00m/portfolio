import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { getTrendingTopics, getPostDetails, NewsTopic } from '@/lib/reddit';
import { getTrendingHNTopics, getHNComments } from '@/lib/hackernews';
import { getTrendingPapers } from '@/lib/papers';
import { selectTopTopics } from '@/lib/topic-ranking';
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
    const sources: string[] = body.sources || ['reddit', 'hackernews', 'papers'];

    // Fetch from selected sources in parallel, keeping each source's results separate
    // so none of them can crowd another out during selection (see selectTopTopics).
    const sourceFetches: { source: string; promise: Promise<NewsTopic[]> }[] = [];
    if (sources.includes('reddit')) sourceFetches.push({ source: 'reddit', promise: getTrendingTopics(count + 2, subreddits) });
    if (sources.includes('hackernews')) sourceFetches.push({ source: 'hackernews', promise: getTrendingHNTopics(count + 2) });
    if (sources.includes('papers')) sourceFetches.push({ source: 'papers', promise: getTrendingPapers(count + 2) });

    const perSourceTopics = await Promise.all(sourceFetches.map((s) => s.promise));
    const sourceCounts = Object.fromEntries(
      sourceFetches.map((s, i) => [s.source, perSourceTopics[i].length])
    );

    const topics = selectTopTopics(perSourceTopics, count);

    if (topics.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new trending topics found',
        articlesCreated: 0,
        sourceCounts,
      });
    }

    const results: { slug: string; title: string }[] = [];

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
          results.push({ slug: created.slug, title: created.title });
        }
      }
    }

    return NextResponse.json({
      success: true,
      articlesCreated: results.length,
      articles: results,
      sourceCounts,
    });
  } catch (error) {
    console.error('Generate news error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate news' },
      { status: 500 }
    );
  }
}
