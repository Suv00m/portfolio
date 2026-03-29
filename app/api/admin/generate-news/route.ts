import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { getTrendingTopics, getPostDetails, NewsTopic } from '@/lib/reddit';
import { getTrendingHNTopics, getHNComments } from '@/lib/hackernews';
import { getTrendingPapers } from '@/lib/papers';
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

    // Fetch from selected sources in parallel
    const fetches: Promise<NewsTopic[]>[] = [];
    if (sources.includes('reddit')) fetches.push(getTrendingTopics(count + 2, subreddits));
    if (sources.includes('hackernews')) fetches.push(getTrendingHNTopics(count + 2));
    if (sources.includes('papers')) fetches.push(getTrendingPapers(count + 2));

    const results_arr = await Promise.all(fetches);

    // Combine and rank by engagement rate
    const allTopics: (NewsTopic & { engagementRate: number })[] = results_arr
      .flat()
      .map((topic) => {
      const now = Date.now() / 1000;
      const ageHours = Math.max((now - topic.created_utc) / 3600, 1);
      const engagementRate = (topic.score + topic.num_comments * 2) / ageHours;
      return { ...topic, engagementRate };
    });

    allTopics.sort((a, b) => b.engagementRate - a.engagementRate);
    const topics = allTopics.slice(0, count);

    if (topics.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new trending topics found',
        articlesCreated: 0,
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
    });
  } catch (error) {
    console.error('Generate news error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate news' },
      { status: 500 }
    );
  }
}
