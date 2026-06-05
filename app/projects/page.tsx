"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

const projects = [
  {
    title: "dotresume.org",
    description: "AI-powered resume builder. Drop in your details, get a polished ATS-friendly PDF out.",
    url: "https://dotresume.org",
    tags: ["Next.js", "AI"],
    year: "2026",
    status: "Live",
  },
  {
    title: "Search",
    description: "grep like search tool built in Rust. Fast pattern matching over files.",
    github: "https://github.com/Suv00m/search",
    tags: ["Rust"],
    year: "2026",
    status: "Open source",
  },
  {
    title: "yuj-v1",
    description: "MoE 7B Hindi text generation model. 3.5k+ monthly downloads on HuggingFace.",
    url: "https://huggingface.co/shuvom/yuj-v1",
    tags: ["PyTorch", "MoE", "HuggingFace", "Hindi NLP"],
    year: "2025",
    status: "Open weights",
  },
  {
    title: "Kinship Verification",
    description: "Deep learning model for verifying family relationships from face pairs. Trained on kinship datasets with contrastive loss.",
    tags: ["Python", "PyTorch", "Computer Vision"],
    year: "2025",
    status: "Research",
  },
  {
    title: "behooked.co",
    description: "AI-powered content automation platform. Video generation, caption styling, and multi-platform publishing.",
    url: "https://behooked.co",
    tags: ["Next.js", "Python", "FastAPI", "Supabase"],
    year: "2024",
    status: "Live",
  },
  {
    title: "AI News Pipeline",
    description: "Automated news aggregation scraping Reddit, Hacker News, and arXiv — generates editorial-quality articles via LLM.",
    tags: ["Next.js", "OpenRouter", "Supabase"],
    year: "2024",
    status: "Running",
  },
];

export default function Projects() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
      <Navbar />

      <div className="mx-auto px-6 pt-32 pb-24" style={{ maxWidth: "680px" }}>
        <header className="mb-12">
          <h1 className="text-xl font-semibold tracking-tight mb-2">Projects</h1>
          <p className="text-sm" style={{ color: "var(--tx-2)" }}>
            Things I have shipped.
          </p>
        </header>

        <div>
          {projects.map((p, i) => (
            <article
              key={p.title}
              className="py-6"
              style={{
                borderBottom: i < projects.length - 1 ? "1px solid var(--border-faint)" : "none",
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="text-sm font-semibold" style={{ color: "var(--tx-1)" }}>
                  {p.title}
                </h2>
                <span
                  className="font-mono text-xs shrink-0 pt-0.5"
                  style={{ color: "var(--tx-3)" }}
                >
                  {p.year}
                </span>
              </div>

              <p className="text-sm mb-3" style={{ color: "var(--tx-2)" }}>
                {p.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-xs px-2 py-0.5 rounded"
                      style={{
                        background: "var(--bg-subtle)",
                        color: "var(--tx-3)",
                        border: "1px solid var(--border-faint)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs transition-colors duration-150 hover:text-[var(--accent)]"
                      style={{ color: "var(--tx-2)" }}
                    >
                      Visit →
                    </a>
                  )}
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs transition-colors duration-150 hover:text-[var(--accent)]"
                      style={{ color: "var(--tx-2)" }}
                    >
                      GitHub →
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 pt-6" style={{ borderTop: "1px solid var(--border-faint)" }}>
          <Link
            href="/"
            className="text-sm transition-colors duration-150 hover:text-[var(--accent)]"
            style={{ color: "var(--tx-3)" }}
          >
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
