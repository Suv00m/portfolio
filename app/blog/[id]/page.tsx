"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CenterNavbar from "@/components/CenterNavbar";
import { LinkPreview } from "@/components/ui/link-preview";
import { BlogPost } from "@/lib/types";
import { processEmbedContent } from "@/lib/embed-utils";
import { initializeCopyButtons } from "@/lib/code-copy-utils";

export default function SingleBlog() {
  const params = useParams();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      fetchBlog(id);
    }
  }, [params.id]);

  useEffect(() => {
    if (blogPost?.description && contentRef.current) {
      initializeCopyButtons(contentRef.current);
    }
  }, [blogPost?.description]);

  const fetchBlog = async (id: string) => {
    try {
      const response = await fetch(`/api/blogs/${id}`);
      const result = await response.json();
      if (result.success) {
        setBlogPost(result.data);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-[#0a0a0a]">
        <CenterNavbar />
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
          <div className="flex items-center gap-4">
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
        </section>
      </main>
    );
  }

  if (!blogPost) {
    return (
      <main className="min-h-screen bg-white text-[#0a0a0a]">
        <CenterNavbar />
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
          <div className="max-w-4xl text-center">
            <h1 className="font-display text-6xl md:text-8xl font-black tracking-tighter mb-8">
              404
            </h1>
            <p className="text-xl text-[#525252] mb-8">
              This post doesn&apos;t exist or has been removed.
            </p>
            <Link href="/blog" className="btn-brutal-outline">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const renderDescription = (htmlContent: string) => {
    return (
      <div
        ref={contentRef}
        className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-p:text-zinc-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:underline hover:prose-a:text-orange-500 prose-strong:text-zinc-900 prose-code:bg-zinc-100 prose-code:text-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-img:rounded-lg prose-blockquote:border-zinc-200 prose-blockquote:text-zinc-600 prose-li:marker:text-orange-500 [&_iframe]:w-full [&_iframe]:rounded-lg [&_iframe]:aspect-video [&_iframe]:my-8 [&_h2]:text-zinc-900 [&_h3]:text-orange-500"
        dangerouslySetInnerHTML={{ __html: processEmbedContent(htmlContent) }}
        suppressHydrationWarning
      />
    );
  };

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <CenterNavbar />

      {/* Single Blog Section */}
      <section className="relative px-6 md:px-12 lg:px-24 py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dots opacity-10" />

        {/* Decorative shape */}
        <div className="absolute top-32 right-0 w-64 h-64 bg-[#ff3d00] -rotate-12 translate-x-1/2 hidden lg:block" />

        <article className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            {/* Back Link and Date */}
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-display font-bold uppercase tracking-wider text-[#737373] hover:text-[#ff3d00] transition-colors duration-200 group"
              >
                <svg className="w-4 h-4 transform group-hover:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Back to Blog
              </Link>

              <time className="tag-brutal-accent">
                {new Date(blogPost.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1]">
              {blogPost.title}
            </h1>
          </header>

          {/* Thumbnail */}
          {blogPost.thumbnail && (
            <div className="mb-12 stacked-image">
              <img
                src={blogPost.thumbnail}
                alt={blogPost.title}
                className="w-full h-80 md:h-[500px] object-cover border-3 border-[#0a0a0a]"
                style={{ borderWidth: '3px' }}
              />
            </div>
          )}

          {/* Blog Content */}
          <div className="mb-16">
            {renderDescription(blogPost.description)}
          </div>

          {/* Related Links Section */}
          {blogPost.links && blogPost.links.length > 0 && (
            <div className="mt-16 pt-8 border-t-4 border-[#0a0a0a]">
              <h2 className="font-display text-2xl font-bold tracking-tight mb-6">
                Related Links
              </h2>
              <div className="grid gap-4">
                {blogPost.links.map((link, index) => (
                  <div
                    key={index}
                    className="group card-brutal p-4"
                  >
                    <LinkPreview
                      url={link.url}
                      className="flex items-center justify-between font-semibold text-[#0066ff] hover:text-[#ff3d00] transition-colors duration-200"
                    >
                      <span>{link.text}</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </LinkPreview>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex justify-between items-center mt-16 pt-8 border-t-4 border-[#0a0a0a]">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-display font-bold uppercase tracking-wider text-[#525252] hover:text-[#ff3d00] transition-colors duration-200 group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Blog Directory
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-display font-bold uppercase tracking-wider text-[#525252] hover:text-[#0066ff] transition-colors duration-200 group"
            >
              Home
              <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
