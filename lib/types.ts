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
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPost {
  title: string;
  description: string; // HTML content from rich text editor
  thumbnail?: string; // URL to thumbnail image
  links?: BlogLink[];
}
