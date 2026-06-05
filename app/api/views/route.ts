import { NextRequest, NextResponse } from 'next/server';
import { trackView, getViewCount } from '@/lib/views';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path) {
    return NextResponse.json({ success: false, error: 'Missing path' }, { status: 400 });
  }

  const count = await getViewCount(path);
  return NextResponse.json({ success: true, count });
}

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    if (!path) {
      return NextResponse.json({ success: false, error: 'Missing path' }, { status: 400 });
    }

    await trackView(path);
    const count = await getViewCount(path);
    return NextResponse.json({ success: true, count });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
