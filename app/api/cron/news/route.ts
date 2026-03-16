import { NextRequest, NextResponse } from 'next/server';
import { getTrendingTopics, getPostDetails, NewsTopic } from '@/lib/reddit';
import { getTrendingHNTopics, getHNComments } from '@/lib/hackernews';
import { generateNewsArticle } from '@/lib/news-generator';
import { createNewsArticle } from '@/lib/news';
import { getCronHour } from '@/lib/settings';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current hour matches configured schedule
    const skipCheck = request.headers.get('x-skip-hour-check') === 'true';
    if (!skipCheck) {
      const currentHour = new Date().getUTCHours();
      const configuredHour = await getCronHour();
      if (currentHour !== configuredHour) {
        return NextResponse.json({
          success: true,
          message: 'Not scheduled for this hour',
          skipped: true,
        });
      }
    }

    // Fetch from both sources in parallel
    const [redditTopics, hnTopics] = await Promise.all([
      getTrendingTopics(5),
      getTrendingHNTopics(5),
    ]);

    // Combine and rank by engagement rate, pick top 3
    const allTopics: (NewsTopic & { engagementRate: number })[] = [
      ...redditTopics,
      ...hnTopics,
    ].map((topic) => {
      const now = Date.now() / 1000;
      const ageHours = Math.max((now - topic.created_utc) / 3600, 1);
      const engagementRate = (topic.score + topic.num_comments * 2) / ageHours;
      return { ...topic, engagementRate };
    });

    allTopics.sort((a, b) => b.engagementRate - a.engagementRate);
    const topics = allTopics.slice(0, 3);

    if (topics.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new trending topics found',
        articlesCreated: 0,
      });
    }

    const results: string[] = [];

    for (const topic of topics) {
      let comments: string[];
      if (topic.source === 'hackernews') {
        const storyId = parseInt(topic.permalink.split('id=')[1]);
        comments = await getHNComments(storyId);
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
