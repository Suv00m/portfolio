export interface BlogLink {
  text: string;
  url: string;
}

export interface BlogPost {
  id: string;
  title: string;
  description: string; // HTML content from rich text editor
  thumbnail?: string; // URL to thumbnail image
  links?: BlogLink[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPost {
  title: string;
  description: string; // HTML content from rich text editor
  thumbnail?: string; // URL to thumbnail image
  links?: BlogLink[];
  tags?: string[];
}

export interface ReactionCounts {
  like: number;
  love: number;
  fire: number;
  think: number;
}

export type ReactionType = keyof ReactionCounts;

export interface Project {
  title: string;
  description: string;
  url?: string;
  github?: string;
  thumbnail?: string;
  tags: string[];
  color: string;
  featured?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  thumbnail?: string;
  source_urls: string[];
  source_subreddit: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateNewsArticle {
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  thumbnail?: string;
  source_urls: string[];
  source_subreddit: string;
  tags: string[];
}
