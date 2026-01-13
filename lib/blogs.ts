import { BlogPost, CreateBlogPost } from './types';
import { readFile, readdir, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const BLOGS_DIR = join(process.cwd(), 'data', 'blogs');

/**
 * Ensure blogs directory exists
 */
async function ensureBlogsDir(): Promise<void> {
  try {
    await mkdir(BLOGS_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists, ignore
  }
}

/**
 * Get all blog posts, sorted by created_at descending
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  await ensureBlogsDir();
  
  try {
    const files = await readdir(BLOGS_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const posts = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = join(BLOGS_DIR, file);
        const content = await readFile(filePath, 'utf-8');
        return JSON.parse(content) as BlogPost;
      })
    );
    
    // Sort by created_at descending
    return posts.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

/**
 * Get a single blog post by ID
 */
export async function getBlogPost(id: string): Promise<BlogPost | null> {
  await ensureBlogsDir();
  
  try {
    const filePath = join(BLOGS_DIR, `${id}.json`);
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as BlogPost;
  } catch (error) {
    console.error(`Error reading blog post ${id}:`, error);
    return null;
  }
}

/**
 * Create a new blog post
 */
export async function createBlogPost(data: CreateBlogPost): Promise<BlogPost> {
  await ensureBlogsDir();
  
  const now = new Date().toISOString();
  const newPost: BlogPost = {
    id: randomUUID(),
    title: data.title,
    description: data.description,
    links: data.links || [],
    created_at: now,
    updated_at: now,
  };
  
  const filePath = join(BLOGS_DIR, `${newPost.id}.json`);
  await writeFile(filePath, JSON.stringify(newPost, null, 2), 'utf-8');
  
  return newPost;
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(id: string, data: Partial<CreateBlogPost>): Promise<BlogPost> {
  await ensureBlogsDir();
  
  const existingPost = await getBlogPost(id);
  if (!existingPost) {
    throw new Error('Blog post not found');
  }
  
  const updatedPost: BlogPost = {
    ...existingPost,
    ...data,
    updated_at: new Date().toISOString(),
  };
  
  const filePath = join(BLOGS_DIR, `${id}.json`);
  await writeFile(filePath, JSON.stringify(updatedPost, null, 2), 'utf-8');
  
  return updatedPost;
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id: string): Promise<void> {
  await ensureBlogsDir();
  
  const filePath = join(BLOGS_DIR, `${id}.json`);
  try {
    const { unlink } = await import('fs/promises');
    await unlink(filePath);
  } catch (error) {
    console.error(`Error deleting blog post ${id}:`, error);
    throw error;
  }
}
