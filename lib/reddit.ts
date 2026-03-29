import { getExistingSourceUrls, getExistingTitles } from './news';

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
  source: 'reddit' | 'hackernews';
}

export type RedditTopic = NewsTopic;

// Extract meaningful keywords from a title (ignore common words)
function extractKeywords(title: string): Set<string> {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or',
    'not', 'no', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'each',
    'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such',
    'than', 'too', 'very', 'just', 'about', 'up', 'out', 'if', 'then',
    'that', 'this', 'these', 'those', 'it', 'its', 'my', 'your', 'his',
    'her', 'our', 'their', 'what', 'which', 'who', 'whom', 'how', 'when',
    'where', 'why', 'new', 'now', 'also', 'like', 'get', 'got', 'one',
    'two', 'first', 'over', 'only', 'even', 'back', 'still', 'well',
  ]);

  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  );
}

// Check if two titles are about the same topic (>50% keyword overlap)
function isSimilarTitle(title1: string, title2: string): boolean {
  const keywords1 = extractKeywords(title1);
  const keywords2 = extractKeywords(title2);

  if (keywords1.size === 0 || keywords2.size === 0) return false;

  let overlap = 0;
  for (const word of keywords1) {
    if (keywords2.has(word)) overlap++;
  }

  const smaller = Math.min(keywords1.size, keywords2.size);
  return smaller > 0 && overlap / smaller > 0.5;
}

async function fetchSubreddit(subreddit: string): Promise<RedditPost[]> {
  const cacheKey = subreddit.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`,
      { headers: { 'User-Agent': 'web:news-aggregator:v1.0 (by /u/newsbot)' } }
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
