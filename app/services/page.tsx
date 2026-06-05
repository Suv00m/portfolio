"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

const services = [
  {
    title: "Full-stack development",
    description:
      "End-to-end web applications: landing pages to production SaaS. Next.js, React, Node.js, Python backends. I ship fast and build things that hold up.",
    tags: ["Next.js", "React", "TypeScript", "Python", "Node.js"],
  },
  {
    title: "ML and data science",
    description:
      "Predictive models, LLM integrations, data pipelines. 2x Kaggle Expert. I work on problems where the data is messy and the goal is real.",
    tags: ["Python", "TensorFlow", "PyTorch", "LLMs", "Data Pipelines"],
  },
  {
    title: "Product strategy",
    description:
      "Helping early-stage products find their path. I focus on what actually moves the needle: user clarity, fast iteration, and shipping things people use.",
    tags: ["MVP", "Growth", "UX", "Analytics"],
  },
];

export default function Services() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
      <Navbar />

      <div className="mx-auto px-6 pt-32 pb-24" style={{ maxWidth: "680px" }}>
        <header className="mb-12">
          <h1 className="text-xl font-semibold tracking-tight mb-2">Services</h1>
          <p className="text-sm" style={{ color: "var(--tx-2)" }}>
            What I do for clients and collaborators.
          </p>
        </header>

        <div>
          {services.map((s, i) => (
            <section
              key={s.title}
              className="py-8"
              style={{
                borderBottom:
                  i < services.length - 1 ? "1px solid var(--border-faint)" : "none",
              }}
            >
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--tx-1)" }}>
                {s.title}
              </h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--tx-2)" }}>
                {s.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {s.tags.map((t) => (
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
            </section>
          ))}
        </div>

        {/* CTA */}
        <section
          className="mt-12 pt-8"
          style={{ borderTop: "1px solid var(--border-faint)" }}
        >
          <p className="text-sm mb-4" style={{ color: "var(--tx-2)" }}>
            Have something in mind?
          </p>
          <Link
            href="/contact"
            className="text-sm transition-colors hover:text-[var(--accent-hi)]"
            style={{ color: "var(--accent)" }}
          >
            Schedule a call →
          </Link>
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
