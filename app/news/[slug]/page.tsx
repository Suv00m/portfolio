import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CenterNavbar from "@/components/CenterNavbar";
import { getNewsArticleBySlug, searchByTags } from "@/lib/news";
import { NewsArticle } from "@/lib/types";

// Post-process HTML to fix missing tags from LLM output
function processNewsHtml(html: string): string {
  const h2Count = (html.match(/<h[23][^>]*>/gi) || []).length;

  // If already has proper headings, return as-is
  if (h2Count >= 2) return html;

  // Check if heading-like text is inside <p> tags
  function isHeadingText(text: string): boolean {
    const clean = text.replace(/<[^>]*>/g, '').trim();
    if (clean.length < 4 || clean.length > 80) return false;
    if (clean.endsWith('.') || clean.endsWith(',')) return false;

    // Question-based headings (SEO pattern)
    if (/^(Why|What|How|Where|When|Who|Which|Is|Are|Will|Can|Should|Could|Does|Do)\s/i.test(clean) && clean.endsWith('?')) return true;

    // Title case, short, no period — like "Industry Impact" or "Key Takeaway"
    if (/^[A-Z]/.test(clean) && clean.split(' ').length <= 10 && !clean.includes('. ')) {
      // Must be mostly capitalized words or a known pattern
      const words = clean.split(' ');
      const capitalizedRatio = words.filter(w => /^[A-Z''$]/.test(w) || w.length <= 3).length / words.length;
      if (capitalizedRatio > 0.6) return true;
    }

    return false;
  }

  function isListItemText(text: string): boolean {
    const clean = text.replace(/<[^>]*>/g, '').trim();
    if (clean.length < 5 || clean.length > 120) return false;
    // No period at end, starts with capital, not a full sentence
    return !clean.endsWith('.') && /^[A-Z]/.test(clean) && !clean.includes('. ') && clean.split(' ').length <= 15;
  }

  // Split the HTML into segments — by <p> tags, newlines, or <br>
  // First normalize: split on </p>, <p>, \n, <br>
  const segments = html
    .replace(/<\/p>\s*<p>/gi, '</p>\n<p>')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '</p>\n')
    .replace(/<p>/gi, '\n<p>')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const result: string[] = [];
  let inList = false;
  let prevEndedWithColon = false;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const textContent = seg.replace(/<[^>]*>/g, '').trim();

    // Already a heading tag — keep it
    if (seg.match(/^<h[1-6]/i)) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push(seg);
      prevEndedWithColon = false;
      continue;
    }

    // Already a list — keep it
    if (seg.match(/^<[uo]l/i) || seg.match(/^<li/i) || seg.match(/^<\/[uo]l/i)) {
      result.push(seg);
      prevEndedWithColon = false;
      continue;
    }

    // Extract content (strip wrapping <p> if present)
    const innerContent = seg.replace(/^<p[^>]*>/, '').replace(/<\/p>$/, '').trim();
    const innerText = innerContent.replace(/<[^>]*>/g, '').trim();

    if (!innerText) continue;

    // Check if this is a heading
    if (isHeadingText(innerText)) {
      if (inList) { result.push('</ul>'); inList = false; }
      const tag = innerText.length < 40 ? 'h2' : 'h3';
      result.push(`<${tag}>${innerText}</${tag}>`);
      prevEndedWithColon = false;
      continue;
    }

    // Check if this is a list item (after a colon, or short non-sentence line)
    if (prevEndedWithColon && isListItemText(innerText)) {
      if (!inList) { result.push('<ul>'); inList = true; }
      result.push(`<li>${innerContent}</li>`);
      continue;
    }

    // Regular paragraph
    if (inList) { result.push('</ul>'); inList = false; }

    if (seg.match(/^<p/i)) {
      result.push(seg);
    } else {
      result.push(`<p>${innerContent}</p>`);
    }

    prevEndedWithColon = innerText.endsWith(':');
  }

  if (inList) result.push('</ul>');

  return result.join('\n');
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: `${article.title} | AI & Tech News`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      tags: article.tags,
      images: article.thumbnail ? [{ url: article.thumbnail }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.thumbnail ? [article.thumbnail] : [],
    },
  };
}

