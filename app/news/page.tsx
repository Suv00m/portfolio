"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import CenterNavbar from "@/components/CenterNavbar";
import { NewsArticle } from "@/lib/types";

const TAGS_COLLAPSED_COUNT = 8;
const ARTICLES_PER_PAGE = 10;

export default function NewsDirectory() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/news");
      const result = await response.json();
      if (result.success) {
        setArticles(result.data);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach((a) => a.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (!activeTag) return articles;
    return articles.filter((a) => a.tags?.includes(activeTag));
  }, [articles, activeTag]);

  const visibleTags = tagsExpanded
    ? allTags
    : allTags.slice(0, TAGS_COLLAPSED_COUNT);
  const hiddenTagCount = allTags.length - TAGS_COLLAPSED_COUNT;

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTag]);

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <CenterNavbar />

      <section className="relative min-h-screen px-6 md:px-12 lg:px-24 py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dots opacity-20" />

        {/* Decorative shapes */}
        <div className="absolute top-32 right-0 w-48 h-48 bg-[#0066ff] -rotate-12 translate-x-1/2" />
        <div className="absolute bottom-32 left-0 w-32 h-32 bg-[#ff3d00] rotate-12 -translate-x-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <span className="tag-brutal-filled mb-6 inline-block">
              LATEST UPDATES
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter">
              AI & TECH NEWS
            </h1>
            <p className="mt-6 text-xl text-[#525252] max-w-xl">
              Trending developments in artificial intelligence and technology.
            </p>
          </div>

          {/* Tag Filters — Collapsible */}
          {allTags.length > 0 && (
            <div className="mb-12">
              <div className="relative overflow-hidden">
                <div
                  className="flex flex-wrap gap-2 transition-all duration-500 ease-in-out"
                  style={{
                    maxHeight: tagsExpanded ? "600px" : "3rem",
                  }}
                >
                  <button
                    onClick={() => setActiveTag(null)}
                    className={`tag-brutal cursor-pointer transition-colors duration-200 ${
                      !activeTag
                        ? "!bg-[#0a0a0a] !text-white"
                        : "hover:bg-[#f5f5f5]"
                    }`}
                  >
                    ALL
                  </button>
                  {visibleTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setActiveTag(activeTag === tag ? null : tag)
                      }
                      className={`tag-brutal cursor-pointer transition-colors duration-200 ${
                        activeTag === tag
                          ? "!bg-[#0a0a0a] !text-white"
                          : "hover:bg-[#f5f5f5]"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {/* Fade overlay when collapsed */}
                {!tagsExpanded && hiddenTagCount > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>
              {hiddenTagCount > 0 && (
                <button
                  onClick={() => setTagsExpanded(!tagsExpanded)}
                  className="mt-3 inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-[#737373] hover:text-[#0a0a0a] transition-colors duration-200 cursor-pointer group"
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      tagsExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  {tagsExpanded
                    ? "Show less"
                    : `+${hiddenTagCount} more tags`}
                </button>
              )}
            </div>
          )}

          {/* Articles */}
          <div className="space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-4">
                  <div className="loading-dot" />
                  <div className="loading-dot" />
                  <div className="loading-dot" />
                </div>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-20 card-brutal p-12">
                <p className="font-display text-2xl font-bold">
                  {activeTag ? "No articles with this tag." : "No news yet."}
                </p>
                <p className="mt-2 text-[#737373]">
                  {activeTag
                    ? "Try a different tag or view all articles."
                    : "Check back soon for the latest AI & tech updates."}
                </p>
              </div>
            ) : (
              paginatedArticles.map((article, index) => (
                <article
                  key={article.id}
                  className="group card-brutal overflow-hidden"
                >
                  <Link href={`/news/${article.slug}`} className="block">
                    <div className="flex flex-col md:flex-row">
                      {article.thumbnail && (
                        <div
                          className="relative w-full md:w-80 h-56 md:h-auto flex-shrink-0 overflow-hidden border-b-3 md:border-b-0 md:border-r-3 border-[#0a0a0a]"
                          style={{ borderWidth: "3px" }}
                        >
                          <img
                            src={article.thumbnail}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6 md:p-8">
                        {/* Index & Date */}
                        <div className="flex items-center gap-4 mb-4">
                          <span className="font-display text-5xl font-black text-[#e5e5e5]">
                            {String(
                              (currentPage - 1) * ARTICLES_PER_PAGE +
                                index +
                                1
                            ).padStart(2, "0")}
                          </span>
                          <div className="flex items-center gap-3">
                            <time className="font-mono text-sm text-[#737373] uppercase tracking-wider">
                              {new Date(article.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </time>
                            <span className="tag-brutal-accent text-xs !py-0.5 !px-2">
                              r/{article.source_subreddit}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight group-hover:text-[#ff3d00] transition-colors duration-200 mb-4">
                          {article.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-[#525252] leading-relaxed line-clamp-2 mb-6">
                          {article.excerpt}
                        </p>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {article.tags.slice(0, 4).map((tag) => (
                              <span key={tag} className="tag-brutal">
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 4 && (
                              <span className="tag-brutal text-[#737373]">
                                +{article.tags.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Read More */}
                        <div className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-wider text-[#ff3d00] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-200">
                          <span>Read Article</span>
                          <svg
                            className="w-4 h-4"
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
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              {/* Prev */}
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center border-3 border-[#0a0a0a] font-display font-bold transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0a0a0a] hover:text-white"
                style={{ borderWidth: "3px" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  const show =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1;

                  if (!show) {
                    // Show ellipsis at gap boundaries
                    if (
                      (page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 &&
                        currentPage < totalPages - 2)
                    ) {
                      return (
                        <span
                          key={page}
                          className="w-10 h-10 flex items-center justify-center font-mono text-[#737373]"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-10 h-10 flex items-center justify-center border-3 font-display font-bold text-sm transition-all duration-200 cursor-pointer ${
                        page === currentPage
                          ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                          : "border-[#0a0a0a] hover:bg-[#f5f5f5]"
                      }`}
                      style={{ borderWidth: "3px" }}
                    >
                      {page}
                    </button>
                  );
                }
              )}

              {/* Next */}
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center border-3 border-[#0a0a0a] font-display font-bold transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0a0a0a] hover:text-white"
                style={{ borderWidth: "3px" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Page info */}
              <span className="ml-4 font-mono text-sm text-[#737373]">
                {(currentPage - 1) * ARTICLES_PER_PAGE + 1}–
                {Math.min(
                  currentPage * ARTICLES_PER_PAGE,
                  filteredArticles.length
                )}{" "}
                of {filteredArticles.length}
              </span>
            </div>
          )}

          {/* Back Navigation */}
          <div className="mt-20 pt-8 border-t-4 border-[#0a0a0a]">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-display font-bold uppercase tracking-wider text-[#525252] hover:text-[#ff3d00] transition-colors duration-200 group"
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
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
