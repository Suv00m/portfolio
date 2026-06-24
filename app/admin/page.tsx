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

const DRAFT_KEY = 'admin_post_draft';

function saveDraft(post: { title: string; description: string; thumbnail: string; links: BlogLink[] }, editingId: string | null) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ post, editingId })); } catch {}
}
function loadDraft(): { post: { title: string; description: string; thumbnail: string; links: BlogLink[] }; editingId: string | null } | null {
  try { const r = localStorage.getItem(DRAFT_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch {} }

const ERR  = "oklch(62% 0.18 22)";
const OK   = "oklch(62% 0.15 145)";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-hover)",
  border: "1px solid var(--border)",
  color: "var(--tx-1)",
  borderRadius: "4px",
  padding: "0.4rem 0.625rem",
  fontSize: "0.8125rem",
  outline: "none",
};

const monoInputStyle: React.CSSProperties = { ...inputStyle, fontFamily: "var(--font-mono)" };

const btnPrimary: React.CSSProperties = {
  background: "var(--accent)",
  color: "var(--bg)",
  border: "none",
  borderRadius: "4px",
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: "500",
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--tx-2)",
  borderRadius: "4px",
  padding: "0.5rem 1rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

const btnSmall: React.CSSProperties = {
  background: "var(--bg-subtle)",
  border: "1px solid var(--border)",
  color: "var(--tx-2)",
  borderRadius: "4px",
  padding: "0.25rem 0.75rem",
  fontSize: "0.75rem",
  cursor: "pointer",
};

const OK_BG  = "oklch(62% 0.15 145 / 0.12)";
const ERR_BG = "oklch(62% 0.18 22 / 0.12)";
const OK_BD  = "oklch(62% 0.15 145 / 0.35)";
const ERR_BD = "oklch(62% 0.18 22 / 0.35)";

function StatusBadge({ result }: { result: { message: string; type: "success" | "error" } }) {
  const isOk = result.type === "success";
  return (
    <div className="px-3 py-2 rounded text-xs font-medium"
         style={{
           background: isOk ? OK_BG  : ERR_BG,
           color:      isOk ? OK     : ERR,
           border:     `1px solid ${isOk ? OK_BD : ERR_BD}`,
         }}>
      {result.message}
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-6 pb-3" style={{ borderBottom: "1px solid var(--border-faint)" }}>
      <p className="text-xs font-medium uppercase tracking-[0.1em]" style={{ color: "var(--tx-3)" }}>{label}</p>
      {count !== undefined && (
        <span className="font-mono text-xs" style={{ color: "var(--tx-3)" }}>{count}</span>
      )}
    </div>
  );
}

