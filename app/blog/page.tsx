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
    <main className="min-h-screen bg-white text-black">
      <CenterNavbar />
      
      {/* Blog Directory Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl text-left w-full">
          {/* Date and Title */}
          <div className="mb-8">
            <h1 className="mt-6 text-3xl font-medium font-sans tracking-tight">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              }).replace(/\//g, '.')}
              <br />
              Blog Posts
            </h1>
          </div>

          {/* Blog Posts List */}
          <div className="mb-16 space-y-8 text-base leading-relaxed text-gray-600 md:text-lg text-left max-w-2xl text-gray-800">
            {loading ? (
              <p>Loading blog posts...</p>
            ) : blogPosts.length === 0 ? (
              <p>No blog posts found. Check back later for new content!</p>
            ) : (
              blogPosts.map((post) => (
                <article key={post.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                  <div className="mb-4">
                    <time className="text-sm text-gray-500 font-medium">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </time>
                    <h2 className="mt-2 text-xl font-medium font-sans tracking-tight text-black hover:text-purple-600 transition-colors">
                      <Link href={`/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed line-clamp-3">
                    {(() => {
                      // Strip HTML tags for preview
                      const textContent = post.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                      return textContent.length > 200 
                        ? `${textContent.substring(0, 200)}...` 
                        : textContent;
                    })()}
                  </p>
                  {post.links && post.links.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.links.slice(0, 3).map((link, index) => (
                        <p key={index} className="text-sm text-gray-500">
                          link:&nbsp;
                        <span key={index} className="text-sm text-purple-600">
                          {link.text}
                        </span>
                        </p>
                      ))}
                      {post.links.length > 3 && (
                        <span className="text-sm text-gray-500">
                          +{post.links.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                </article>
              ))
            )}
          </div>

          {/* Back to Home Link */}
          <div className="mt-12">
            <Link 
              href="/"
              className="text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}