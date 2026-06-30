"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { BlogPost } from "@/lib/types";

const projects = [
  {
    title: "dotresume.org",
    desc: "Job companion. Helps you find jobs at every point of your life.",
    url: "https://dotresume.org",
    year: "2026",
  },
  {
    title: "srch",
    desc: "grep like search tool in Rust.",
    github: "https://github.com/Suv00m/search",
    year: "2026",
  },
  {
    title: "yuj-v1",
    desc: "MoE 7B Hindi text generation model. 3.5k+ monthly downloads.",
    url: "https://huggingface.co/shuvom/yuj-v1",
    year: "2025",
  },
  {
    title: "behooked.co",
    desc: "AI content automation. $0 to $1k MRR in 3 months.",
    url: "https://behooked.co",
    year: "2024",
  },
];

const socials = [
  { label: "GitHub",   url: "https://github.com/Suv00m",                    copy: "https://github.com/Suv00m" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/shuvam1/",         copy: "https://www.linkedin.com/in/shuvam1/" },
  { label: "Twitter",  url: "https://x.com/shuvx_",                        copy: "https://x.com/shuvx_" },
  { label: "Kaggle",      url: "https://kaggle.com/shuvammandal121",          copy: "https://kaggle.com/shuvammandal121" },
  { label: "HuggingFace", url: "https://huggingface.co/shuvom",             copy: "https://huggingface.co/shuvom" },
  { label: "Email",       url: "https://mail.google.com/mail/?view=cm&to=shuvammandal121@gmail.com", copy: "shuvammandal121@gmail.com" },
];

const SHOWCASE_VIDEOS = [
  {
    label: "Agent Demo",
    src: "https://media.behooked.co/transform/behooked_assets/explore/agent-showcase/agent-demo.webm?op=transcode&w=480&q=60",
    poster: "https://media.behooked.co/transform/behooked_assets/explore/agent-showcase/agent-demo.webm?op=thumbnail_at&t=00%3A00%3A03&format=webp",
  },
  {
    label: "FAL Agent",
    src: "https://media.behooked.co/transform/behooked_assets/explore/agent-showcase/agent-fal.webm?op=transcode&w=480&q=60",
    poster: "https://media.behooked.co/transform/behooked_assets/explore/agent-showcase/agent-fal.webm?op=thumbnail_at&t=00%3A00%3A03&format=webp",
  },
];

function VideoHover({ children }: { children: React.ReactNode }) {
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setAnchor({ top: r.bottom + 10, left: r.left });
    }, 60);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setAnchor(null);
  };

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={hide}
        style={{
          borderBottom: "1px dotted var(--tx-3)",
          cursor: "default",
          transition: "color 0.12s ease-out",
        }}
        className="hover:text-[var(--tx-1)]"
      >
        {children}
      </span>
      {anchor && (
        <div
          style={{
            position: "fixed",
            top: anchor.top,
            left: anchor.left,
            zIndex: 200,
            display: "flex",
            gap: "8px",
            padding: "8px",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow: "0 20px 56px oklch(0% 0 0 / 0.55)",
            pointerEvents: "none",
          }}
        >
          {SHOWCASE_VIDEOS.map((v) => (
            <div key={v.label}>
              <video
                src={v.src}
                poster={v.poster}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: "116px",
                  display: "block",
                  borderRadius: "4px",
                  aspectRatio: "9/16",
                  objectFit: "cover",
                  background: "var(--bg)",
                }}
              />
              <p style={{ fontSize: "10px", color: "var(--tx-3)", marginTop: "5px", textAlign: "center" }}>
                {v.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function TextHover({ children, note }: { children: React.ReactNode; note: string }) {
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setAnchor({ top: r.bottom + 10, left: r.left });
    }, 60);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setAnchor(null);
  };

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={hide}
        style={{ borderBottom: "1px dotted var(--tx-3)", cursor: "default", transition: "color 0.12s ease-out" }}
        className="hover:text-[var(--tx-1)]"
      >
        {children}
      </span>
      {anchor && (
        <div style={{
          position: "fixed",
          top: anchor.top,
          left: anchor.left,
          zIndex: 200,
          maxWidth: "256px",
          padding: "8px 12px",
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          boxShadow: "0 12px 40px oklch(0% 0 0 / 0.45)",
          pointerEvents: "none",
        }}>
          <p style={{ fontSize: "11px", lineHeight: "1.6", color: "var(--tx-2)", margin: 0 }}>{note}</p>
        </div>
      )}
    </>
  );
}

