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
    // 12k chars (~2-3k words) covers the actual length of posts written in this editor;
    // still capped so a runaway input can't blow up the prompt.
    const contentPreview = content.length > 12000 ? content.substring(0, 12000) + '...' : content;
    const formatNote = 'Respond in Markdown (use headings, bold, and lists only where the source already implies that structure). Write in a natural, human voice: match the original text\'s tone, vocabulary, and sentence rhythm rather than sounding like a generic AI assistant. Never use em dashes (—) or en dashes (–) as punctuation, use commas, periods, or parentheses instead. Output only the rewritten text, no preamble, no commentary, no "Here is the result" framing.';

    switch (action) {
      case 'expand':
        prompt = `You are a helpful writing assistant. Expand the following text to make it more detailed and comprehensive while maintaining the original tone and style. Add more context, examples, or explanations where appropriate. ${formatNote}

Original text:
${contentPreview}

Expanded version:`;
        break;

      case 'improve':
        prompt = `You are a professional editor. Improve the following text by enhancing clarity, flow, and readability. Keep the core message and tone the same, but make it more polished and engaging. ${formatNote}

Original text:
${contentPreview}

Improved version:`;
        break;

      case 'summarize':
        prompt = `You are a helpful writing assistant. Create a concise summary of the following text. Capture the main points and key ideas. ${formatNote}

Original text:
${contentPreview}

Summary:`;
        break;

      case 'fix-grammar':
        prompt = `You are a grammar and style editor. Fix any grammatical errors, spelling mistakes, and improve the clarity of the following text. Maintain the original meaning and tone. ${formatNote}

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
      maxTokens: 8000,
      temperature: action === 'summarize' ? 0.3 : 0.7,
    } as any);

    // Belt-and-suspenders: the prompt already bans em/en dashes, but catch any that slip through.
    const cleaned = result.trim().replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',');

    return NextResponse.json({ result: cleaned });
  } catch (error) {
    console.error('Writing assistance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
