import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getNewsArticleBySlug, searchByTags } from "@/lib/news";
import { NewsArticle } from "@/lib/types";
import ReactionBar from "@/components/ReactionBar";
import ViewCounter from "@/components/ViewCounter";

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
    <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
      <Navbar />
      <ArticleJsonLd article={article} />

      <div className="mx-auto px-6 pt-28 pb-24" style={{ maxWidth: "680px" }}>
        <article>
          {/* Back + meta */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/news"
              className="text-sm transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--tx-3)" }}
            >
              ← News
            </Link>
            <div className="flex items-center gap-4">
              <ViewCounter pagePath={`/news/${article.slug}`} />
              <time className="font-mono text-xs" style={{ color: "var(--tx-3)" }}>
                {new Date(article.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>

          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className="font-mono text-xs px-2 py-0.5 rounded"
                style={{
                  background: "color-mix(in oklch, var(--accent) 15%, transparent)",
                  color: "var(--accent)",
                  border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
                }}
              >
                {article.source_subreddit === "arXiv"
                  ? "arXiv"
                  : article.source_subreddit === "HackerNews"
                  ? "Hacker News"
                  : `r/${article.source_subreddit}`}
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-xs px-2 py-0.5 rounded"
                  style={{
                    background: "var(--bg-subtle)",
                    color: "var(--tx-3)",
                    border: "1px solid var(--border-faint)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1
              className="text-2xl font-semibold leading-snug tracking-tight mb-4"
              style={{ color: "var(--tx-1)" }}
            >
              {article.title}
            </h1>

            {article.thumbnail && (
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full rounded-md mt-6"
                style={{
                  aspectRatio: "16/9",
                  objectFit: "cover",
                  border: "1px solid var(--border-faint)",
                }}
              />
            )}
          </header>

          {/* Content */}
          <div
            className="news-article-content article-body"
            dangerouslySetInnerHTML={{ __html: processNewsHtml(article.description) }}
          />

          {/* Sources */}
          {article.source_urls.length > 0 && (
            <section
              className="mt-10 pt-6"
              style={{ borderTop: "1px solid var(--border-faint)" }}
            >
              <p
                className="text-xs font-medium uppercase mb-3"
                style={{ color: "var(--tx-3)", letterSpacing: "0.1em" }}
              >
                Source
              </p>
              {article.source_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-mono text-xs mb-1 truncate transition-colors hover:text-[var(--accent)]"
                  style={{ color: "var(--tx-2)" }}
                >
                  {url}
                </a>
              ))}
            </section>
          )}

          {/* Related */}
          {relatedArticles.length > 0 && (
            <section
              className="mt-10 pt-6"
              style={{ borderTop: "1px solid var(--border-faint)" }}
            >
              <p
                className="text-xs font-medium uppercase mb-4"
                style={{ color: "var(--tx-3)", letterSpacing: "0.1em" }}
              >
                Related
              </p>
              <div className="space-y-0">
                {relatedArticles.slice(0, 3).map((related, i) => (
                  <Link
                    key={related.id}
                    href={`/news/${related.slug}`}
                    className="group flex items-start gap-4 py-3"
                    style={{
                      borderBottom:
                        i < Math.min(relatedArticles.length, 3) - 1
                          ? "1px solid var(--border-faint)"
                          : "none",
                    }}
                  >
                    <time
                      className="font-mono text-xs pt-0.5 shrink-0"
                      style={{ color: "var(--tx-3)", minWidth: "4rem" }}
                    >
                      {new Date(related.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <p
                      className="text-sm group-hover:text-[var(--accent)] transition-colors duration-150"
                      style={{ color: "var(--tx-1)" }}
                    >
                      {related.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Reactions */}
          <div
            className="mt-10 pt-6"
            style={{ borderTop: "1px solid var(--border-faint)" }}
          >
            <ReactionBar pagePath={`/news/${article.slug}`} />
          </div>

          {/* Nav */}
          <div
            className="mt-8 pt-6 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--border-faint)" }}
          >
            <Link
              href="/news"
              className="text-sm transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--tx-3)" }}
            >
              ← All news
            </Link>
            <Link
              href="/"
              className="text-sm transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--tx-3)" }}
            >
              Home →
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