function ArticleJsonLd({ article }: { article: NewsArticle }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.thumbnail,
    datePublished: article.created_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Person",
      name: "Shuvam Mandal",
    },
    publisher: {
      "@type": "Person",
      name: "Shuvam Mandal",
    },
    keywords: article.tags.join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles =
    article.tags.length > 0
      ? await searchByTags(article.tags, article.slug)
      : [];

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <CenterNavbar />
      <ArticleJsonLd article={article} />

      <section className="relative px-6 md:px-12 lg:px-24 py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dots opacity-10" />

        {/* Decorative shape */}
        <div className="absolute top-32 right-0 w-64 h-64 bg-[#0066ff] -rotate-12 translate-x-1/2 hidden lg:block" />

        <article className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 font-display font-bold uppercase tracking-wider text-[#737373] hover:text-[#ff3d00] transition-colors duration-200 group"
              >
                <svg
                  className="w-4 h-4 transform group-hover:-translate-x-2 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                Back to News
              </Link>

              <time className="tag-brutal-accent">
                {new Date(article.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1]">
              {article.title}
            </h1>

            {/* Tags & Source */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <span className="tag-brutal-accent text-xs">
                r/{article.source_subreddit}
              </span>
              {article.tags.map((tag) => (
                <span key={tag} className="tag-brutal">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Thumbnail */}
          {article.thumbnail && (
            <div className="mb-12 stacked-image">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-80 md:h-[500px] object-cover border-3 border-[#0a0a0a]"
                style={{ borderWidth: "3px" }}
              />
            </div>
          )}

          {/* Article Content */}
          <div className="mb-16">
            <div
              className="news-article-content prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-p:text-zinc-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:underline hover:prose-a:text-orange-500 prose-strong:text-zinc-900 prose-code:bg-zinc-100 prose-code:text-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-img:rounded-lg prose-blockquote:border-zinc-200 prose-blockquote:text-zinc-600 prose-li:marker:text-orange-500 [&_h2]:text-zinc-900 [&_h3]:text-orange-500"
              dangerouslySetInnerHTML={{ __html: processNewsHtml(article.description) }}
            />
          </div>

          {/* Source Attribution */}
          {article.source_urls.length > 0 && (
            <div className="mb-12 p-6 bg-[#f5f5f5] border-3 border-[#0a0a0a]" style={{ borderWidth: "3px" }}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-3 text-[#737373]">
                Source
              </h3>
              {article.source_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-mono text-sm text-[#0066ff] hover:text-[#ff3d00] transition-colors truncate"
                >
                  {url}
                </a>
              ))}
            </div>
          )}

          {/* CTA Banner */}
          <div className="mb-16 card-brutal-inverse p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight mb-4">
              Need AI Solutions?
            </h2>
            <p className="text-[#a3a3a3] mb-6 max-w-lg mx-auto">
              From custom AI integrations to full-stack development, let&apos;s build something great together.
            </p>
            <Link href="/contact" className="btn-brutal-outline !bg-white !text-[#0a0a0a]">
              Get in Touch
            </Link>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mb-16">
              <h2 className="font-display text-2xl font-bold tracking-tight mb-6">
                Related Articles
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedArticles.slice(0, 3).map((related) => (
                  <Link
                    key={related.id}
                    href={`/news/${related.slug}`}
                    className="group card-brutal p-6"
                  >
                    <time className="font-mono text-xs text-[#737373] uppercase tracking-wider">
                      {new Date(related.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </time>
                    <h3 className="font-display text-lg font-bold mt-2 group-hover:text-[#ff3d00] transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-sm text-[#737373] mt-2 line-clamp-2">
                      {related.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t-4 border-[#0a0a0a]">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 font-display font-bold uppercase tracking-wider text-[#525252] hover:text-[#ff3d00] transition-colors duration-200 group"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-2 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
              All News
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-display font-bold uppercase tracking-wider text-[#525252] hover:text-[#0066ff] transition-colors duration-200 group"
            >
              Home
              <svg
                className="w-5 h-5 transform group-hover:translate-x-2 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
