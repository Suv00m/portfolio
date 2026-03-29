import { getExistingSourceUrls, getExistingTitles } from './news';
import { isSimilarTitle } from './dedup-utils';
import { NewsTopic } from './reddit';

interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  time: number;
  descendants: number;
  kids?: number[];
  type: string;
}

// Simple in-memory cache (1 hour TTL)
let storiesCache: { data: HNStory[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

async function fetchStoryDetails(id: number): Promise<HNStory | null> {
  try {
    const response = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchTopStories(): Promise<HNStory[]> {
  if (storiesCache && Date.now() - storiesCache.timestamp < CACHE_TTL_MS) {
    return storiesCache.data;
  }

  try {
    const response = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json'
    );
    if (!response.ok) {
      console.error('Failed to fetch HN top stories:', response.status);
      return [];
    }

    const ids: number[] = await response.json();
    const top30 = ids.slice(0, 30);

    // Fetch in batches of 5 to be polite
    const stories: HNStory[] = [];
    for (let i = 0; i < top30.length; i += 5) {
      const batch = top30.slice(i, i + 5);
      const results = await Promise.all(batch.map(fetchStoryDetails));
      for (const story of results) {
        if (story) stories.push(story);
      }
    }

    storiesCache = { data: stories, timestamp: Date.now() };
    return stories;
  } catch (error) {
    console.error('Error fetching HN top stories:', error);
    return [];
  }
}

export async function getTrendingHNTopics(count: number = 5): Promise<NewsTopic[]> {
  const now = Date.now() / 1000;
  const oneDayAgo = now - 24 * 60 * 60;

  const stories = await fetchTopStories();

  const filtered = stories
    .filter((s) => s.type === 'story' && s.score > 50 && s.time > oneDayAgo)
    .filter((s) => !s.title.startsWith('Ask HN') && !s.title.startsWith('Show HN'))
    .map((s) => {
      const ageHours = Math.max((now - s.time) / 3600, 1);
      const engagementRate = (s.score + (s.descendants || 0) * 2) / ageHours;
      return { ...s, engagementRate };
    })
    .sort((a, b) => b.engagementRate - a.engagementRate);

  const [existingUrls, existingTitles] = await Promise.all([
    getExistingSourceUrls(),
    getExistingTitles(),
  ]);
  const existingUrlSet = new Set(existingUrls);

  const deduplicated = filtered.filter((story) => {
    const sourceUrl = `https://news.ycombinator.com/item?id=${story.id}`;
    if (existingUrlSet.has(sourceUrl)) return false;
    for (const existingTitle of existingTitles) {
      if (isSimilarTitle(story.title, existingTitle)) return false;
    }
    return true;
  });

  const uniqueTopics: typeof deduplicated = [];
  for (const story of deduplicated) {
    const isDuplicate = uniqueTopics.some((existing) =>
      isSimilarTitle(story.title, existing.title)
    );
    if (!isDuplicate) uniqueTopics.push(story);
  }

  return uniqueTopics.slice(0, count).map((story) => ({
    title: story.title,
    score: story.score,
    url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
    permalink: `/item?id=${story.id}`,
    selftext: '',
    subreddit: 'HackerNews',
    created_utc: story.time,
    num_comments: story.descendants || 0,
    sourceUrl: `https://news.ycombinator.com/item?id=${story.id}`,
    source: 'hackernews',
  }));
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

export async function getHNComments(storyId: number): Promise<string[]> {
  try {
    const story = await fetchStoryDetails(storyId);
    if (!story?.kids?.length) return [];

    const commentIds = story.kids.slice(0, 10);
    const comments: string[] = [];

    for (let i = 0; i < commentIds.length; i += 5) {
      const batch = commentIds.slice(i, i + 5);
      const results = await Promise.all(batch.map(fetchStoryDetails));
      for (const comment of results) {
        if (comment && 'text' in comment && typeof (comment as any).text === 'string') {
          comments.push(stripHtmlTags((comment as any).text));
        }
      }
    }

    return comments;
  } catch (error) {
    console.error('Error fetching HN comments:', error);
    return [];
  }
}
