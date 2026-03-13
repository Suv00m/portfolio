import { BlogPost, CreateBlogPost } from './types';
import { supabase, supabaseAdmin } from './supabase';

/**
 * Get all blog posts, sorted by created_at descending
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single blog post by ID
 */
export async function getBlogPost(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching blog post ${id}:`, error);
    return null;
  }

  return data;
}

/**
 * Create a new blog post
 */
export async function createBlogPost(data: CreateBlogPost): Promise<BlogPost> {
  const { data: created, error } = await supabaseAdmin
    .from('blog_posts')
    .insert({
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail || null,
      links: data.links || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating blog post:', error);
    throw new Error('Failed to create blog post');
  }

  return created;
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(id: string, data: Partial<CreateBlogPost>): Promise<BlogPost> {
  const { data: updated, error } = await supabaseAdmin
    .from('blog_posts')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating blog post:', error);
    throw new Error('Failed to update blog post');
  }

  return updated;
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    throw new Error('Failed to delete blog post');
  }
}
