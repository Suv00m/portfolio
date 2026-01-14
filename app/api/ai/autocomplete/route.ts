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
    const { text, cursorPosition } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Get context around cursor (last 500 characters)
    const context = text.slice(Math.max(0, cursorPosition - 500), cursorPosition);
    const textAfterCursor = text.slice(cursorPosition, cursorPosition + 50);

    // Create a prompt for autocomplete
    const prompt = `You are a helpful writing assistant. Complete the following text naturally and concisely. Only provide the continuation, not the original text.

Text so far: "${context}"

Continue from here (provide only the next few words or sentence, be concise):`;

    const { text: suggestion } = await generateText({
      model: openrouter!(MODEL_CONFIG.autocomplete),
      prompt,
      maxTokens: 50, // Short suggestions for autocomplete
      temperature: 0.7,
    } as any);

    return NextResponse.json({ suggestion: suggestion.trim() });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
