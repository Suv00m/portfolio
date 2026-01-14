import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openrouter, MODEL_CONFIG, isAIEnabled } from '@/lib/ai-config';

export async function POST(request: NextRequest) {
  if (!isAIEnabled()) {
    return NextResponse.json(
      { error: 'AI features are disabled. Please set OPENROUTER_API_KEY.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { existingTitles } = body || {};

    // Build context from existing titles if provided
    let contextPrompt = '';
    if (existingTitles && Array.isArray(existingTitles) && existingTitles.length > 0) {
      contextPrompt = `\n\nExisting blog post titles:\n${existingTitles.slice(0, 10).map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}\n\nGenerate new, unique ideas that are different from these.`;
    }

    const prompt = `You are a creative blog content strategist. Generate 5 engaging blog post topic ideas that would be interesting for a personal blog or portfolio website.

Requirements:
- Each idea should be a concise, catchy title (5-10 words)
- Ideas should be diverse and cover different topics
- Make them engaging and thought-provoking
- Format as a numbered list${contextPrompt}

Generate 5 blog post ideas:`;

    const { text } = await generateText({
      model: openrouter!(MODEL_CONFIG.ideas),
      prompt,
      maxTokens: 300,
      temperature: 0.9, // Higher temperature for more creative ideas
    } as any);

    // Parse the response to extract individual ideas
    const ideas = text
      .split('\n')
      .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter((line) => line.length > 0 && line.length < 100)
      .slice(0, 5);

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('Ideas generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
