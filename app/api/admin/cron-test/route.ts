import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { getCronHour, setCronHour } from '@/lib/settings';

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

    // Call the cron endpoint internally, skipping hour check for manual triggers
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const cronUrl = `${protocol}://${host}/api/cron/news`;

    const response = await fetch(cronUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        'x-skip-hour-check': 'true',
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

    const cronHour = await getCronHour();
    const istHour = (cronHour + 5) % 24;
    const istPeriod = istHour >= 12 ? 'PM' : 'AM';
    const istDisplay = istHour === 0 ? 12 : istHour > 12 ? istHour - 12 : istHour;

    return NextResponse.json({
      success: true,
      config: {
        cronSecret: !!cronSecret,
        supabase: !!supabaseUrl,
        openrouter: !!openrouterKey,
        pexels: !!pexelsKey,
        schedule: `Daily at ${istDisplay}:30 ${istPeriod} IST (${cronHour}:00 UTC)`,
        cronHour,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check config' },
      { status: 500 }
    );
  }
}

// PUT — update cron schedule hour
export async function PUT(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const { hour } = await request.json();

    if (typeof hour !== 'number' || hour < 0 || hour > 23 || !Number.isInteger(hour)) {
      return NextResponse.json(
        { success: false, error: 'Hour must be an integer between 0 and 23' },
        { status: 400 }
      );
    }

    const updated = await setCronHour(hour);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update cron hour' },
        { status: 500 }
      );
    }

    const istH = (hour + 5) % 24;
    const istPeriod = istH >= 12 ? 'PM' : 'AM';
    const istDisplay = istH === 0 ? 12 : istH > 12 ? istH - 12 : istH;
    const schedule = `Daily at ${istDisplay}:30 ${istPeriod} IST (${hour}:00 UTC)`;

    return NextResponse.json({ success: true, hour, schedule });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}
