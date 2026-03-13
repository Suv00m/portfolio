import { MetadataRoute } from 'next';
import { getAllNewsSlugs } from '@/lib/news';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shuvam.xyz';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/socials`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  let newsSlugs: string[] = [];
  try {
    newsSlugs = await getAllNewsSlugs();
  } catch {
    // Supabase may not be configured during build
  }

  const newsPages: MetadataRoute.Sitemap = newsSlugs.map((slug) => ({
    url: `${baseUrl}/news/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...newsPages];
}
