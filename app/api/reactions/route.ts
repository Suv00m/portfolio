import { NextRequest, NextResponse } from 'next/server';
import { getReactions, getUserReactions, toggleReaction } from '@/lib/reactions';
import { ReactionType } from '@/lib/types';

const VALID_REACTIONS: ReactionType[] = ['like', 'love', 'fire', 'think'];

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  const fingerprint = request.nextUrl.searchParams.get('fp');

  if (!path) {
    return NextResponse.json({ success: false, error: 'Missing path' }, { status: 400 });
  }

  const counts = await getReactions(path);
  const userReactions = fingerprint ? await getUserReactions(path, fingerprint) : [];

  return NextResponse.json({ success: true, counts, userReactions });
}

export async function POST(request: NextRequest) {
  try {
    const { path, reaction, fingerprint } = await request.json();

    if (!path || !reaction || !fingerprint) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    if (!VALID_REACTIONS.includes(reaction)) {
      return NextResponse.json({ success: false, error: 'Invalid reaction' }, { status: 400 });
    }

    const result = await toggleReaction(path, reaction, fingerprint);
    const counts = await getReactions(path);

    return NextResponse.json({ success: true, ...result, counts });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
