"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

const socials = [
  {
    platform: "GitHub",
    handle: "Suv00m",
    description: "Code, open-source contributions, and project repos.",
    url: "https://github.com/Suv00m",
  },
  {
    platform: "LinkedIn",
    handle: "shuvam1",
    description: "Professional profile and career updates.",
    url: "https://www.linkedin.com/in/shuvam1/",
  },
  {
    platform: "X (Twitter)",
    handle: "@shuvx_",
    description: "Quick thoughts and tech updates.",
    url: "https://x.com/shuvx_",
  },
  {
    platform: "Kaggle",
    handle: "shuvammandal121",
    description: "2x Kaggle Expert. ML competitions and datasets.",
    url: "https://kaggle.com/shuvammandal121",
  },
  {
    platform: "Hugging Face",
    handle: "shuvom",
    description: "AI models and research contributions.",
    url: "https://huggingface.co/shuvom",
  },
];

export default function Socials() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
      <Navbar />

      <div className="mx-auto px-6 pt-32 pb-24" style={{ maxWidth: "680px" }}>
        <header className="mb-12">
          <h1 className="text-xl font-semibold tracking-tight mb-2">Elsewhere</h1>
          <p className="text-sm" style={{ color: "var(--tx-2)" }}>
            Where to find me online.
          </p>
        </header>

        <div>
          {socials.map((s, i) => (
            <a
              key={s.platform}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 py-5"
              style={{
                borderBottom:
                  i < socials.length - 1 ? "1px solid var(--border-faint)" : "none",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors duration-150"
                    style={{ color: "var(--tx-1)" }}
                  >
                    {s.platform}
                  </span>
                  <span className="font-mono text-xs" style={{ color: "var(--tx-3)" }}>
                    {s.handle}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--tx-3)" }}>
                  {s.description}
                </p>
              </div>
              <span
                className="text-xs pt-0.5 shrink-0 transition-colors group-hover:text-[var(--accent)]"
                style={{ color: "var(--tx-3)" }}
              >
                →
              </span>
            </a>
          ))}
        </div>

        {/* Email */}
        <section
          className="mt-8 pt-6"
          style={{ borderTop: "1px solid var(--border-faint)" }}
        >
          <p
            className="text-xs font-medium uppercase mb-3"
            style={{ color: "var(--tx-3)", letterSpacing: "0.1em" }}
          >
            Email
          </p>
          <a
            href="mailto:shuvammandal121@gmail.com"
            className="text-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--tx-2)" }}
          >
            shuvammandal121@gmail.com
          </a>
        </section>

        <div className="mt-12 pt-6" style={{ borderTop: "1px solid var(--border-faint)" }}>
          <Link
            href="/"
            className="text-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--tx-3)" }}
          >
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
