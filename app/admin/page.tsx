"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CenterNavbar from "@/components/CenterNavbar";
import { BlogPost, BlogLink } from "@/lib/types";

export default function AdminDashboard() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    links: [] as BlogLink[]
  });
  const [newLink, setNewLink] = useState({ text: "", url: "" });

  useEffect(() => {
    if (isAuthenticated) {
      fetchBlogs();
    }
  }, [isAuthenticated]);

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

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, verify this properly
    if (adminKey) {
      setIsAuthenticated(true);
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
          'x-admin-key': adminKey
        },
        body: JSON.stringify(newPost)
      });

      const result = await response.json();
      if (result.success) {
        await fetchBlogs();
        setNewPost({ title: "", description: "", links: [] });
        setIsCreating(false);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Failed to create blog post');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': adminKey
        }
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
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                  placeholder="Enter admin key..."
                  required
                />
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
      
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl text-left w-full">
          <div className="mb-8">
            <h1 className="mt-6 text-4xl font-medium font-sans tracking-tight">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              }).replace(/\//g, '.')}
              <br />
              Admin Dashboard
            </h1>
          </div>

          <div className="mb-16 space-y-6 text-lg leading-relaxed text-gray-600 md:text-xl text-left max-w-2xl text-gray-800">
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-2xl font-medium font-sans tracking-tight text-black mb-6">
                Blog Management
              </h2>
              
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  + Create New Blog Post
                </button>
              ) : (
                <form onSubmit={handleCreatePost} className="space-y-4">
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
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Blog Description
                    </label>
                    <textarea
                      id="description"
                      value={newPost.description}
                      onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base resize-vertical"
                      placeholder="Enter blog description..."
                      required
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
                      Create Post
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setNewPost({ title: "", description: "", links: [] });
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
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
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-base line-clamp-3">
                        {post.description.length > 150 
                          ? `${post.description.substring(0, 150)}...` 
                          : post.description
                        }
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
