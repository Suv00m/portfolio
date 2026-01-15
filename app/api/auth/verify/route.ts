import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    return NextResponse.json({ 
      success: true, 
      authenticated 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 500 }
    );
  }
}
