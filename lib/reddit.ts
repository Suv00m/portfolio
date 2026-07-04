import { XMLParser } from 'fast-xml-parser';
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

const REDDIT_HEADERS = { 'User-Agent': 'web:news-aggregator:v1.0 (by /u/newsbot)' };

// Reddit's unauthenticated .json API 403s from most cloud/datacenter IPs. The Atom
// feed isn't blocked the same way and still reflects the subreddit's real "hot" order.
const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', isArray: (name) => name === 'entry' });

function stripHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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
      `https://www.reddit.com/r/${subreddit}/hot/.rss?limit=25`,
      { headers: REDDIT_HEADERS }
    );

    if (!response.ok) {
      const reason = response.status === 429 ? 'rate-limited' : `HTTP ${response.status}`;
      console.error(`Failed to fetch r/${subreddit}/hot: ${reason}`);
      return [];
    }

    const xml = await response.text();
    const entries = xmlParser.parse(xml)?.feed?.entry || [];

    // The Atom feed has no vote/comment counts, so score is a rank-based stand-in
    // for the feed's own "hot" position — highest-ranked entry first.
    const posts: RedditPost[] = entries.map((entry: any, index: number) => {
      const href = entry.link?.['@_href'] || '';
      let permalink = href;
      try {
        permalink = new URL(href).pathname;
      } catch {}

      return {
        title: entry.title || '',
        score: (entries.length - index) * 5,
        url: href,
        permalink,
        selftext: stripHtml(entry.content?.['#text'] || '').slice(0, 1000),
        subreddit,
        created_utc: new Date(entry.published || entry.updated).getTime() / 1000,
        num_comments: 0,
      };
    });

    cache.set(cacheKey, { data: posts, timestamp: Date.now() });
    return posts;
  } catch (error) {
    console.error(`Error fetching r/${subreddit}/hot:`, error);
    return [];
  }
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Reddit allows roughly one unauthenticated request per ~30-60s window per IP, then
// 429s (confirmed via x-ratelimit-* response headers) — so in practice only the first
// subreddit or two in the list will actually succeed per call. Shuffling the order
// means a different subreddit gets that slot each time, so coverage rotates across
// runs instead of the same 9 always starving behind a fixed first pick.
async function fetchAllSubreddits(subs: string[]): Promise<RedditPost[]> {
  const allPosts: RedditPost[] = [];
  for (const sub of shuffled(subs)) {
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
    .filter((post) => post.created_utc > oneDayAgo)
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
      `https://www.reddit.com${permalink}.rss`,
      { headers: REDDIT_HEADERS }
    );

    if (!response.ok) return [];

    const xml = await response.text();
    const entries = xmlParser.parse(xml)?.feed?.entry || [];

    // First entry is the post itself (id starts with t3_); the rest are comments (t1_).
    return entries
      .filter((entry: any) => entry.id?.startsWith('t1_'))
      .slice(0, 10)
      .map((entry: any) => stripHtml(entry.content?.['#text'] || '').slice(0, 500))
      .filter(Boolean);
  } catch (error) {
    console.error('Error fetching post details:', error);
    return [];
  }
}
