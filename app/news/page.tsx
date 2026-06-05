"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { NewsArticle } from "@/lib/types";

const ARTICLES_PER_PAGE = 15;
const TAGS_COLLAPSED = 8;

export default function NewsDirectory() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => d.success && setArticles(d.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setCurrentPage(1); }, [activeTag]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    articles.forEach((a) => a.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [articles]);

  const filtered = useMemo(() =>
    activeTag ? articles.filter((a) => a.tags?.includes(activeTag)) : articles,
    [articles, activeTag]
  );

  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  const visibleTags = tagsExpanded ? allTags : allTags.slice(0, TAGS_COLLAPSED);
  const hiddenCount = allTags.length - TAGS_COLLAPSED;

  return (
    <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
      <Navbar />

      <div className="mx-auto px-6 pt-32 pb-24" style={{ maxWidth: "680px" }}>
        <header className="mb-10">
          <h1 className="text-xl font-semibold tracking-tight mb-2">News</h1>
          <p className="text-sm" style={{ color: "var(--tx-2)" }}>
            AI and tech developments, curated and summarized.
          </p>
        </header>

        {/* Tags */}
        {!loading && allTags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag(null)}
                className="font-mono text-xs px-2 py-1 rounded transition-colors"
                style={{
                  background: !activeTag ? "var(--bg-hover)" : "transparent",
                  color: !activeTag ? "var(--tx-1)" : "var(--tx-3)",
                  border: "1px solid var(--border-faint)",
                }}
              >
                all
              </button>
              {visibleTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className="font-mono text-xs px-2 py-1 rounded transition-colors"
                  style={{
                    background: activeTag === tag ? "var(--bg-hover)" : "transparent",
                    color: activeTag === tag ? "var(--tx-1)" : "var(--tx-3)",
                    border: "1px solid var(--border-faint)",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
            {hiddenCount > 0 && (
              <button
                onClick={() => setTagsExpanded(!tagsExpanded)}
                className="mt-2 text-xs transition-colors hover:text-[var(--accent)]"
                style={{ color: "var(--tx-3)" }}
              >
                {tagsExpanded ? "Show less" : `+${hiddenCount} more`}
              </button>
            )}
          </div>
        )}

        {/* Articles */}
        {loading ? (
          <div className="flex items-center gap-3 py-12">
            <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
          </div>
        ) : paginated.length === 0 ? (
          <p className="py-12 text-sm" style={{ color: "var(--tx-3)" }}>
            {activeTag ? "No articles with this tag." : "No news yet."}
          </p>
        ) : (
          <div>
            {paginated.map((article, i) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group flex items-start gap-4 py-4"
                style={{
                  borderBottom:
                    i < paginated.length - 1 ? "1px solid var(--border-faint)" : "none",
                }}
              >
                <time
                  className="font-mono text-xs pt-0.5 shrink-0"
                  style={{ color: "var(--tx-3)", minWidth: "5.5rem" }}
                >
                  {new Date(article.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors duration-150 mb-1"
                    style={{ color: "var(--tx-1)" }}
                  >
                    {article.title}
                  </p>
                  {article.excerpt && (
                    <p
                      className="text-xs leading-relaxed line-clamp-2"
                      style={{ color: "var(--tx-3)" }}
                    >
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3 mt-8 pt-6" style={{ borderTop: "1px solid var(--border-faint)" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-xs transition-colors hover:text-[var(--accent)] disabled:opacity-30"
              style={{ color: "var(--tx-3)" }}
            >
              ← Prev
            </button>
            <span className="font-mono text-xs" style={{ color: "var(--tx-3)" }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-xs transition-colors hover:text-[var(--accent)] disabled:opacity-30"
              style={{ color: "var(--tx-3)" }}
            >
              Next →
            </button>
          </div>
        )}

        <div className="mt-12 pt-6" style={{ borderTop: "1px solid var(--border-faint)" }}>
          <Link
            href="/"
            className="text-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--tx-3)" }}
          >
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
