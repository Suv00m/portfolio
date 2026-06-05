"use client";

import { useState, useEffect } from "react";
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
    title: "Search",
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
  { label: "GitHub",   url: "https://github.com/Suv00m" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/shuvam1/" },
  { label: "Twitter",  url: "https://x.com/shuvx_" },
  { label: "Kaggle",   url: "https://kaggle.com/shuvammandal121" },
];

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
            I build software and AI products. Growing{" "}
            <a
              href="https://behooked.co"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-150"
              style={{ color: "var(--accent)" }}
            >
              behooked.co
            </a>{" "}
            from $0 to $1k MRR in 3 months. 2x Kaggle Expert.
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
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors duration-150 hover:text-[var(--accent)]"
                style={{ color: "var(--tx-2)" }}
              >
                {s.label}
              </a>
            ))}
            <a
              href="mailto:shuvammandal131@gmail.com"
              className="text-sm transition-colors duration-150 hover:text-[var(--accent)]"
              style={{ color: "var(--tx-2)" }}
            >
              Email
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
