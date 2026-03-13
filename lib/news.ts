import { supabase, supabaseAdmin } from './supabase';
import { NewsArticle, CreateNewsArticle } from './types';

export async function getAllNewsArticles(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching news articles:', error);
    return [];
  }

  return data || [];
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching news article:', error);
    return null;
  }

  return data;
}

export async function createNewsArticle(article: CreateNewsArticle): Promise<NewsArticle | null> {
  const { data, error } = await supabaseAdmin
    .from('news_articles')
    .insert(article)
    .select()
    .single();

  if (error) {
    console.error('Error creating news article:', error);
    return null;
  }

  return data;
}

export async function deleteNewsArticle(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('news_articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting news article:', error);
    return false;
  }

  return true;
}

export async function getExistingSourceUrls(): Promise<string[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('source_urls');

  if (error) {
    console.error('Error fetching source URLs:', error);
    return [];
  }

  return (data || []).flatMap((row) => row.source_urls || []);
}

export async function searchByTags(tags: string[], excludeSlug?: string): Promise<NewsArticle[]> {
  let query = supabase
    .from('news_articles')
    .select('*')
    .overlaps('tags', tags)
    .order('created_at', { ascending: false })
    .limit(4);

  if (excludeSlug) {
    query = query.neq('slug', excludeSlug);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error searching by tags:', error);
    return [];
  }

  return data || [];
}

export async function getExistingTitles(): Promise<string[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('title');

  if (error) {
    console.error('Error fetching existing titles:', error);
    return [];
  }

  return (data || []).map((row) => row.title);
}

export async function getAllNewsSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('slug');

  if (error) {
    console.error('Error fetching news slugs:', error);
    return [];
  }

  return (data || []).map((row) => row.slug);
}
