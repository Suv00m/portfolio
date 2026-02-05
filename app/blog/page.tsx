"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CenterNavbar from "@/components/CenterNavbar";
import { BlogPost } from "@/lib/types";

export default function BlogDirectory() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      const result = await response.json();
      if (result.success) {
        setBlogPosts(result.data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <CenterNavbar />

      {/* Blog Directory Section */}
      <section className="relative min-h-screen px-6 md:px-12 lg:px-24 py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dots opacity-20" />

        {/* Decorative shapes */}
        <div className="absolute top-32 right-0 w-48 h-48 bg-[#ff3d00] -rotate-12 translate-x-1/2" />
        <div className="absolute bottom-32 left-0 w-32 h-32 bg-[#0066ff] rotate-12 -translate-x-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-20">
            <span className="tag-brutal-filled mb-6 inline-block">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }).replace(/\//g, '.')}
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter">
              BLOG
            </h1>
            <p className="mt-6 text-xl text-[#525252] max-w-xl">
              Thoughts, code, and everything in between.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-4">
                  <div className="loading-dot" />
                  <div className="loading-dot" />
                  <div className="loading-dot" />
                </div>
              </div>
            ) : blogPosts.length === 0 ? (
              <div className="text-center py-20 card-brutal p-12">
                <p className="font-display text-2xl font-bold">No posts yet.</p>
                <p className="mt-2 text-[#737373]">Check back soon for new content.</p>
              </div>
            ) : (
              blogPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="group card-brutal overflow-hidden"
                >
                  <Link href={`/blog/${post.id}`} className="block">
                    <div className="flex flex-col md:flex-row">
                      {post.thumbnail && (
                        <div className="relative w-full md:w-80 h-56 md:h-auto flex-shrink-0 overflow-hidden border-b-3 md:border-b-0 md:border-r-3 border-[#0a0a0a]" style={{ borderWidth: '3px' }}>
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6 md:p-8">
                        {/* Post Number & Date */}
                        <div className="flex items-center gap-4 mb-4">
                          <span className="font-display text-5xl font-black text-[#e5e5e5]">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <time className="font-mono text-sm text-[#737373] uppercase tracking-wider">
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </time>
                        </div>

                        {/* Title */}
                        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight group-hover:text-[#ff3d00] transition-colors duration-200 mb-4">
                          {post.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-[#525252] leading-relaxed line-clamp-2 mb-6">
                          {(() => {
                            const textContent = post.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                            return textContent.length > 180
                              ? `${textContent.substring(0, 180)}...`
                              : textContent;
                          })()}
                        </p>

                        {/* Links Tags */}
                        {post.links && post.links.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {post.links.slice(0, 3).map((link, linkIndex) => (
                              <span
                                key={linkIndex}
                                className="tag-brutal"
                              >
                                {link.text}
                              </span>
                            ))}
                            {post.links.length > 3 && (
                              <span className="tag-brutal text-[#737373]">
                                +{post.links.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Read More Indicator */}
                        <div className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-wider text-[#ff3d00] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-200">
                          <span>Read Article</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))
            )}
          </div>

          {/* Back Navigation */}
          <div className="mt-20 pt-8 border-t-4 border-[#0a0a0a]">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-display font-bold uppercase tracking-wider text-[#525252] hover:text-[#ff3d00] transition-colors duration-200 group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
