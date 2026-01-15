"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import CenterNavbar from "@/components/CenterNavbar";
import RichTextEditor from "@/components/RichTextEditor";
import IdeaBox from "@/components/IdeaBox";
import ImagePicker from "@/components/ImagePicker";
import { BlogPost, BlogLink } from "@/lib/types";
import { processEmbedContent } from "@/lib/embed-utils";
import { initializeCopyButtons } from "@/lib/code-copy-utils";

export default function AdminDashboard() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null); // Track which post is being edited
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

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBlogs();
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
      <main className="min-h-screen bg-white text-black">
        <CenterNavbar />
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
          <div className="max-w-md w-full text-left">
            <p className="text-lg text-gray-600">Checking authentication...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white text-black">
        <CenterNavbar />
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
          <div className="max-w-md w-full text-left">
            <div className="mb-8">
              <h1 className="mt-6 text-4xl font-medium font-sans tracking-tight">
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit' 
                }).replace(/\//g, '.')}
                <br />
                Admin Access
              </h1>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Key
                </label>
                <input
                  type="password"
                  id="adminKey"
                  value={adminKey}
                  onChange={(e) => {
                    setAdminKey(e.target.value);
                    setLoginError("");
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                  placeholder="Enter admin key..."
                  required
                />
                {loginError && (
                  <p className="mt-2 text-sm text-red-600">{loginError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
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
      
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl text-left w-full">
          <div className="mb-8">
            <h1 className="mt-6 text-3xl font-medium font-sans tracking-tight">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              }).replace(/\//g, '.')}
              <br />
              Admin Dashboard
            </h1>
          </div>

          <div className="mb-16 space-y-6 text-base leading-relaxed text-gray-600 md:text-lg text-left max-w-2xl text-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-medium font-sans tracking-tight text-black">
                Blog Management
              </h2>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
            <div className="border-b border-gray-200 pb-8">
              
              {!isCreating ? (
                <button
                  onClick={() => {
                    setIsCreating(true);
                    setIsEditing(null);
                    setNewPost({ title: "", description: "", thumbnail: "", links: [] });
                    setThumbnailPreview("");
                  }}
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  + Create New Blog Post
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Preview/Edit Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-700">
                      {isEditing ? 'Edit Blog Post' : isPreview ? 'Preview' : 'Create New Post'}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPreview(!isPreview)}
                        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {isPreview ? '✏️ Edit' : '👁️ Preview'}
                      </button>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-400 text-white text-sm font-medium rounded-lg hover:bg-gray-500 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Idea Box */}
                  {!isPreview && (
                    <div className="mb-6">
                      <IdeaBox
                        onInsertTitle={(title) => {
                          setNewPost({ ...newPost, title });
                        }}
                        onInsertContent={(content) => {
                          // Append or replace content in editor
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
                    <div className="border border-gray-300 rounded-lg p-8 bg-white">
                      {newPost.title ? (
                        <>
                          <div className="mb-8">
                            <time className="text-sm text-gray-500 font-medium">
                              {new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              })}
                            </time>
                            <h1 className="mt-6 text-4xl font-medium font-sans tracking-tight">
                              {newPost.title}
                            </h1>
                          </div>

                          {newPost.thumbnail && (
                            <div className="mb-8">
                              <img 
                                src={newPost.thumbnail} 
                                alt={newPost.title}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                            </div>
                          )}

                          <div className="mb-16 space-y-6 text-base leading-relaxed text-gray-600 md:text-lg text-left max-w-2xl text-gray-800">
                            {newPost.description ? (
                              <div
                                ref={previewContentRef}
                                className="prose prose-lg max-w-none prose-headings:font-sans prose-headings:tracking-tight prose-p:text-gray-800 prose-p:leading-relaxed prose-a:text-purple-600 prose-a:no-underline hover:prose-a:text-purple-800 prose-strong:text-black prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200 prose-pre:overflow-x-auto prose-pre:whitespace-pre prose-pre:word-wrap-normal prose-pre:word-break-normal prose-img:rounded-lg prose-img:my-4 [&_iframe]:w-full [&_iframe]:rounded-lg [&_iframe]:aspect-video [&_iframe]:h-[400px] [&_iframe]:my-4 [&_iframe]:border-0 [&_.embed-container]:my-4 [&_pre_code]:whitespace-pre [&_pre_code]:overflow-x-auto [&_pre_code]:block"
                                dangerouslySetInnerHTML={{ __html: processEmbedContent(newPost.description) }}
                                suppressHydrationWarning
                              />
                            ) : (
                              <p className="text-gray-400 italic">No content yet. Start writing to see preview.</p>
                            )}

                            {/* Related Links Section */}
                            {newPost.links && newPost.links.length > 0 && (
                              <div className="mt-12 pt-8 border-t border-gray-200">
                                <h2 className="text-xl font-medium font-sans tracking-tight text-black mb-4">
                                  Related Links
                                </h2>
                                <div className="space-y-3">
                                  {newPost.links.map((link, index) => (
                                    <div key={index}>
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2"
                                      >
                                        {link.text} →
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-400 italic">Add a title and content to see preview.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Edit Mode */
                    <form onSubmit={isEditing ? handleUpdatePost : handleCreatePost} className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                          Blog Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                          placeholder="Enter blog title..."
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                          Thumbnail Image (Optional)
                        </label>
                        {thumbnailPreview && (
                          <div className="mb-3">
                            <img 
                              src={thumbnailPreview} 
                              alt="Thumbnail preview" 
                              className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setNewPost({ ...newPost, thumbnail: "" });
                                setThumbnailPreview("");
                              }}
                              className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                              Remove thumbnail
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowImagePicker(true)}
                            className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            📷 Search from Pexels
                          </button>
                          <label className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors cursor-pointer text-center">
                            📤 Upload Image
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
                          <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          Search from millions of free images on Pexels or upload your own. Recommended: 1200x630px or 16:9 aspect ratio.
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                          Blog Content
                        </label>
                        <RichTextEditor
                          content={newPost.description}
                          onChange={(content) => setNewPost({ ...newPost, description: content })}
                          placeholder="Start writing your blog post... Use the toolbar to format text, add images, links, code blocks, and more!"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Links (Optional)
                        </label>
                        <div className="space-y-2">
                          {newPost.links?.map((link, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                              <span className="flex-1 text-sm">{link.text} → {link.url}</span>
                              <button
                                type="button"
                                onClick={() => removeLink(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newLink.text}
                              onChange={(e) => setNewLink({ ...newLink, text: e.target.value })}
                              placeholder="Link text..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <input
                              type="url"
                              value={newLink.url}
                              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                              placeholder="https://..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              type="button"
                              onClick={addLink}
                              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          {isEditing ? 'Update Post' : 'Create Post'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-medium font-sans tracking-tight text-black mb-6">
                Existing Blog Posts ({blogPosts.length})
              </h3>
              
              {blogPosts.length === 0 ? (
                <p className="text-gray-600">No blog posts found. Create your first post above!</p>
              ) : (
                <div className="space-y-6">
                  {blogPosts.map((post) => (
                    <article key={post.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <time className="text-sm text-gray-500 font-medium">
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                          <h4 className="mt-2 text-xl font-medium font-sans tracking-tight text-black">
                            {post.title}
                          </h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-base line-clamp-3">
                        {(() => {
                          // Strip HTML tags for preview
                          const textContent = post.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                          return textContent.length > 150 
                            ? `${textContent.substring(0, 150)}...` 
                            : textContent;
                        })()}
                      </p>
                      {post.links && post.links.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-500">Links: {post.links.length}</span>
                        </div>
                      )}
                      <div className="mt-4 flex space-x-4">
                        <a
                          href={`/blog/${post.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors text-sm"
                        >
                          View Post →
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link 
              href="/blog"
              className="text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
            >
              ← View Public Blog
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
