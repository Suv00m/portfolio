"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import CenterNavbar from "@/components/CenterNavbar";
import RichTextEditor from "@/components/RichTextEditor";
import IdeaBox from "@/components/IdeaBox";
import ImagePicker from "@/components/ImagePicker";
import { BlogPost, BlogLink, NewsArticle } from "@/lib/types";
import { processEmbedContent } from "@/lib/embed-utils";
import { initializeCopyButtons } from "@/lib/code-copy-utils";

export default function AdminDashboard() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    thumbnail: "",
    links: [] as BlogLink[]
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [newLink, setNewLink] = useState({ text: "", url: "" });
  const previewContentRef = useRef<HTMLDivElement>(null);

  // News generation state
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsCount, setNewsCount] = useState(3);
  const [isGeneratingNews, setIsGeneratingNews] = useState(false);
  const [newsResult, setNewsResult] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Cron state
  const [cronConfig, setCronConfig] = useState<{
    cronSecret: boolean;
    supabase: boolean;
    openrouter: boolean;
    pexels: boolean;
    schedule: string;
  } | null>(null);
  const [isCronTesting, setIsCronTesting] = useState(false);
  const [cronResult, setCronResult] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [lastCronRun, setLastCronRun] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBlogs();
      fetchNewsArticles();
      fetchCronConfig();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      const result = await response.json();
      setIsAuthenticated(result.authenticated || false);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize copy buttons in preview when content changes
  useEffect(() => {
    if (isPreview && newPost.description && previewContentRef.current) {
      initializeCopyButtons(previewContentRef.current);
    }
  }, [isPreview, newPost.description]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      const result = await response.json();
      if (result.success) {
        setBlogPosts(result.data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (!adminKey.trim()) {
      setLoginError("Please enter an admin key");
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminKey }),
      });

      const result = await response.json();
      
      if (result.success) {
        setIsAuthenticated(true);
        setAdminKey(""); // Clear the input
      } else {
        if (response.status === 429) {
          setLoginError(`Too many attempts. Try again in ${Math.ceil((result.retryAfter || 0) / 60)} minutes.`);
        } else {
          setLoginError(result.error || 'Invalid admin key');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Failed to login. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setBlogPosts([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.description.trim()) return;

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(newPost)
      });

      const result = await response.json();
      if (result.success) {
        await fetchBlogs();
        setNewPost({ title: "", description: "", thumbnail: "", links: [] });
        setThumbnailPreview("");
        setIsCreating(false);
        setIsPreview(false);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Failed to create blog post');
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setNewPost({
      title: post.title,
      description: post.description,
      thumbnail: post.thumbnail || "",
      links: post.links || []
    });
    setThumbnailPreview(post.thumbnail || "");
    setIsEditing(post.id);
    setIsCreating(true);
    setIsPreview(false);
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing || !newPost.title.trim() || !newPost.description.trim()) return;

    try {
      const response = await fetch(`/api/blogs/${isEditing}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newPost)
      });

      const result = await response.json();
      if (result.success) {
        await fetchBlogs();
        setNewPost({ title: "", description: "", thumbnail: "", links: [] });
        setThumbnailPreview("");
        setIsCreating(false);
        setIsEditing(null);
        setIsPreview(false);
        alert('Blog post updated successfully!');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Failed to update blog post');
    }
  };

  const handleCancelEdit = () => {
    setNewPost({ title: "", description: "", thumbnail: "", links: [] });
    setThumbnailPreview("");
    setIsCreating(false);
    setIsEditing(null);
    setIsPreview(false);
  };

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File must be an image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setNewPost({ ...newPost, thumbnail: result.url });
        setThumbnailPreview(result.url);
      } else {
        alert('Failed to upload thumbnail: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('Failed to upload thumbnail');
    } finally {
      setIsUploadingThumbnail(false);
      event.target.value = '';
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies
      });

      const result = await response.json();
      if (result.success) {
        await fetchBlogs();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog post');
    }
  };

  const fetchCronConfig = async () => {
    try {
      const response = await fetch("/api/admin/cron-test", { credentials: "include" });
      const result = await response.json();
      if (result.success) {
        setCronConfig(result.config);
      }
    } catch (error) {
      console.error("Error fetching cron config:", error);
    }
  };

  const handleCronTest = async () => {
    setIsCronTesting(true);
    setCronResult(null);

    try {
      const response = await fetch("/api/admin/cron-test", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();
      const now = new Date().toLocaleString();
      setLastCronRun(now);

      if (result.success && result.result?.success) {
        const created = result.result.articlesCreated || 0;
        setCronResult({
          message: created > 0
            ? `Cron executed — ${created} article${created > 1 ? "s" : ""} generated`
            : result.result.message || "Cron executed — no new topics found",
          type: "success",
        });
        await fetchNewsArticles();
      } else {
        setCronResult({
          message: result.result?.error || result.error || "Cron test failed",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Cron test error:", error);
      setCronResult({ message: "Failed to trigger cron job", type: "error" });
    } finally {
      setIsCronTesting(false);
    }
  };

  const fetchNewsArticles = async () => {
    try {
      const response = await fetch("/api/news");
      const result = await response.json();
      if (result.success) {
        setNewsArticles(result.data);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const handleGenerateNews = async () => {
    setIsGeneratingNews(true);
    setNewsResult(null);

    try {
      const response = await fetch("/api/admin/generate-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ count: newsCount }),
      });

      const result = await response.json();

      if (result.success) {
        setNewsResult({
          message: result.articlesCreated > 0
            ? `Generated ${result.articlesCreated} article${result.articlesCreated > 1 ? "s" : ""}`
            : result.message || "No new trending topics found",
          type: "success",
        });
        await fetchNewsArticles();
      } else {
        setNewsResult({
          message: result.error || "Failed to generate news",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error generating news:", error);
      setNewsResult({ message: "Failed to generate news", type: "error" });
    } finally {
      setIsGeneratingNews(false);
    }
  };

  const handleDeleteNews = async (slug: string) => {
    if (!window.confirm("Delete this news article?")) return;

    try {
      const response = await fetch(`/api/news/${slug}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        await fetchNewsArticles();
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      alert("Failed to delete article");
    }
  };

  const addLink = () => {
    if (newLink.text && newLink.url) {
      setNewPost({
        ...newPost,
        links: [...(newPost.links || []), newLink]
      });
      setNewLink({ text: "", url: "" });
    }
  };

  const removeLink = (index: number) => {
    setNewPost({
      ...newPost,
      links: newPost.links?.filter((_, i) => i !== index) || []
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white text-[#0a0a0a] overflow-hidden">
        <CenterNavbar />
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20">
          <div className="absolute inset-0 bg-dots opacity-20" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
          <p className="relative z-10 mt-6 font-display text-lg font-bold tracking-tight">AUTHENTICATING...</p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white text-[#0a0a0a] overflow-hidden">
        <CenterNavbar />
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-dots opacity-20" />

          {/* Decorative shapes */}
          <div className="absolute top-20 right-0 w-48 h-48 bg-[#ff3d00] -rotate-12 translate-x-1/3 opacity-80" />
          <div className="absolute bottom-20 left-0 w-32 h-32 bg-[#0066ff] rotate-6 -translate-x-1/3 opacity-80" />

          <div className="relative z-10 max-w-md w-full">
            <div className="card-brutal p-8 md:p-12">
              <div className="mb-8">
                <span className="tag-brutal-filled text-xs">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\//g, '.')}
                </span>
                <h1 className="mt-6 font-display text-4xl md:text-5xl font-black tracking-tighter leading-none">
                  ADMIN<br />
                  <span className="text-[#ff3d00]">ACCESS</span>
                </h1>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                <div>
                  <label htmlFor="adminKey" className="block font-display text-sm font-bold uppercase tracking-wider mb-3">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    id="adminKey"
                    value={adminKey}
                    onChange={(e) => {
                      setAdminKey(e.target.value);
                      setLoginError("");
                    }}
                    className="input-brutal"
                    placeholder="Enter admin key..."
                    required
                  />
                  {loginError && (
                    <div className="mt-3 p-3 bg-[#ff3d00] text-white border-3 border-[#0a0a0a]">
                      <p className="text-sm font-bold">{loginError}</p>
                    </div>
                  )}
                </div>
                <button type="submit" className="btn-brutal w-full justify-center">
                  ACCESS DASHBOARD
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a] overflow-hidden">
      <CenterNavbar />

      {showImagePicker && (
        <ImagePicker
          onSelect={(imageUrl) => {
            setNewPost({ ...newPost, thumbnail: imageUrl });
            setThumbnailPreview(imageUrl);
            setShowImagePicker(false);
          }}
          currentImage={newPost.thumbnail}
          onClose={() => setShowImagePicker(false)}
        />
      )}

      <section className="relative min-h-screen px-6 md:px-12 lg:px-24 py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dots opacity-10" />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="tag-brutal-filled text-xs">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                }).replace(/\//g, '.')}
              </span>
              <h1 className="mt-4 font-display text-5xl md:text-6xl font-black tracking-tighter leading-none">
                ADMIN<br />
                <span className="text-[#ff3d00]">DASHBOARD</span>
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="btn-brutal-outline self-start md:self-auto"
            >
              LOGOUT
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* Blog Management Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-display text-2xl font-bold tracking-tight">BLOG MANAGEMENT</h2>
              <div className="flex-1 h-1 bg-[#0a0a0a]" />
            </div>

            <div className="pb-8 border-b-4 border-[#0a0a0a]">
              
              {!isCreating ? (
                <button
                  onClick={() => {
                    setIsCreating(true);
                    setIsEditing(null);
                    setNewPost({ title: "", description: "", thumbnail: "", links: [] });
                    setThumbnailPreview("");
                  }}
                  className="btn-brutal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4" />
                  </svg>
                  CREATE NEW POST
                </button>
              ) : (
                <div className="space-y-6">
                  {/* Preview/Edit Toggle */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="font-display text-xl font-bold tracking-tight">
                      {isEditing ? (
                        <span className="flex items-center gap-3">
                          <span className="w-3 h-3 bg-[#0066ff] rotate-45" />
                          EDITING POST
                        </span>
                      ) : isPreview ? (
                        <span className="flex items-center gap-3">
                          <span className="w-3 h-3 bg-[#ff3d00] rotate-45" />
                          PREVIEW MODE
                        </span>
                      ) : (
                        <span className="flex items-center gap-3">
                          <span className="w-3 h-3 bg-[#0a0a0a] rotate-45" />
                          NEW POST
                        </span>
                      )}
                    </h3>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPreview(!isPreview)}
                        className="px-4 py-2 bg-[#0a0a0a] text-white font-display text-sm font-bold uppercase tracking-wider border-3 border-[#0a0a0a] shadow-brutal-sm hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1 transition-all"
                      >
                        {isPreview ? 'EDIT' : 'PREVIEW'}
                      </button>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-white text-[#0a0a0a] font-display text-sm font-bold uppercase tracking-wider border-3 border-[#0a0a0a] shadow-brutal-sm hover:bg-[#0a0a0a] hover:text-white transition-all"
                        >
                          CANCEL
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Idea Box */}
                  {!isPreview && (
                    <div className="mb-8">
                      <IdeaBox
                        onInsertTitle={(title) => {
                          setNewPost({ ...newPost, title });
                        }}
                        onInsertContent={(content) => {
                          const currentContent = newPost.description || '';
                          const newContent = currentContent
                            ? `${currentContent}\n\n${content}`
                            : content;
                          setNewPost({ ...newPost, description: newContent });
                        }}
                      />
                    </div>
                  )}

                  {isPreview ? (
                    /* Preview Mode */
                    <div className="card-brutal p-8 md:p-12">
                      {newPost.title ? (
                        <>
                          <div className="mb-8">
                            <span className="tag-brutal text-xs">
                              {new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              }).replace(/\//g, '.')}
                            </span>
                            <h1 className="mt-6 font-display text-4xl md:text-5xl font-black tracking-tighter">
                              {newPost.title}
                            </h1>
                          </div>

                          {newPost.thumbnail && (
                            <div className="mb-8 stacked-image">
                              <img
                                src={newPost.thumbnail}
                                alt={newPost.title}
                                className="w-full h-64 object-cover border-3 border-[#0a0a0a]"
                              />
                            </div>
                          )}

                          <div className="space-y-6 text-base leading-relaxed md:text-lg">
                            {newPost.description ? (
                              <div
                                ref={previewContentRef}
                                className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-p:text-zinc-600 prose-a:text-blue-600 hover:prose-a:text-orange-500 prose-strong:text-zinc-900 prose-pre:bg-black prose-pre:text-green-400 prose-pre:rounded-none prose-pre:text-sm prose-pre:border prose-pre:border-zinc-700 prose-code:bg-zinc-100 prose-code:text-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-img:rounded-lg [&_iframe]:w-full [&_iframe]:rounded-lg [&_iframe]:aspect-video [&_iframe]:my-4"
                                dangerouslySetInnerHTML={{ __html: processEmbedContent(newPost.description) }}
                                suppressHydrationWarning
                              />
                            ) : (
                              <p className="text-[#737373] font-display">No content yet. Start writing to see preview.</p>
                            )}

                            {/* Related Links Section */}
                            {newPost.links && newPost.links.length > 0 && (
                              <div className="mt-12 pt-8 border-t-4 border-[#0a0a0a]">
                                <h2 className="font-display text-xl font-bold tracking-tight mb-4">
                                  RELATED LINKS
                                </h2>
                                <div className="space-y-3">
                                  {newPost.links.map((link, index) => (
                                    <div key={index}>
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-[#0066ff] hover:text-[#ff3d00] font-bold underline decoration-2 underline-offset-4 transition-colors"
                                      >
                                        {link.text}
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                          <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 mx-auto mb-4 border-4 border-dashed border-[#e5e5e5] flex items-center justify-center">
                            <span className="text-2xl text-[#e5e5e5]">?</span>
                          </div>
                          <p className="text-[#737373] font-display">Add a title and content to see preview.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Edit Mode */
                    <form onSubmit={isEditing ? handleUpdatePost : handleCreatePost} className="space-y-6">
                      <div>
                        <label htmlFor="title" className="block font-display text-sm font-bold uppercase tracking-wider mb-3">
                          Blog Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                          className="input-brutal"
                          placeholder="Enter blog title..."
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="thumbnail" className="block font-display text-sm font-bold uppercase tracking-wider mb-3">
                          Thumbnail Image <span className="text-[#737373] font-normal lowercase">(optional)</span>
                        </label>
                        {thumbnailPreview && (
                          <div className="mb-4">
                            <div className="stacked-image inline-block">
                              <img
                                src={thumbnailPreview}
                                alt="Thumbnail preview"
                                className="w-full max-w-md h-48 object-cover border-3 border-[#0a0a0a]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setNewPost({ ...newPost, thumbnail: "" });
                                setThumbnailPreview("");
                              }}
                              className="mt-4 block text-sm text-[#ff3d00] hover:text-[#0a0a0a] font-bold uppercase tracking-wider transition-colors"
                            >
                              &times; Remove thumbnail
                            </button>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={() => setShowImagePicker(true)}
                            className="flex-1 px-4 py-3 bg-[#0066ff] text-white font-display text-sm font-bold uppercase tracking-wider border-3 border-[#0a0a0a] shadow-brutal-sm hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1 transition-all"
                          >
                            SEARCH PEXELS
                          </button>
                          <label className="flex-1 px-4 py-3 bg-white text-[#0a0a0a] font-display text-sm font-bold uppercase tracking-wider border-3 border-[#0a0a0a] shadow-brutal-sm hover:bg-[#0a0a0a] hover:text-white transition-all cursor-pointer text-center">
                            UPLOAD IMAGE
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailUpload}
                              disabled={isUploadingThumbnail}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {isUploadingThumbnail && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="loading-dot !w-3 !h-3" />
                            <span className="text-sm font-bold">Uploading...</span>
                          </div>
                        )}
                        <p className="mt-3 text-xs text-[#737373]">
                          Search from millions of free images on Pexels or upload your own. Recommended: 1200x630px or 16:9 aspect ratio.
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block font-display text-sm font-bold uppercase tracking-wider mb-3">
                          Blog Content
                        </label>
                        <RichTextEditor
                          content={newPost.description}
                          onChange={(content) => setNewPost({ ...newPost, description: content })}
                          placeholder="Start writing your blog post... Use the toolbar to format text, add images, links, code blocks, and more!"
                        />
                      </div>

                      <div>
                        <label className="block font-display text-sm font-bold uppercase tracking-wider mb-3">
                          Related Links <span className="text-[#737373] font-normal lowercase">(optional)</span>
                        </label>
                        <div className="space-y-3">
                          {newPost.links?.map((link, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-[#f5f5f5] border-2 border-[#e5e5e5]">
                              <span className="flex-1 text-sm font-medium truncate">{link.text} <span className="text-[#737373]">→</span> {link.url}</span>
                              <button
                                type="button"
                                onClick={() => removeLink(index)}
                                className="text-[#ff3d00] hover:text-[#0a0a0a] text-sm font-bold uppercase tracking-wider transition-colors"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              value={newLink.text}
                              onChange={(e) => setNewLink({ ...newLink, text: e.target.value })}
                              placeholder="Link text..."
                              className="flex-1 px-4 py-3 border-3 border-[#0a0a0a] text-sm focus:outline-none focus:shadow-brutal-sm focus:-translate-x-1 focus:-translate-y-1 transition-all"
                            />
                            <input
                              type="url"
                              value={newLink.url}
                              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                              placeholder="https://..."
                              className="flex-1 px-4 py-3 border-3 border-[#0a0a0a] text-sm focus:outline-none focus:shadow-brutal-sm focus:-translate-x-1 focus:-translate-y-1 transition-all"
                            />
                            <button
                              type="button"
                              onClick={addLink}
                              className="px-6 py-3 bg-[#0a0a0a] text-white font-display text-sm font-bold uppercase tracking-wider border-3 border-[#0a0a0a] hover:bg-[#ff3d00] hover:border-[#ff3d00] transition-colors"
                            >
                              ADD
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button type="submit" className="btn-brutal">
                          {isEditing ? 'UPDATE POST' : 'CREATE POST'}
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="btn-brutal-outline"
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Existing Posts */}
            <div className="mt-12">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="font-display text-xl font-bold tracking-tight">
                  ALL POSTS <span className="tag-brutal-accent ml-2">{blogPosts.length}</span>
                </h3>
                <div className="flex-1 h-1 bg-[#e5e5e5]" />
              </div>

              {blogPosts.length === 0 ? (
                <div className="card-brutal p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#f5f5f5] border-3 border-dashed border-[#e5e5e5] flex items-center justify-center">
                    <span className="text-4xl text-[#e5e5e5]">+</span>
                  </div>
                  <p className="font-display text-lg font-bold text-[#737373]">No blog posts yet.</p>
                  <p className="text-[#737373] mt-2">Create your first post above!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {blogPosts.map((post, index) => (
                    <article key={post.id} className="card-brutal p-6 md:p-8 hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="tag-brutal text-xs">
                              {new Date(post.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              }).replace(/\//g, '.')}
                            </span>
                            {post.links && post.links.length > 0 && (
                              <span className="tag-brutal-filled text-xs">{post.links.length} LINKS</span>
                            )}
                          </div>
                          <h4 className="font-display text-xl md:text-2xl font-bold tracking-tight">
                            {post.title}
                          </h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="px-4 py-2 bg-[#0066ff] text-white font-display text-xs font-bold uppercase tracking-wider border-2 border-[#0a0a0a] hover:bg-[#0a0a0a] transition-colors"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="px-4 py-2 bg-[#ff3d00] text-white font-display text-xs font-bold uppercase tracking-wider border-2 border-[#0a0a0a] hover:bg-[#0a0a0a] transition-colors"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                      <p className="text-[#525252] leading-relaxed line-clamp-2">
                        {(() => {
                          const textContent = post.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                          return textContent.length > 150
                            ? `${textContent.substring(0, 150)}...`
                            : textContent;
                        })()}
                      </p>
                      <div className="mt-4 pt-4 border-t-2 border-[#e5e5e5]">
                        <a
                          href={`/blog/${post.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#0066ff] hover:text-[#ff3d00] font-bold text-sm uppercase tracking-wider transition-colors"
                        >
                          VIEW POST
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* News Generation Section */}
          <div className="mt-16 space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-display text-2xl font-bold tracking-tight">NEWS GENERATION</h2>
              <div className="flex-1 h-1 bg-[#0a0a0a]" />
            </div>

            {/* Generate Controls */}
            <div className="card-brutal p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                <div>
                  <label className="block font-display text-sm font-bold uppercase tracking-wider mb-3">
                    Articles to Generate
                  </label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNewsCount(n)}
                        className={`w-12 h-12 font-display text-lg font-bold border-3 border-[#0a0a0a] transition-all ${
                          newsCount === n
                            ? "bg-[#0a0a0a] text-white shadow-brutal-accent"
                            : "bg-white text-[#0a0a0a] hover:bg-[#f5f5f5]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateNews}
                  disabled={isGeneratingNews}
                  className="btn-brutal disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingNews ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="loading-dot !w-3 !h-3" />
                        <div className="loading-dot !w-3 !h-3" />
                        <div className="loading-dot !w-3 !h-3" />
                      </div>
                      GENERATING...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      GENERATE NEWS
                    </>
                  )}
                </button>
              </div>

              <p className="mt-4 text-xs text-[#737373]">
                Fetches trending AI/tech topics from Reddit, generates articles via AI, and publishes to the news section.
              </p>

              {newsResult && (
                <div
                  className={`mt-4 p-4 border-3 border-[#0a0a0a] font-display text-sm font-bold ${
                    newsResult.type === "success"
                      ? "bg-[#22c55e] text-white"
                      : "bg-[#ff3d00] text-white"
                  }`}
                >
                  {newsResult.message}
                </div>
              )}
            </div>

            {/* Cron Job Control Panel */}
            <div className="card-brutal-inverse p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-[#ff3d00] rotate-45" />
                    <h3 className="font-display text-lg font-bold tracking-tight text-white uppercase">
                      Cron Job Control
                    </h3>
                  </div>

                  {/* Config Status */}
                  {cronConfig && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {Object.entries(cronConfig).filter(([key]) => key !== 'schedule').map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 border-2 border-white ${value ? "bg-[#22c55e]" : "bg-[#ff3d00]"}`} />
                          <span className="font-mono text-xs text-[#a3a3a3] uppercase">{key}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#333]">
                      <svg className="w-4 h-4 text-[#737373]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-mono text-xs text-[#a3a3a3]">
                        {cronConfig?.schedule || "Loading..."}
                      </span>
                    </div>
                    {lastCronRun && (
                      <span className="font-mono text-xs text-[#737373]">
                        Last run: {lastCronRun}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCronTest}
                  disabled={isCronTesting}
                  className="px-6 py-3 bg-[#ff3d00] text-white font-display text-sm font-bold uppercase tracking-wider border-3 border-white shadow-[4px_4px_0px_#fff] hover:shadow-[6px_6px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCronTesting ? (
                    <span className="flex items-center gap-2">
                      <div className="loading-dot !w-2.5 !h-2.5 !bg-white" />
                      <div className="loading-dot !w-2.5 !h-2.5 !bg-white" />
                      <div className="loading-dot !w-2.5 !h-2.5 !bg-white" />
                      RUNNING...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      TEST CRON NOW
                    </span>
                  )}
                </button>
              </div>

              {cronResult && (
                <div
                  className={`mt-4 p-4 border-2 font-display text-sm font-bold ${
                    cronResult.type === "success"
                      ? "border-[#22c55e] bg-[#22c55e]/20 text-[#22c55e]"
                      : "border-[#ff3d00] bg-[#ff3d00]/20 text-[#ff3d00]"
                  }`}
                >
                  {cronResult.message}
                </div>
              )}
            </div>

            {/* Existing News Articles */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <h3 className="font-display text-xl font-bold tracking-tight">
                  ALL NEWS <span className="tag-brutal-accent ml-2">{newsArticles.length}</span>
                </h3>
                <div className="flex-1 h-1 bg-[#e5e5e5]" />
              </div>

              {newsArticles.length === 0 ? (
                <div className="card-brutal p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#f5f5f5] border-3 border-dashed border-[#e5e5e5] flex items-center justify-center">
                    <span className="text-4xl text-[#e5e5e5]">+</span>
                  </div>
                  <p className="font-display text-lg font-bold text-[#737373]">No news articles yet.</p>
                  <p className="text-[#737373] mt-2">Generate your first batch above!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {newsArticles.map((article) => (
                    <article
                      key={article.id}
                      className="card-brutal p-6 md:p-8 hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="tag-brutal text-xs">
                              {new Date(article.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }).replace(/\//g, ".")}
                            </span>
                            <span className="tag-brutal-accent text-xs">
                              r/{article.source_subreddit}
                            </span>
                          </div>
                          <h4 className="font-display text-xl md:text-2xl font-bold tracking-tight">
                            {article.title}
                          </h4>
                          <p className="mt-2 text-sm text-[#737373] line-clamp-1">
                            {article.excerpt}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteNews(article.slug)}
                            className="px-4 py-2 bg-[#ff3d00] text-white font-display text-xs font-bold uppercase tracking-wider border-2 border-[#0a0a0a] hover:bg-[#0a0a0a] transition-colors"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.map((tag) => (
                            <span key={tag} className="tag-brutal text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="pt-4 border-t-2 border-[#e5e5e5]">
                        <a
                          href={`/news/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#0066ff] hover:text-[#ff3d00] font-bold text-sm uppercase tracking-wider transition-colors"
                        >
                          VIEW ARTICLE
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-16 pt-8 border-t-4 border-[#0a0a0a] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/blog"
              className="group card-brutal p-6 flex items-center justify-between hover:!shadow-brutal-accent"
            >
              <div>
                <span className="block font-mono text-xs text-[#737373] uppercase tracking-wider mb-1">/blog</span>
                <span className="font-display text-lg font-bold tracking-tight group-hover:text-[#ff3d00] transition-colors">
                  VIEW PUBLIC BLOG
                </span>
              </div>
              <svg className="w-6 h-6 text-[#a3a3a3] group-hover:text-[#ff3d00] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/news"
              className="group card-brutal p-6 flex items-center justify-between hover:!shadow-brutal-blue"
            >
              <div>
                <span className="block font-mono text-xs text-[#737373] uppercase tracking-wider mb-1">/news</span>
                <span className="font-display text-lg font-bold tracking-tight group-hover:text-[#0066ff] transition-colors">
                  VIEW PUBLIC NEWS
                </span>
              </div>
              <svg className="w-6 h-6 text-[#a3a3a3] group-hover:text-[#0066ff] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
