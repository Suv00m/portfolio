import { getExistingSourceUrls, getExistingTitles } from './news';
import { isSimilarTitle } from './dedup-utils';
import { NewsTopic } from './reddit';

interface DailyPaper {
  paper: {
    id: string;
    title: string;
    summary: string;
    upvotes: number;
    publishedAt: string;
    authors: { name: string }[];
    githubRepo?: string;
    githubStars?: number;
    ai_summary?: string;
  };
  numComments: number;
  thumbnail?: string;
}

// Simple in-memory cache (1 hour TTL)
let papersCache: { data: DailyPaper[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

async function fetchDailyPapers(): Promise<DailyPaper[]> {
  if (papersCache && Date.now() - papersCache.timestamp < CACHE_TTL_MS) {
    return papersCache.data;
  }

  try {
    const response = await fetch('https://huggingface.co/api/daily_papers', {
      headers: {},
    });

    if (!response.ok) {
      console.error('Failed to fetch daily papers:', response.status);
      return [];
    }

    const data: DailyPaper[] = await response.json();
    papersCache = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
    console.error('Error fetching daily papers:', error);
    return [];
  }
}

export async function getTrendingPapers(count: number = 5): Promise<NewsTopic[]> {
  const papers = await fetchDailyPapers();

  // Filter papers with summaries
  const withSummaries = papers.filter((p) => p.paper.summary && p.paper.summary.length > 50);

  // Sort by upvotes (HF community engagement)
  const sorted = [...withSummaries].sort((a, b) => b.paper.upvotes - a.paper.upvotes);

  const [existingUrls, existingTitles] = await Promise.all([
    getExistingSourceUrls(),
    getExistingTitles(),
  ]);
  const existingUrlSet = new Set(existingUrls);

  const deduplicated = sorted.filter((entry) => {
    const sourceUrl = `https://huggingface.co/papers/${entry.paper.id}`;
    if (existingUrlSet.has(sourceUrl)) return false;
    for (const existingTitle of existingTitles) {
      if (isSimilarTitle(entry.paper.title, existingTitle)) return false;
    }
    return true;
  });

  const uniqueTopics: DailyPaper[] = [];
  for (const entry of deduplicated) {
    const isDuplicate = uniqueTopics.some((existing) =>
      isSimilarTitle(entry.paper.title, existing.paper.title)
    );
    if (!isDuplicate) uniqueTopics.push(entry);
  }

  return uniqueTopics.slice(0, count).map((entry) => {
    const paper = entry.paper;
    const score = paper.upvotes + (paper.githubStars || 0);

    return {
      title: paper.title,
      score,
      url: `https://huggingface.co/papers/${paper.id}`,
      permalink: `https://huggingface.co/papers/${paper.id}`,
      selftext: paper.summary,
      subreddit: 'arXiv',
      created_utc: new Date(paper.publishedAt).getTime() / 1000,
      num_comments: entry.numComments || 0,
      sourceUrl: `https://huggingface.co/papers/${paper.id}`,
      source: 'papers',
    };
  });
}
