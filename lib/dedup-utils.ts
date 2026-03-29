// Extract meaningful keywords from a title (ignore common words)
export function extractKeywords(title: string): Set<string> {
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
export function isSimilarTitle(title1: string, title2: string): boolean {
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

// Format source label for display
export function formatSourceLabel(source: string): string {
  if (source === 'arXiv') return 'arXiv';
  if (source === 'HackerNews') return 'Hacker News';
  return `r/${source}`;
}
