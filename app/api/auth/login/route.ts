import { NextRequest, NextResponse } from 'next/server';
import { createSession, checkRateLimit, clearRateLimit } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey } = body;

    if (!adminKey) {
      return NextResponse.json(
        { success: false, error: 'Admin key is required' },
        { status: 400 }
      );
    }

    // Rate limiting - use IP address as identifier
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimit.retryAfter
        },
        { status: 429 }
      );
    }

    // Verify admin key
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin key' },
        { status: 401 }
      );
    }

    // Create session token
    const sessionToken = await createSession();

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    // Clear rate limit on successful login
    clearRateLimit(ip);

    return NextResponse.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process login' },
      { status: 500 }
    );
  }
}
