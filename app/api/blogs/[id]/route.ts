import { NextRequest, NextResponse } from 'next/server';
import { getBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/blogs';
import { requireAuth } from '@/lib/auth-middleware';

// GET - Fetch a single blog post (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getBlogPost(id);

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authError = await requireAuth(request);
    if (authError) return authError;

    const { id } = await params;
    await deleteBlogPost(id);

    return NextResponse.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}

// PUT - Update a blog post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authError = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { id } = await params;

    const data = await updateBlogPost(id, {
      title: body.title,
      description: body.description,
      links: body.links || [],
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}
