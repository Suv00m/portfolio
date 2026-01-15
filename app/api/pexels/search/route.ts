import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authError = await requireAuth(request);
    if (authError) return authError;

    if (!PEXELS_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'PEXELS_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '20';

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY, // Pexels API uses API key directly, not Bearer token
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Pexels API error' }));
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to search images' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform Pexels response to our format
    const images = data.photos.map((photo: any) => {
      // Pexels provides multiple image sizes in photo.src
      // Use 'large' for both preview and selection since that's what works
      const imageUrl = photo.src?.large || photo.src?.large2x || photo.src?.original;
      
      return {
        id: photo.id,
        url: photo.src?.large2x || photo.src?.large || photo.src?.original, // Use large2x for final selection (higher quality)
        thumbnail: imageUrl, // Use large for preview (same URL that works when selected)
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        alt: photo.alt || `Photo by ${photo.photographer}`,
        width: photo.width,
        height: photo.height,
      };
    });

    return NextResponse.json({
      success: true,
      images,
      page: data.page,
      perPage: data.per_page,
      totalResults: data.total_results,
      nextPage: data.next_page,
    });
  } catch (error) {
    console.error('Pexels search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search images' },
      { status: 500 }
    );
  }
}
