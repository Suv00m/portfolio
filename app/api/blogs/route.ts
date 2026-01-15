import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogPosts, createBlogPost } from '@/lib/blogs';
import { CreateBlogPost } from '@/lib/types';
import { requireAuth } from '@/lib/auth-middleware';

// GET - Fetch all blog posts (public)
export async function GET() {
  try {
    const data = await getAllBlogPosts();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST - Create a new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authError = await requireAuth(request);
    if (authError) return authError;

    const body: CreateBlogPost = await request.json();

    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const data = await createBlogPost(body);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
