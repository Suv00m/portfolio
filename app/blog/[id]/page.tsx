"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { LinkPreview } from "@/components/ui/link-preview";
import { BlogPost } from "@/lib/types";
import { processEmbedContent } from "@/lib/embed-utils";
import { initializeCopyButtons } from "@/lib/code-copy-utils";
import ReactionBar from "@/components/ReactionBar";
import ViewCounter from "@/components/ViewCounter";

export default function SingleBlog() {
  const params = useParams();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = params.id as string;
    if (id) fetchBlog(id);
  }, [params.id]);

  useEffect(() => {
    if (blogPost?.description && contentRef.current) {
      initializeCopyButtons(contentRef.current);
    }
  }, [blogPost?.description]);

  const fetchBlog = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs/${id}`);
      const result = await res.json();
      if (result.success) setBlogPost(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen gap-3">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </main>
    );
  }

  if (!blogPost) {
    return (
      <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
          <p className="text-4xl font-semibold" style={{ color: "var(--tx-3)" }}>404</p>
          <p className="text-sm" style={{ color: "var(--tx-2)" }}>
            This post doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/blog"
            className="text-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--tx-3)" }}
          >
            ← Back to writing
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
      <Navbar />

      <div className="mx-auto px-6 pt-28 pb-24" style={{ maxWidth: "680px" }}>
        <article>
          {/* Back + meta */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/blog"
              className="text-sm transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--tx-3)" }}
            >
              ← Writing
            </Link>
            <div className="flex items-center gap-4">
              <ViewCounter pagePath={`/blog/${params.id}`} />
              <time
                className="font-mono text-xs"
                style={{ color: "var(--tx-3)" }}
              >
                {new Date(blogPost.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>

          {/* Title */}
          <header className="mb-10">
            <h1
              className="text-2xl font-semibold leading-snug tracking-tight mb-4"
              style={{ color: "var(--tx-1)" }}
            >
              {blogPost.title}
            </h1>
            {blogPost.thumbnail && (
              <img
                src={blogPost.thumbnail}
                alt={blogPost.title}
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
            ref={contentRef}
            className="article-body"
            dangerouslySetInnerHTML={{
              __html: processEmbedContent(blogPost.description),
            }}
            suppressHydrationWarning
          />

          {/* Related links */}
          {blogPost.links && blogPost.links.length > 0 && (
            <section
              className="mt-12 pt-8"
              style={{ borderTop: "1px solid var(--border-faint)" }}
            >
              <p
                className="text-xs font-medium uppercase mb-4"
                style={{ color: "var(--tx-3)", letterSpacing: "0.1em" }}
              >
                Links
              </p>
              <div className="space-y-2">
                {blogPost.links.map((link, i) => (
                  <div key={i}>
                    <LinkPreview
                      url={link.url}
                      className="text-sm transition-colors hover:text-[var(--accent-hi)] text-[var(--accent)]"
                    >
                      {link.text} →
                    </LinkPreview>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reactions */}
          <div
            className="mt-12 pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ borderTop: "1px solid var(--border-faint)" }}
          >
            <ReactionBar pagePath={`/blog/${params.id}`} />
          </div>

          {/* Nav */}
          <div
            className="mt-8 pt-6 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--border-faint)" }}
          >
            <Link
              href="/blog"
              className="text-sm transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--tx-3)" }}
            >
              ← All posts
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
