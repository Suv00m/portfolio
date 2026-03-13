import { NextRequest, NextResponse } from 'next/server';
import { getAllNewsArticles, createNewsArticle } from '@/lib/news';
import { requireAuth } from '@/lib/auth-middleware';
import { CreateNewsArticle } from '@/lib/types';

export async function GET() {
  try {
    const articles = await getAllNewsArticles();
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const body: CreateNewsArticle = await request.json();

    if (!body.title || !body.slug || !body.description || !body.excerpt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const article = await createNewsArticle(body);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Failed to create article' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create news article' },
      { status: 500 }
    );
  }
}
