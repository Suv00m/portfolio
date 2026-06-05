"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { BlogPost } from "@/lib/types";

export default function BlogDirectory() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/blogs")
      .then((r) => r.json())
      .then((d) => d.success && setBlogPosts(d.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    blogPosts.forEach((p) => {
      p.tags?.forEach((t) => s.add(t));
      p.links?.forEach((l) => s.add(l.text));
    });
    return Array.from(s).sort();
  }, [blogPosts]);

  const filtered = useMemo(() => {
    let posts = blogPosts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.replace(/<[^>]*>/g, "").toLowerCase().includes(q)
      );
    }
    if (activeTag) {
      posts = posts.filter(
        (p) =>
          p.tags?.includes(activeTag) ||
          p.links?.some((l) => l.text === activeTag)
      );
    }
    return posts;
  }, [blogPosts, searchQuery, activeTag]);

  return (
    <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
      <Navbar />

      <div className="mx-auto px-6 pt-32 pb-24" style={{ maxWidth: "680px" }}>
        <header className="mb-10">
          <h1 className="text-xl font-semibold tracking-tight mb-2">Writing</h1>
          <p className="text-sm" style={{ color: "var(--tx-2)" }}>
            Thoughts on building software and AI products.
          </p>
        </header>

        {/* Search */}
        {!loading && blogPosts.length > 0 && (
          <div className="mb-8 space-y-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full px-3 py-2 text-sm rounded-md outline-none transition-colors"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: "var(--tx-1)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />

            {allTags.length > 0 && (
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
                {allTags.map((tag) => (
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
            )}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center gap-3 py-12">
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-sm" style={{ color: "var(--tx-3)" }}>
            {searchQuery || activeTag ? "No matching posts." : "No posts yet."}
          </p>
        ) : (
          <div>
            {filtered.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group flex items-start gap-4 py-4"
                style={{
                  borderBottom:
                    i < filtered.length - 1 ? "1px solid var(--border-faint)" : "none",
                }}
              >
                <time
                  className="font-mono text-xs pt-0.5 shrink-0"
                  style={{ color: "var(--tx-3)", minWidth: "5.5rem" }}
                >
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors duration-150 mb-1"
                    style={{ color: "var(--tx-1)" }}
                  >
                    {post.title}
                  </p>
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: "var(--tx-3)" }}
                  >
                    {post.description
                      .replace(/<[^>]*>/g, "")
                      .replace(/&nbsp;/g, " ")
                      .trim()
                      .slice(0, 140)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 pt-6" style={{ borderTop: "1px solid var(--border-faint)" }}>
          <Link
            href="/"
            className="text-sm transition-colors duration-150 hover:text-[var(--accent)]"
            style={{ color: "var(--tx-3)" }}
          >
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
