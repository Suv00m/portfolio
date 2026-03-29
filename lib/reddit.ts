import { getExistingSourceUrls, getExistingTitles } from './news';
import { isSimilarTitle } from './dedup-utils';

const SUBREDDITS = [
  'artificial',
  'MachineLearning',
  'technology',
  'LocalLLaMA',
  'singularity',
  'ChatGPT',
  'OpenAI',
  'StableDiffusion',
  'GoogleGeminiAI',
  'datascience',
];

// Simple in-memory cache (1 hour TTL)
const cache = new Map<string, { data: RedditPost[]; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface RedditPost {
  title: string;
  score: number;
  url: string;
  permalink: string;
  selftext: string;
  subreddit: string;
  created_utc: number;
  num_comments: number;
}

export interface NewsTopic {
  title: string;
  score: number;
  url: string;
  permalink: string;
  selftext: string;
  subreddit: string;
  created_utc: number;
  num_comments: number;
  sourceUrl: string;
  source: 'reddit' | 'hackernews' | 'papers';
}

export type RedditTopic = NewsTopic;

async function fetchSubreddit(subreddit: string): Promise<RedditPost[]> {
  const cacheKey = subreddit.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`,
      { headers: {} }
    );

    if (!response.ok) {
      console.error(`Failed to fetch r/${subreddit}/hot:`, response.status);
      return [];
    }

    const data = await response.json();
    const posts: RedditPost[] = (data?.data?.children || []).map((child: any) => child.data);
    cache.set(cacheKey, { data: posts, timestamp: Date.now() });
    return posts;
  } catch (error) {
    console.error(`Error fetching r/${subreddit}/hot:`, error);
    return [];
  }
}

// Fetch subreddits sequentially to avoid burst detection
async function fetchAllSubreddits(subs: string[]): Promise<RedditPost[]> {
  const allPosts: RedditPost[] = [];
  for (const sub of subs) {
    const posts = await fetchSubreddit(sub);
    allPosts.push(...posts);
  }
  return allPosts;
}

export async function getTrendingTopics(count: number = 5, subreddits?: string[]): Promise<NewsTopic[]> {
  const subs = subreddits || SUBREDDITS;
  const now = Date.now() / 1000;
  const oneDayAgo = now - 24 * 60 * 60;

  const allPosts = await fetchAllSubreddits(subs);

  const filtered = allPosts
    .filter((post) => post.score > 50 && post.created_utc > oneDayAgo)
    .filter((post) => !post.url?.includes('reddit.com/gallery'))
    .filter((post) => !post.title?.toLowerCase().includes('[d]') && !post.title?.toLowerCase().includes('[discussion]'))
    // Rank by trending velocity: high engagement relative to age
    .map((post) => {
      const ageHours = Math.max((now - post.created_utc) / 3600, 1);
      const engagementRate = (post.score + post.num_comments * 2) / ageHours;
      return { ...post, engagementRate };
    })
    .sort((a, b) => b.engagementRate - a.engagementRate);

  // Deduplicate against existing articles — by URL and title similarity
  const [existingUrls, existingTitles] = await Promise.all([
    getExistingSourceUrls(),
    getExistingTitles(),
  ]);
  const existingUrlSet = new Set(existingUrls);

  const deduplicated = filtered.filter((post) => {
    const sourceUrl = `https://www.reddit.com${post.permalink}`;

    // Check exact URL match
    if (existingUrlSet.has(sourceUrl)) return false;

    // Check title similarity against existing articles
    for (const existingTitle of existingTitles) {
      if (isSimilarTitle(post.title, existingTitle)) return false;
    }

    return true;
  });

  // Also deduplicate within the batch itself (same topic from different subreddits)
  const uniqueTopics: RedditPost[] = [];
  for (const post of deduplicated) {
    const isDuplicateInBatch = uniqueTopics.some((existing) =>
      isSimilarTitle(post.title, existing.title)
    );
    if (!isDuplicateInBatch) {
      uniqueTopics.push(post);
    }
  }

  return uniqueTopics.slice(0, count).map((post) => ({
    title: post.title,
    score: post.score,
    url: post.url,
    permalink: post.permalink,
    selftext: post.selftext,
    subreddit: post.subreddit,
    created_utc: post.created_utc,
    num_comments: post.num_comments,
    sourceUrl: `https://www.reddit.com${post.permalink}`,
    source: 'reddit',
  }));
}

export async function getPostDetails(permalink: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://www.reddit.com${permalink}.json?limit=10`
    );

    if (!response.ok) return [];

    const data = await response.json();
    const comments = data?.[1]?.data?.children || [];

    return comments
      .filter((c: any) => c.kind === 't1' && c.data?.body)
      .slice(0, 10)
      .map((c: any) => c.data.body);
  } catch (error) {
    console.error('Error fetching post details:', error);
    return [];
  }
}
