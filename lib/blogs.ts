import { BlogPost, CreateBlogPost } from './types';
import { randomUUID } from 'crypto';
import {
  createOrUpdateFile,
  deleteFile,
  getDirectoryFiles,
  getFileContent,
  BLOGS_DIR_PATH,
} from './github-api';

/**
 * Get all blog posts, sorted by created_at descending
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const files = await getDirectoryFiles(BLOGS_DIR_PATH);
    
    const posts = await Promise.all(
      files.map(async (file) => {
        const filePath = `${BLOGS_DIR_PATH}/${file}`;
        const content = await getFileContent(filePath);
        if (!content) return null;
        return JSON.parse(content) as BlogPost;
      })
    );
    
    // Filter out nulls and sort by created_at descending
    return posts
      .filter((post): post is BlogPost => post !== null)
      .sort((a, b) => 
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
  try {
    const filePath = `${BLOGS_DIR_PATH}/${id}.json`;
    const content = await getFileContent(filePath);
    if (!content) return null;
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
  const now = new Date().toISOString();
  const newPost: BlogPost = {
    id: randomUUID(),
    title: data.title,
    description: data.description,
    thumbnail: data.thumbnail,
    links: data.links || [],
    created_at: now,
    updated_at: now,
  };
  
  const filePath = `${BLOGS_DIR_PATH}/${newPost.id}.json`;
  const content = JSON.stringify(newPost, null, 2);
  const message = `Create blog post: ${newPost.title}`;
  
  await createOrUpdateFile(filePath, content, message);
  
  return newPost;
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(id: string, data: Partial<CreateBlogPost>): Promise<BlogPost> {
  const existingPost = await getBlogPost(id);
  if (!existingPost) {
    throw new Error('Blog post not found');
  }
  
  const updatedPost: BlogPost = {
    ...existingPost,
    ...data,
    updated_at: new Date().toISOString(),
  };
  
  const filePath = `${BLOGS_DIR_PATH}/${id}.json`;
  const content = JSON.stringify(updatedPost, null, 2);
  const message = `Update blog post: ${updatedPost.title}`;
  
  await createOrUpdateFile(filePath, content, message);
  
  return updatedPost;
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id: string): Promise<void> {
  const existingPost = await getBlogPost(id);
  if (!existingPost) {
    throw new Error('Blog post not found');
  }
  
  const filePath = `${BLOGS_DIR_PATH}/${id}.json`;
  const message = `Delete blog post: ${existingPost.title}`;
  
  await deleteFile(filePath, message);
}
