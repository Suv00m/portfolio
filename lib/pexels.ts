const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function searchPexelsImage(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY) {
    console.warn('PEXELS_API_KEY is not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=1&per_page=1`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error('Pexels API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src?.large2x || data.photos[0].src?.large || null;
    }

    return null;
  } catch (error) {
    console.error('Pexels search error:', error);
    return null;
  }
}
