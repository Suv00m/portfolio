import { generateText } from 'ai';
import { openrouter, MODEL_CONFIG, isAIEnabled } from './ai-config';
import { CreateNewsArticle } from './types';
import { RedditTopic } from './reddit';
import { searchPexelsImage } from './pexels';

interface ArticleOutline {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  pexelsQuery: string;
  section1_heading: string;
  section2_heading: string;
  section3_heading: string;
}

interface ArticleBody {
  intro: string;
  section1: string;
  section2: string;
  section3: string;
  closure: string;
}

function sanitizeJsonString(raw: string): string {
  const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON object found in response');

  let sanitized = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < jsonMatch[0].length; i++) {
    const char = jsonMatch[0][i];

    if (escaped) {
      sanitized += char;
      escaped = false;
      continue;
    }

    if (char === '\\' && inString) {
      sanitized += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      sanitized += char;
      continue;
    }

    if (inString && char.charCodeAt(0) < 32) {
      if (char === '\n') sanitized += '\\n';
      else if (char === '\r') sanitized += '\\r';
      else if (char === '\t') sanitized += '\\t';
      continue;
    }

    sanitized += char;
  }

  return sanitized;
}

export async function generateNewsArticle(
  topic: RedditTopic,
  comments: string[]
): Promise<CreateNewsArticle | null> {
  if (!isAIEnabled() || !openrouter) {
    console.error('AI is not enabled');
    return null;
  }

  const commentsContext = comments.length > 0
    ? `\nTop community reactions:\n${comments.slice(0, 5).map((c, i) => `${i + 1}. ${c.slice(0, 300)}`).join('\n')}`
    : '';

  // ── STEP 1: Generate outline + metadata ──
  const outlinePrompt = `You are an SEO specialist. Given this trending Reddit topic, create an article outline.

Topic from r/${topic.subreddit}:
Title: ${topic.title}
${topic.selftext ? `Context: ${topic.selftext.slice(0, 800)}` : ''}
Engagement: ${topic.score} upvotes | ${topic.num_comments} comments${commentsContext}

Respond in valid JSON only (no markdown fences):
{
  "title": "SEO headline, power word first, primary keyword early, max 60 chars",
  "slug": "3-5-word-keyword-slug",
  "excerpt": "150-160 char meta description with primary keyword, creates curiosity",
  "tags": ["primary-keyword", "secondary-keyword", "brand-or-entity", "broad-category"],
  "pexelsQuery": "2-3 word image search query",
  "section1_heading": "Question-based heading about what happened (e.g. What Did X Announce?)",
  "section2_heading": "Question-based heading about why it matters (e.g. Why Is This Significant?)",
  "section3_heading": "Question-based heading about impact or future (e.g. What Does This Mean for Developers?)"
}`;

  let outline: ArticleOutline;

  try {
    const { text: outlineText } = await generateText({
      model: openrouter(MODEL_CONFIG.newsGeneration),
      system: 'You are an SEO specialist. Output valid JSON only.',
      prompt: outlinePrompt,
      temperature: 0.7,
      maxOutputTokens: 500,
    });

    outline = JSON.parse(sanitizeJsonString(outlineText));
  } catch (error) {
    console.error('Error generating article outline:', error);
    return null;
  }

  // ── STEP 2: Generate article body with fixed structure ──
  const bodyPrompt = `You are a senior AI/tech journalist. Write the article body for:

"${outline.title}"

Topic from r/${topic.subreddit}: ${topic.title}
${topic.selftext ? `Context: ${topic.selftext.slice(0, 600)}` : ''}${commentsContext}

The article has a FIXED structure. Write ONLY the content for each section below. Use HTML tags (<p>, <ul>, <li>, <strong>, <em>) within each section. Keep paragraphs to 2-3 sentences. Bold key entities and terms.

Respond in valid JSON only (no markdown fences):
{
  "intro": "2-3 paragraph opening hook. Front-load the most important facts. Use <p> tags for each paragraph. Bold key names/terms with <strong>.",
  "section1": "2-3 paragraphs for: ${outline.section1_heading}. Explain the core news/event with details. Use <p> tags.",
  "section2": "2-3 paragraphs for: ${outline.section2_heading}. Explain significance, use a <ul> with 3-4 <li> bullet points for key implications.",
  "section3": "2-3 paragraphs for: ${outline.section3_heading}. Forward-looking analysis, industry reactions, what to watch. Use <p> tags.",
  "closure": "1 short paragraph summarizing the key takeaway. Naturally mention how AI development services help businesses navigate these changes. Use <p> tags."
}`;

  let body: ArticleBody;

  try {
    const { text: bodyText } = await generateText({
      model: openrouter(MODEL_CONFIG.newsGeneration),
      system: 'You are a senior AI/tech journalist. Output valid JSON only. Use HTML tags inside string values.',
      prompt: bodyPrompt,
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    body = JSON.parse(sanitizeJsonString(bodyText));
  } catch (error) {
    console.error('Error generating article body:', error);
    return null;
  }

  // ── STEP 3: Assemble final HTML with fixed structure ──
  const html = [
    body.intro,
    `<h2>${outline.section1_heading}</h2>`,
    body.section1,
    `<h2>${outline.section2_heading}</h2>`,
    body.section2,
    `<h2>${outline.section3_heading}</h2>`,
    body.section3,
    `<h2>Key Takeaway</h2>`,
    body.closure,
  ].join('\n');

  // Fetch thumbnail
  const thumbnail = await searchPexelsImage(outline.pexelsQuery);

  return {
    title: outline.title,
    slug: outline.slug,
    description: html,
    excerpt: outline.excerpt,
    thumbnail: thumbnail || undefined,
    source_urls: [topic.sourceUrl],
    source_subreddit: topic.subreddit,
    tags: outline.tags,
  };
}
