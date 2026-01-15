import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from './auth';

/**
 * Middleware to check authentication for API routes
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please login.' },
      { status: 401 }
    );
  }

  return null; // Authentication passed
}
