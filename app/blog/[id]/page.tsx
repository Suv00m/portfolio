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

  // Initialize copy buttons after content is rendered
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
      <main className="min-h-screen bg-white text-black">
        <CenterNavbar />
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
          <div className="max-w-4xl text-left">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!blogPost) {
    return (
      <main className="min-h-screen bg-white text-black">
        <CenterNavbar />
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
          <div className="max-w-4xl text-left">
            <h1 className="mt-6 text-4xl font-medium font-sans tracking-tight">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              }).replace(/\//g, '.')}
              <br />
              Blog Post Not Found
            </h1>
            <div className="mb-16 space-y-6 text-base leading-relaxed text-gray-600 md:text-lg text-left max-w-2xl text-gray-800 mt-8">
              <p>
                Sorry, the blog post you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Link 
                href="/blog"
                className="inline-block text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
              >
                ← Back to Blog Directory
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Render HTML content from rich text editor
  const renderDescription = (htmlContent: string) => {
    return (
      <div
        ref={contentRef}
        className="prose prose-lg max-w-none prose-headings:font-sans prose-headings:tracking-tight prose-p:text-gray-800 prose-p:leading-relaxed prose-a:text-purple-600 prose-a:no-underline hover:prose-a:text-purple-800 prose-strong:text-black prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200 prose-pre:overflow-x-auto prose-pre:whitespace-pre prose-pre:word-wrap-normal prose-pre:word-break-normal prose-img:rounded-lg prose-img:my-4 [&_iframe]:w-full [&_iframe]:rounded-lg [&_iframe]:aspect-video [&_iframe]:h-[400px] [&_iframe]:my-4 [&_iframe]:border-0 [&_.embed-container]:my-4 [&_pre_code]:whitespace-pre [&_pre_code]:overflow-x-auto [&_pre_code]:block"
        dangerouslySetInnerHTML={{ __html: processEmbedContent(htmlContent) }}
        suppressHydrationWarning
      />
    );
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <CenterNavbar />
      
      {/* Single Blog Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl text-left">
          {/* Date and Title */}
          <div className="mb-8">
            <time className="text-sm text-gray-500 font-medium">
              {new Date(blogPost.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </time>
            <h1 className="mt-6 text-4xl font-medium font-sans tracking-tight">
              {blogPost.title}
            </h1>
          </div>

          {/* Blog Content */}
            <div className="mb-16 space-y-6 text-base leading-relaxed text-gray-600 md:text-lg text-left max-w-2xl text-gray-800">
              {renderDescription(blogPost.description)}

            {/* Related Links Section */}
            {blogPost.links && blogPost.links.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-medium font-sans tracking-tight text-black mb-4">
                  Related Links
                </h2>
                <div className="space-y-3">
                  {blogPost.links.map((link, index) => (
                    <div key={index}>
                      <LinkPreview
                        url={link.url}
                        className="text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2"
                      >
                        {link.text} →
                      </LinkPreview>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 gap-x-10">
            <Link 
              href="/blog"
              className="text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
            >
              ← Blog Directory
            </Link>
            <Link 
              href="/"
              className="text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
            >
              Home →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}