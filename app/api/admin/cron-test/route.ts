import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

export const maxDuration = 60;

// POST — trigger the cron job manually from admin (uses admin auth, not CRON_SECRET)
export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json({
        success: false,
        error: 'CRON_SECRET is not configured',
      }, { status: 500 });
    }

    // Call the cron endpoint internally
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const cronUrl = `${protocol}://${host}/api/cron/news`;

    const response = await fetch(cronUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    const result = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      result,
    });
  } catch (error) {
    console.error('Cron test error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger cron job' },
      { status: 500 }
    );
  }
}

// GET — check cron configuration status
export async function GET(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const cronSecret = process.env.CRON_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const pexelsKey = process.env.PEXELS_API_KEY;

    return NextResponse.json({
      success: true,
      config: {
        cronSecret: !!cronSecret,
        supabase: !!supabaseUrl,
        openrouter: !!openrouterKey,
        pexels: !!pexelsKey,
        schedule: '0 8 * * * (Daily at 8 AM UTC)',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check config' },
      { status: 500 }
    );
  }
}
