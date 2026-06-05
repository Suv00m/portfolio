import { supabase, supabaseAdmin } from './supabase';
import { ReactionCounts, ReactionType } from './types';

export async function getReactions(pagePath: string): Promise<ReactionCounts> {
  const { data, error } = await supabase
    .from('post_reactions')
    .select('reaction_type')
    .eq('page_path', pagePath);

  if (error) {
    console.error('Error getting reactions:', error);
    return { like: 0, love: 0, fire: 0, think: 0 };
  }

  const counts: ReactionCounts = { like: 0, love: 0, fire: 0, think: 0 };
  for (const row of data || []) {
    const type = row.reaction_type as ReactionType;
    if (type in counts) counts[type]++;
  }
  return counts;
}

export async function getUserReactions(pagePath: string, fingerprint: string): Promise<ReactionType[]> {
  const { data, error } = await supabase
    .from('post_reactions')
    .select('reaction_type')
    .eq('page_path', pagePath)
    .eq('fingerprint', fingerprint);

  if (error) {
    console.error('Error getting user reactions:', error);
    return [];
  }

  return (data || []).map((r) => r.reaction_type as ReactionType);
}

export async function toggleReaction(
  pagePath: string,
  reactionType: ReactionType,
  fingerprint: string
): Promise<{ added: boolean }> {
  // Check if already reacted
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('id')
    .eq('page_path', pagePath)
    .eq('reaction_type', reactionType)
    .eq('fingerprint', fingerprint)
    .single();

  if (existing) {
    // Remove reaction
    await supabaseAdmin
      .from('post_reactions')
      .delete()
      .eq('id', existing.id);
    return { added: false };
  }

  // Add reaction
  const { error } = await supabaseAdmin
    .from('post_reactions')
    .insert({ page_path: pagePath, reaction_type: reactionType, fingerprint });

  if (error) {
    console.error('Error adding reaction:', error);
    throw new Error('Failed to add reaction');
  }

  return { added: true };
}
