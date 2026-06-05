import { supabase, supabaseAdmin } from './supabase';

export async function trackView(pagePath: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('page_views')
    .insert({ page_path: pagePath });

  if (error) {
    console.error('Error tracking view:', error);
  }
}

export async function getViewCount(pagePath: string): Promise<number> {
  const { count, error } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('page_path', pagePath);

  if (error) {
    console.error('Error getting view count:', error);
    return 0;
  }

  return count || 0;
}

export async function getViewCounts(pagePaths: string[]): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('page_views')
    .select('page_path')
    .in('page_path', pagePaths);

  if (error) {
    console.error('Error getting view counts:', error);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.page_path] = (counts[row.page_path] || 0) + 1;
  }
  return counts;
}
