import { NextRequest, NextResponse } from 'next/server';
import { getNewsArticleBySlug, deleteNewsArticle } from '@/lib/news';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await getNewsArticleBySlug(slug);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error('Error fetching news article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const { slug } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('news_articles')
      .update(body)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update article' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating news article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const { slug } = await params;
    const article = await getNewsArticleBySlug(slug);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    const deleted = await deleteNewsArticle(article.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete article' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting news article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