function SocialLink({ label, url, copy }: { label: string; url: string; copy: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleOpen = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copy);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1200);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="text-sm transition-colors duration-150 hover:text-[var(--accent)]"
        style={{ color: open ? "var(--accent)" : "var(--tx-2)", background: "none", border: "none", cursor: "pointer", padding: "3px 0" }}
      >
        {label}
      </button>

      {/* Always rendered — opacity/transform transition handles enter + exit */}
      <div
        role="menu"
        aria-label={`${label} links`}
        style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: open
            ? "translateX(-50%) translateY(0) scale(1)"
            : "translateX(-50%) translateY(4px) scale(0.97)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          padding: "4px",
          zIndex: 50,
          minWidth: "96px",
          boxShadow: "0 8px 24px oklch(0% 0 0 / 0.4)",
          transition: "opacity 0.14s ease-out, transform 0.14s ease-out",
        }}
      >
        <button
          onClick={handleOpen}
          role="menuitem"
          tabIndex={open ? 0 : -1}
          className="block w-full text-left text-xs rounded-sm transition-colors duration-150 hover:text-[var(--tx-1)] hover:bg-[var(--bg-hover)]"
          style={{ padding: "5px 10px", color: "var(--tx-2)", background: "none", border: "none", cursor: "pointer" }}
        >
          Open ↗
        </button>
        <button
          onClick={handleCopy}
          role="menuitem"
          tabIndex={open ? 0 : -1}
          className="block w-full text-left text-xs rounded-sm transition-colors duration-150 hover:text-[var(--tx-1)] hover:bg-[var(--bg-hover)]"
          style={{ padding: "5px 10px", color: copied ? "var(--accent)" : "var(--tx-2)", background: "none", border: "none", cursor: "pointer" }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/api/blogs")
      .then((r) => r.json())
      .then((d) => d.success && setPosts(d.data.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
      <Navbar />

      <div className="mx-auto px-6 pt-32 pb-24" style={{ maxWidth: "680px" }}>
        {/* Intro */}
        <section className="mb-16">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            Shuvam Mandal
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--tx-2)" }}>
            Engineer. Builder.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--tx-2)", maxWidth: "52ch" }}>
            I build software and AI products. Currently building{" "}
            <TextHover note="Job companion. Helps you find jobs at every point of your life.">dotresume.org</TextHover>
            {" "}and{" "}
            <TextHover note="grep-like search tool in Rust. Fast pattern matching over files.">srch</TextHover>.
            Ex-CTO at{" "}
            <a
              href="https://behooked.co"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-150 hover:text-[var(--accent)]"
              style={{ color: "inherit" }}
            >
              behooked.co
            </a>
            {" "} — built the multimodal transcoding pipeline handling{" "}
            <TextHover note="Handles video transcoding, thumbnail generation, and format conversion at scale. Custom pipeline infrastructure built for behooked.co.">100k+ media files</TextHover>,
            and an AI agent orchestrator that generated{" "}
            <VideoHover>1.5k+ videos</VideoHover>,
            out-competing{" "}
            <TextHover note="Leading AI video platforms backed by VC. The agent system matched and exceeded their output quality.">HeyGen and Caption</TextHover>.
            Also built yuj, a Hindi LLM with{" "}
            <TextHover note="yuj-v1: MoE 7B model fine-tuned for Hindi text generation, published on HuggingFace.">3.5k+ monthly downloads</TextHover>.{" "}
            <TextHover note="Expert rank in both Notebooks and Datasets on Kaggle — top ~1% on the platform.">2x Kaggle Expert</TextHover>.
            Based in India.
          </p>
        </section>

        {/* Work */}
        <section className="mb-16">
          <p
            className="text-xs font-medium uppercase mb-4"
            style={{ color: "var(--tx-3)", letterSpacing: "0.1em" }}
          >
            Work
          </p>
          <div>
            {projects.map((p) => (
              <a
                key={p.title}
                href={(p as { url?: string; github?: string }).url || (p as { url?: string; github?: string }).github || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline gap-3 py-3"
                style={{ borderBottom: "1px solid var(--border-faint)" }}
              >
                <span
                  className="font-mono text-xs shrink-0 w-10"
                  style={{ color: "var(--tx-3)" }}
                >
                  {p.year}
                </span>
                <span className="flex-1 min-w-0 flex flex-wrap items-baseline gap-x-2">
                  <span
                    className="text-sm group-hover:text-[var(--accent)] transition-colors duration-150"
                    style={{ color: "var(--tx-1)" }}
                  >
                    {p.title}
                  </span>
                  <span className="text-sm" style={{ color: "var(--tx-3)" }}>
                    {p.desc}
                  </span>
                </span>
              </a>
            ))}
          </div>
          <Link
            href="/projects"
            className="inline-block mt-5 text-xs transition-colors duration-150 hover:text-[var(--accent)]"
            style={{ color: "var(--tx-3)" }}
          >
            All projects →
          </Link>
        </section>

        {/* Writing */}
        <section className="mb-16">
          <p
            className="text-xs font-medium uppercase mb-4"
            style={{ color: "var(--tx-3)", letterSpacing: "0.1em" }}
          >
            Writing
          </p>
          {posts.length > 0 ? (
            <div>
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group flex items-baseline gap-3 py-3"
                  style={{ borderBottom: "1px solid var(--border-faint)" }}
                >
                  <span
                    className="font-mono text-xs shrink-0"
                    style={{ color: "var(--tx-3)", minWidth: "5.5rem" }}
                  >
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span
                    className="text-sm group-hover:text-[var(--accent)] transition-colors duration-150"
                    style={{ color: "var(--tx-1)" }}
                  >
                    {post.title}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--tx-3)" }}>—</p>
          )}
          <Link
            href="/blog"
            className="inline-block mt-5 text-xs transition-colors duration-150 hover:text-[var(--accent)]"
            style={{ color: "var(--tx-3)" }}
          >
            All posts →
          </Link>
        </section>

        {/* Elsewhere */}
        <section>
          <p
            className="text-xs font-medium uppercase mb-4"
            style={{ color: "var(--tx-3)", letterSpacing: "0.1em" }}
          >
            Elsewhere
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((s) => (
              <SocialLink key={s.label} label={s.label} url={s.url} copy={s.copy} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