function DraftModal({ onSave, onDiscard, onKeep }: { onSave: () => void; onDiscard: () => void; onKeep: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
         style={{ background: 'oklch(0% 0 0 / 0.55)' }} onClick={onKeep}>
      <div className="w-full max-w-xs rounded-lg p-5"
           style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', boxShadow: '0 16px 48px oklch(0% 0 0 / 0.5)' }}
           onClick={e => e.stopPropagation()}>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--tx-1)' }}>Unsaved changes</p>
        <p className="text-xs mb-5" style={{ color: 'var(--tx-3)' }}>Save as draft to resume later, or discard.</p>
        <div className="flex flex-col gap-2">
          <button onClick={onSave} style={{ ...btnPrimary, width: '100%' }}>Save draft</button>
          <button onClick={onDiscard} style={{ ...btnSecondary, width: '100%', color: ERR, borderColor: 'oklch(62% 0.18 22 / 0.4)' }}>Discard</button>
          <button onClick={onKeep} style={{ ...btnSecondary, width: '100%' }}>Keep editing</button>
        </div>
      </div>
    </div>
  );
}

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
    links: [] as BlogLink[],
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [newLink, setNewLink] = useState({ text: "", url: "" });
  const [hasDraft, setHasDraft] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const pendingBackRef = useRef(false);

  const isDirty = isCreating && Boolean(newPost.title.trim() || newPost.description.trim());

  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsCount, setNewsCount] = useState(3);
  const [newsSources, setNewsSources] = useState<Set<string>>(new Set(["reddit", "hackernews", "papers"]));
  const [isGeneratingNews, setIsGeneratingNews] = useState(false);
  const [newsResult, setNewsResult] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [editNewsForm, setEditNewsForm] = useState({
    title: "",
    slug: "",
    description: "",
    excerpt: "",
    thumbnail: "",
    source_subreddit: "",
    source_urls: "",
    tags: "",
    created_at: "",
  });
  const [isSavingNews, setIsSavingNews] = useState(false);

  const [cronConfig, setCronConfig] = useState<{
    cronSecret: boolean;
    supabase: boolean;
    openrouter: boolean;
    pexels: boolean;
    schedule: string;
    cronHour: number;
  } | null>(null);
  const [cronHour, setCronHour] = useState<number>(8);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isCronTesting, setIsCronTesting] = useState(false);
  const [cronResult, setCronResult] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [lastCronRun, setLastCronRun] = useState<string | null>(null);

  useEffect(() => { checkAuth(); }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBlogs();
      fetchNewsArticles();
      fetchCronConfig();
      const draft = loadDraft();
      if (draft && (draft.post.title || draft.post.description)) setHasDraft(true);
    }
  }, [isAuthenticated]);

  // Silently save on tab close / refresh
  useEffect(() => {
    const handler = () => { if (isDirty) saveDraft(newPost, isEditing); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, newPost, isEditing]);

  // Intercept browser back button while form is dirty
  useEffect(() => {
    if (!isDirty) return;
    window.history.pushState({ draftGuard: true }, '');
    const handler = () => {
      // Re-push guard so we stay on the page
      window.history.pushState({ draftGuard: true }, '');
      pendingBackRef.current = true;
      setShowDraftModal(true);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [isDirty]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      const result = await response.json();
      setIsAuthenticated(result.authenticated || false);
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPreview && newPost.description && previewContentRef.current) {
      initializeCopyButtons(previewContentRef.current);
    }
  }, [isPreview, newPost.description]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs");
      const result = await response.json();
      if (result.success) setBlogPosts(result.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!adminKey.trim()) { setLoginError("Please enter an admin key"); return; }
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey }),
      });
      const result = await response.json();
      if (result.success) {
        setIsAuthenticated(true);
        setAdminKey("");
      } else {
        if (response.status === 429) {
          setLoginError(`Too many attempts. Try again in ${Math.ceil((result.retryAfter || 0) / 60)} minutes.`);
        } else {
          setLoginError(result.error || "Invalid admin key");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Failed to login. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
      setBlogPosts([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.description.trim()) return;
    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newPost),
      });
      const result = await response.json();
      if (result.success) {
        clearDraft(); setHasDraft(false);
        await fetchBlogs();
        setNewPost({ title: "", description: "", thumbnail: "", links: [] });
        setThumbnailPreview("");
        setIsCreating(false);
        setIsPreview(false);
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Failed to create blog post");
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setNewPost({ title: post.title, description: post.description, thumbnail: post.thumbnail || "", links: post.links || [] });
    setThumbnailPreview(post.thumbnail || "");
    setIsEditing(post.id);
    setIsCreating(true);
    setIsPreview(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing || !newPost.title.trim() || !newPost.description.trim()) return;
    try {
      const response = await fetch(`/api/blogs/${isEditing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newPost),
      });
      const result = await response.json();
      if (result.success) {
        clearDraft(); setHasDraft(false);
        await fetchBlogs();
        setNewPost({ title: "", description: "", thumbnail: "", links: [] });
        setThumbnailPreview("");
        setIsCreating(false);
        setIsEditing(null);
        setIsPreview(false);
        alert("Blog post updated successfully!");
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Failed to update blog post");
    }
  };

  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (!draft) return;
    setNewPost(draft.post);
    setThumbnailPreview(draft.post.thumbnail || '');
    setIsEditing(draft.editingId);
    setIsCreating(true);
    setIsPreview(false);
    setHasDraft(false);
  };

  const handleDiscardDraft = () => { clearDraft(); setHasDraft(false); };

  const resetForm = () => {
    setNewPost({ title: "", description: "", thumbnail: "", links: [] });
    setThumbnailPreview("");
    setIsCreating(false);
    setIsEditing(null);
    setIsPreview(false);
  };

  const handleCancelEdit = () => {
    if (isDirty) { setShowDraftModal(true); return; }
    clearDraft();
    resetForm();
  };

  const handleDraftSave = () => {
    saveDraft(newPost, isEditing);
    setShowDraftModal(false);
    resetForm();
    setHasDraft(true);
    if (pendingBackRef.current) { pendingBackRef.current = false; setTimeout(() => window.history.go(-2), 0); }
  };

  const handleDraftDiscard = () => {
    clearDraft();
    setShowDraftModal(false);
    setHasDraft(false);
    resetForm();
    if (pendingBackRef.current) { pendingBackRef.current = false; setTimeout(() => window.history.go(-2), 0); }
  };

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("File must be an image"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB"); return; }
    setIsUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", credentials: "include", body: formData });
      const result = await response.json();
      if (result.success) {
        setNewPost({ ...newPost, thumbnail: result.url });
        setThumbnailPreview(result.url);
      } else {
        alert("Failed to upload thumbnail: " + result.error);
      }
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      alert("Failed to upload thumbnail");
    } finally {
      setIsUploadingThumbnail(false);
      event.target.value = "";
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Delete this blog post?")) return;
    try {
      const response = await fetch(`/api/blogs/${id}`, { method: "DELETE", credentials: "include" });
      const result = await response.json();
      if (result.success) await fetchBlogs();
      else alert("Error: " + result.error);
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog post");
    }
  };

  const fetchCronConfig = async () => {
    try {
      const response = await fetch("/api/admin/cron-test", { credentials: "include" });
      const result = await response.json();
      if (result.success) {
        setCronConfig(result.config);
        if (result.config.cronHour !== undefined) setCronHour(result.config.cronHour);
      }
    } catch (error) {
      console.error("Error fetching cron config:", error);
    }
  };

  const handleCronTest = async () => {
    setIsCronTesting(true);
    setCronResult(null);
    try {
      const response = await fetch("/api/admin/cron-test", { method: "POST", credentials: "include" });
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
        setCronResult({ message: result.result?.error || result.error || "Cron test failed", type: "error" });
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
      if (result.success) setNewsArticles(result.data);
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
        body: JSON.stringify({ count: newsCount, sources: Array.from(newsSources) }),
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
        setNewsResult({ message: result.error || "Failed to generate news", type: "error" });
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
      const response = await fetch(`/api/news/${slug}`, { method: "DELETE", credentials: "include" });
      const result = await response.json();
      if (result.success) await fetchNewsArticles();
      else alert("Error: " + result.error);
    } catch (error) {
      console.error("Error deleting news:", error);
      alert("Failed to delete article");
    }
  };

  const handleEditNews = (article: NewsArticle) => {
    setEditingNews(article);
    setEditNewsForm({
      title: article.title,
      slug: article.slug,
      description: article.description,
      excerpt: article.excerpt,
      thumbnail: article.thumbnail || "",
      source_subreddit: article.source_subreddit,
      source_urls: (article.source_urls || []).join("\n"),
      tags: article.tags.join(", "),
      created_at: new Date(article.created_at).toISOString().slice(0, 16),
    });
    window.scrollTo({ top: document.getElementById("news-edit-form")?.offsetTop || 0, behavior: "smooth" });
  };

  const handleUpdateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    setIsSavingNews(true);
    try {
      const response = await fetch(`/api/news/${editingNews.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: editNewsForm.title,
          slug: editNewsForm.slug,
          description: editNewsForm.description,
          excerpt: editNewsForm.excerpt,
          thumbnail: editNewsForm.thumbnail || null,
          source_subreddit: editNewsForm.source_subreddit,
          source_urls: editNewsForm.source_urls.split("\n").map((u) => u.trim()).filter(Boolean),
          tags: editNewsForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
          created_at: new Date(editNewsForm.created_at).toISOString(),
        }),
      });
      const result = await response.json();
      if (result.success) { setEditingNews(null); await fetchNewsArticles(); }
      else alert("Error: " + result.error);
    } catch (error) {
      console.error("Error updating news:", error);
      alert("Failed to update article");
    } finally {
      setIsSavingNews(false);
    }
  };

  const addLink = () => {
    if (newLink.text && newLink.url) {
      setNewPost({ ...newPost, links: [...(newPost.links || []), newLink] });
      setNewLink({ text: "", url: "" });
    }
  };

  const removeLink = (index: number) => {
    setNewPost({ ...newPost, links: newPost.links?.filter((_, i) => i !== index) || [] });
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
        <CenterNavbar />
        <div className="flex items-center justify-center min-h-screen gap-3">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </main>
    );
  }

  // ── Login ────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
        <CenterNavbar />
        <div className="flex items-center justify-center min-h-screen px-6">
          <div style={{ width: "100%", maxWidth: "340px" }}>
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--tx-3)" }}>
                Admin
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label htmlFor="adminKey" className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>
                  Admin key
                </label>
                <input
                  type="password"
                  id="adminKey"
                  value={adminKey}
                  onChange={(e) => { setAdminKey(e.target.value); setLoginError(""); }}
                  style={{ ...monoInputStyle, padding: "0.625rem 0.75rem" }}
                  placeholder="Enter admin key"
                  required
                />
                {loginError && (
                  <p className="mt-2 text-xs" style={{ color: ERR }}>{loginError}</p>
                )}
              </div>
              <button type="submit" style={{ ...btnPrimary, width: "100%", justifyContent: "center", display: "flex" }}>
                Sign in
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────
  return (
    <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
      <CenterNavbar />

      {showDraftModal && (
        <DraftModal
          onSave={handleDraftSave}
          onDiscard={handleDraftDiscard}
          onKeep={() => setShowDraftModal(false)}
        />
      )}

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

      <div className="mx-auto px-6 pt-24 pb-24" style={{ maxWidth: "720px" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-14">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] mb-1" style={{ color: "var(--tx-3)" }}>Admin</p>
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <button onClick={handleLogout} style={btnSmall}>Sign out</button>
        </div>

        {/* ── BLOG SECTION ──────────────────────────────────────────── */}
        <section className="mb-16">
          <SectionHeader label="Writing" count={blogPosts.length} />

          {hasDraft && !isCreating && (
            <div className="mb-5 px-4 py-3 rounded flex items-center justify-between gap-4"
                 style={{ background: 'oklch(60% 0.11 155 / 0.08)', border: '1px solid oklch(60% 0.11 155 / 0.25)' }}>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--tx-1)' }}>Draft saved</p>
                <p className="text-xs" style={{ color: 'var(--tx-3)' }}>You have an unsaved post from your last session.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={handleRestoreDraft} style={btnSmall}>Restore</button>
                <button onClick={handleDiscardDraft} style={{ ...btnSmall, color: 'var(--tx-3)' }}>Discard</button>
              </div>
            </div>
          )}

          {!isCreating ? (
            <button
              onClick={() => {
                setIsCreating(true);
                setIsEditing(null);
                setNewPost({ title: "", description: "", thumbnail: "", links: [] });
                setThumbnailPreview("");
              }}
              style={{ ...btnPrimary, display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
            >
              + New post
            </button>
          ) : (
            <div>
              {/* Form header */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm" style={{ color: "var(--tx-2)" }}>
                  {isEditing ? "Editing post" : isPreview ? "Preview" : "New post"}
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsPreview(!isPreview)} style={btnSmall}>
                    {isPreview ? "Edit" : "Preview"}
                  </button>
                  <button type="button" onClick={handleCancelEdit}
                          style={{ ...btnSmall, color: "var(--tx-3)", background: "transparent" }}>
                    Cancel
                  </button>
                </div>
              </div>

              {/* IdeaBox */}
              {!isPreview && (
                <div className="mb-5">
                  <IdeaBox
                    onInsertTitle={(title) => setNewPost({ ...newPost, title })}
                    onInsertContent={(content) => {
                      const cur = newPost.description || "";
                      setNewPost({ ...newPost, description: cur ? `${cur}\n\n${content}` : content });
                    }}
                  />
                </div>
              )}

              {isPreview ? (
                /* Preview */
                <div className="rounded" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", padding: "2rem" }}>
                  {newPost.title ? (
                    <>
                      <h1 className="text-2xl font-semibold tracking-tight mb-6">{newPost.title}</h1>
                      {newPost.thumbnail && (
                        <img src={newPost.thumbnail} alt={newPost.title}
                             className="w-full rounded mb-6"
                             style={{ aspectRatio: "16/9", objectFit: "cover", border: "1px solid var(--border-faint)" }} />
                      )}
                      {newPost.description ? (
                        <div ref={previewContentRef} className="article-body"
                             dangerouslySetInnerHTML={{ __html: processEmbedContent(newPost.description) }}
                             suppressHydrationWarning />
                      ) : (
                        <p className="text-sm" style={{ color: "var(--tx-3)" }}>No content yet.</p>
                      )}
                      {newPost.links && newPost.links.length > 0 && (
                        <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border-faint)" }}>
                          <p className="text-xs font-medium uppercase tracking-[0.1em] mb-3" style={{ color: "var(--tx-3)" }}>Links</p>
                          {newPost.links.map((link, i) => (
                            <div key={i} className="mb-2">
                              <a href={link.url} target="_blank" rel="noopener noreferrer"
                                 className="text-sm transition-colors hover:text-[var(--accent-hi)]"
                                 style={{ color: "var(--accent)" }}>
                                {link.text} →
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--tx-3)" }}>Add a title to see preview.</p>
                  )}
                </div>
              ) : (
                /* Edit form */
                <form onSubmit={isEditing ? handleUpdatePost : handleCreatePost} className="space-y-5">
                  <div>
                    <label htmlFor="title" className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Title</label>
                    <input type="text" id="title" value={newPost.title}
                           onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                           style={{ ...inputStyle, padding: "0.5rem 0.75rem" }}
                           placeholder="Post title" required />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>
                      Thumbnail <span style={{ color: "var(--tx-3)" }}>(optional)</span>
                    </label>
                    {thumbnailPreview && (
                      <div className="mb-3">
                        <img src={thumbnailPreview} alt="Preview" className="rounded"
                             style={{ width: "100%", maxWidth: "320px", height: "160px", objectFit: "cover", border: "1px solid var(--border-faint)" }} />
                        <button type="button"
                                onClick={() => { setNewPost({ ...newPost, thumbnail: "" }); setThumbnailPreview(""); }}
                                className="mt-2 block text-xs transition-colors hover:text-[var(--tx-2)]"
                                style={{ color: "var(--tx-3)", background: "none", border: "none", cursor: "pointer" }}>
                          Remove
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowImagePicker(true)} style={btnSmall}>
                        Search Pexels
                      </button>
                      <label style={{ ...btnSmall, display: "inline-block" }}>
                        Upload
                        <input type="file" accept="image/*" onChange={handleThumbnailUpload}
                               disabled={isUploadingThumbnail} className="hidden" />
                      </label>
                    </div>
                    {isUploadingThumbnail && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="loading-dot" />
                        <span className="text-xs" style={{ color: "var(--tx-3)" }}>Uploading...</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Content</label>
                    <RichTextEditor
                      content={newPost.description}
                      onChange={(content) => setNewPost({ ...newPost, description: content })}
                      placeholder="Start writing..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>
                      Related links <span style={{ color: "var(--tx-3)" }}>(optional)</span>
                    </label>
                    <div className="space-y-1.5 mb-2">
                      {newPost.links?.map((link, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 rounded"
                             style={{ background: "var(--bg-hover)", border: "1px solid var(--border-faint)" }}>
                          <span className="flex-1 text-xs truncate" style={{ color: "var(--tx-2)", fontFamily: "var(--font-mono)" }}>
                            {link.text} → {link.url}
                          </span>
                          <button type="button" onClick={() => removeLink(index)}
                                  style={{ background: "none", border: "none", color: "var(--tx-3)", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newLink.text}
                             onChange={(e) => setNewLink({ ...newLink, text: e.target.value })}
                             placeholder="Link text" style={{ ...inputStyle, flex: 1 }} />
                      <input type="url" value={newLink.url}
                             onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                             placeholder="https://..." style={{ ...inputStyle, flex: 1 }} />
                      <button type="button" onClick={addLink} style={btnSmall}>Add</button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="submit" style={btnPrimary}>
                      {isEditing ? "Update post" : "Publish post"}
                    </button>
                    <button type="button" onClick={handleCancelEdit} style={btnSecondary}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Post list */}
          {blogPosts.length === 0 ? (
            <p className="text-sm mt-8 py-6 text-center" style={{ color: "var(--tx-3)" }}>No posts yet.</p>
          ) : (
            <div className="mt-8">
              {blogPosts.map((post, index) => (
                <div key={post.id} className="flex items-start gap-4 py-4"
                     style={{ borderBottom: index < blogPosts.length - 1 ? "1px solid var(--border-faint)" : "none" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-mono text-xs" style={{ color: "var(--tx-3)" }}>
                        {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, ".")}
                      </span>
                      {post.links && post.links.length > 0 && (
                        <span className="font-mono text-xs" style={{ color: "var(--tx-3)" }}>{post.links.length} links</span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate" style={{ color: "var(--tx-1)" }}>{post.title}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => handleEditPost(post)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "var(--accent)", padding: 0 }}
                            className="transition-colors hover:text-[var(--accent-hi)]">
                      Edit
                    </button>
                    <a href={`/blog/${post.id}`} target="_blank" rel="noopener noreferrer"
                       className="text-xs transition-colors hover:text-[var(--tx-2)]"
                       style={{ color: "var(--tx-3)" }}>
                      View
                    </a>
                    <button onClick={() => handleDeletePost(post.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: ERR, padding: 0 }}
                            className="transition-opacity hover:opacity-70">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── NEWS SECTION ──────────────────────────────────────────── */}
        <section className="mb-16">
          <SectionHeader label="News generation" count={newsArticles.length} />

          {/* Generate controls */}
          <div className="mb-6 p-5 rounded" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--tx-2)" }}>Count</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setNewsCount(n)}
                            style={{
                              width: "32px", height: "32px",
                              background: newsCount === n ? "var(--accent)" : "var(--bg-hover)",
                              color: newsCount === n ? "var(--bg)" : "var(--tx-2)",
                              border: `1px solid ${newsCount === n ? "var(--accent)" : "var(--border)"}`,
                              borderRadius: "4px",
                              fontSize: "0.8125rem",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.12s",
                            }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--tx-2)" }}>Sources</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {([
                    { key: "reddit", label: "Reddit" },
                    { key: "hackernews", label: "Hacker News" },
                    { key: "papers", label: "Papers" },
                  ] as const).map(({ key, label }) => (
                    <button key={key} type="button"
                            onClick={() => setNewsSources((prev) => {
                              const next = new Set(prev);
                              if (next.has(key)) next.delete(key); else next.add(key);
                              return next;
                            })}
                            style={{
                              background: newsSources.has(key) ? "var(--accent)" : "var(--bg-hover)",
                              color: newsSources.has(key) ? "var(--bg)" : "var(--tx-2)",
                              border: `1px solid ${newsSources.has(key) ? "var(--accent)" : "var(--border)"}`,
                              borderRadius: "4px",
                              padding: "0.25rem 0.75rem",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              transition: "all 0.12s",
                            }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleGenerateNews} disabled={isGeneratingNews || newsSources.size === 0}
                        style={{
                          ...btnPrimary,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          opacity: isGeneratingNews || newsSources.size === 0 ? 0.5 : 1,
                          cursor: isGeneratingNews || newsSources.size === 0 ? "not-allowed" : "pointer",
                        }}>
                  {isGeneratingNews ? (
                    <><div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" /> Generating</>
                  ) : "Generate"}
                </button>
              </div>

              <p className="text-xs" style={{ color: "var(--tx-3)" }}>
                Fetches trending AI/tech topics, generates articles via AI, publishes to the news section.
              </p>

              {newsResult && <StatusBadge result={newsResult} />}
            </div>
          </div>

          {/* Cron panel */}
          <div className="mb-6 p-5 rounded" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.1em] mb-4" style={{ color: "var(--tx-3)" }}>
                  Scheduled job
                </p>

                {cronConfig && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                    {Object.entries(cronConfig)
                      .filter(([key]) => key !== "schedule" && key !== "cronHour")
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: value ? OK : ERR }} />
                          <span className="font-mono text-xs" style={{ color: "var(--tx-3)" }}>{key}</span>
                        </div>
                      ))}
                  </div>
                )}

                {cronConfig && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded w-fit"
                       style={{ background: "var(--bg-hover)", border: "1px solid var(--border-faint)" }}>
                    <span className="font-mono text-xs" style={{ color: "var(--tx-2)" }}>{cronConfig.schedule}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <p className="text-xs" style={{ color: "var(--tx-3)" }}>Change schedule</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select value={cronHour} onChange={(e) => setCronHour(parseInt(e.target.value, 10))}
                            style={{ ...monoInputStyle, width: "auto", minWidth: "190px", padding: "0.375rem 0.625rem" }}>
                      {Array.from({ length: 24 }, (_, utcH) => {
                        const istH = (utcH + 5) % 24;
                        const period = istH >= 12 ? "PM" : "AM";
                        const display = istH === 0 ? 12 : istH > 12 ? istH - 12 : istH;
                        return <option key={utcH} value={utcH}>{display}:30 {period} IST</option>;
                      })}
                    </select>
                    <button
                      onClick={async () => {
                        setIsSavingSchedule(true);
                        setCronResult(null);
                        try {
                          const res = await fetch("/api/admin/cron-test", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ hour: cronHour }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            const istH = (cronHour + 5) % 24;
                            const p = istH >= 12 ? "PM" : "AM";
                            const d = istH === 0 ? 12 : istH > 12 ? istH - 12 : istH;
                            const newSchedule = `Daily at ${d}:30 ${p} IST (${cronHour}:00 UTC)`;
                            setCronConfig((prev) => prev ? { ...prev, cronHour, schedule: newSchedule } : prev);
                            setCronResult({ message: "Schedule updated", type: "success" });
                          } else {
                            setCronResult({ message: data.error || "Failed to save", type: "error" });
                          }
                        } catch {
                          setCronResult({ message: "Failed to save schedule", type: "error" });
                        }
                        setIsSavingSchedule(false);
                      }}
                      disabled={isSavingSchedule || cronHour === cronConfig?.cronHour}
                      style={{
                        ...btnPrimary,
                        opacity: isSavingSchedule || cronHour === cronConfig?.cronHour ? 0.4 : 1,
                        cursor: isSavingSchedule || cronHour === cronConfig?.cronHour ? "not-allowed" : "pointer",
                        padding: "0.375rem 0.875rem",
                        fontSize: "0.8125rem",
                      }}>
                      {isSavingSchedule ? "Saving..." : "Save"}
                    </button>
                  </div>
                  <p className="font-mono text-xs" style={{ color: "var(--tx-3)" }}>
                    Times fixed at :30 IST (UTC+5:30 offset)
                  </p>
                  {lastCronRun && (
                    <p className="font-mono text-xs" style={{ color: "var(--tx-3)" }}>Last run: {lastCronRun}</p>
                  )}
                </div>
              </div>

              <button onClick={handleCronTest} disabled={isCronTesting}
                      style={{
                        ...btnSecondary,
                        opacity: isCronTesting ? 0.5 : 1,
                        cursor: isCronTesting ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}>
                {isCronTesting ? (
                  <><div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" /> Running</>
                ) : "Run now"}
              </button>
            </div>

            {cronResult && (
              <div className="mt-4">
                <StatusBadge result={cronResult} />
              </div>
            )}
          </div>

          {/* News edit form */}
          {editingNews && (
            <div id="news-edit-form" className="mb-6 p-5 rounded"
                 style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-medium" style={{ color: "var(--tx-1)" }}>Edit article</p>
                <button onClick={() => setEditingNews(null)}
                        style={{ ...btnSmall, color: "var(--tx-3)", background: "transparent" }}>
                  Cancel
                </button>
              </div>
              <form onSubmit={handleUpdateNews} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Title</label>
                    <input type="text" value={editNewsForm.title}
                           onChange={(e) => setEditNewsForm({ ...editNewsForm, title: e.target.value })}
                           required style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Slug</label>
                    <input type="text" value={editNewsForm.slug}
                           onChange={(e) => setEditNewsForm({ ...editNewsForm, slug: e.target.value })}
                           required style={monoInputStyle} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Excerpt</label>
                  <input type="text" value={editNewsForm.excerpt}
                         onChange={(e) => setEditNewsForm({ ...editNewsForm, excerpt: e.target.value })}
                         required style={inputStyle} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Published date</label>
                    <input type="datetime-local" value={editNewsForm.created_at}
                           onChange={(e) => setEditNewsForm({ ...editNewsForm, created_at: e.target.value })}
                           required style={monoInputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Source</label>
                    <input type="text" value={editNewsForm.source_subreddit}
                           onChange={(e) => setEditNewsForm({ ...editNewsForm, source_subreddit: e.target.value })}
                           required style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Thumbnail URL</label>
                  <input type="text" value={editNewsForm.thumbnail}
                         onChange={(e) => setEditNewsForm({ ...editNewsForm, thumbnail: e.target.value })}
                         placeholder="https://..." style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Content (HTML)</label>
                  <textarea value={editNewsForm.description}
                            onChange={(e) => setEditNewsForm({ ...editNewsForm, description: e.target.value })}
                            rows={10} required
                            style={{ ...monoInputStyle, resize: "vertical" }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Source URLs (one per line)</label>
                  <textarea value={editNewsForm.source_urls}
                            onChange={(e) => setEditNewsForm({ ...editNewsForm, source_urls: e.target.value })}
                            rows={3} placeholder="https://reddit.com/..."
                            style={{ ...monoInputStyle, resize: "vertical" }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Tags (comma-separated)</label>
                  <input type="text" value={editNewsForm.tags}
                         onChange={(e) => setEditNewsForm({ ...editNewsForm, tags: e.target.value })}
                         style={inputStyle} />
                </div>
                <button type="submit" disabled={isSavingNews}
                        style={{ ...btnPrimary, opacity: isSavingNews ? 0.5 : 1, cursor: isSavingNews ? "not-allowed" : "pointer" }}>
                  {isSavingNews ? "Saving..." : "Save changes"}
                </button>
              </form>
            </div>
          )}

          {/* News list */}
          {newsArticles.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: "var(--tx-3)" }}>No articles yet.</p>
          ) : (
            <div>
              {newsArticles.map((article, index) => (
                <div key={article.id} className="flex items-start gap-4 py-4"
                     style={{ borderBottom: index < newsArticles.length - 1 ? "1px solid var(--border-faint)" : "none" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs" style={{ color: "var(--tx-3)" }}>
                        {new Date(article.created_at).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, ".")}
                      </span>
                      <span className="font-mono text-xs" style={{ color: "var(--tx-3)" }}>
                        {article.source_subreddit === "arXiv" ? "arXiv" : article.source_subreddit === "HackerNews" ? "HN" : `r/${article.source_subreddit}`}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate" style={{ color: "var(--tx-1)" }}>{article.title}</p>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="font-mono text-xs px-1.5 py-0.5 rounded"
                                style={{ background: "var(--bg-hover)", color: "var(--tx-3)", border: "1px solid var(--border-faint)" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => handleEditNews(article)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "var(--accent)", padding: 0 }}
                            className="transition-colors hover:text-[var(--accent-hi)]">
                      Edit
                    </button>
                    <a href={`/news/${article.slug}`} target="_blank" rel="noopener noreferrer"
                       className="text-xs transition-colors hover:text-[var(--tx-2)]"
                       style={{ color: "var(--tx-3)" }}>
                      View
                    </a>
                    <button onClick={() => handleDeleteNews(article.slug)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: ERR, padding: 0 }}
                            className="transition-opacity hover:opacity-70">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer nav */}
        <div className="flex gap-6 pt-8" style={{ borderTop: "1px solid var(--border-faint)" }}>
          <Link href="/blog" className="text-sm transition-colors hover:text-[var(--accent)]" style={{ color: "var(--tx-3)" }}>
            /blog →
          </Link>
          <Link href="/news" className="text-sm transition-colors hover:text-[var(--accent)]" style={{ color: "var(--tx-3)" }}>
            /news →
          </Link>
        </div>

      </div>
    </main>
  );
}
