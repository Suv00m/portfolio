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
    const { content, action } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'Action is required (expand, improve, summarize, fix-grammar)' },
        { status: 400 }
      );
    }

    let prompt = '';
    const contentPreview = content.length > 1000 ? content.substring(0, 1000) + '...' : content;

    switch (action) {
      case 'expand':
        prompt = `You are a helpful writing assistant. Expand the following text to make it more detailed and comprehensive while maintaining the original tone and style. Add more context, examples, or explanations where appropriate.

Original text:
${contentPreview}

Expanded version:`;
        break;

      case 'improve':
        prompt = `You are a professional editor. Improve the following text by enhancing clarity, flow, and readability. Keep the core message and tone the same, but make it more polished and engaging.

Original text:
${contentPreview}

Improved version:`;
        break;

      case 'summarize':
        prompt = `You are a helpful writing assistant. Create a concise summary of the following text. Capture the main points and key ideas.

Original text:
${contentPreview}

Summary:`;
        break;

      case 'fix-grammar':
        prompt = `You are a grammar and style editor. Fix any grammatical errors, spelling mistakes, and improve the clarity of the following text. Maintain the original meaning and tone.

Original text:
${contentPreview}

Corrected version:`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: expand, improve, summarize, or fix-grammar' },
          { status: 400 }
        );
    }

    const { text: result } = await generateText({
      model: openrouter!(MODEL_CONFIG.assist),
      prompt,
      maxTokens: 2000,
      temperature: action === 'summarize' ? 0.3 : 0.7,
    } as any);

    return NextResponse.json({ result: result.trim() });
  } catch (error) {
    console.error('Writing assistance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
