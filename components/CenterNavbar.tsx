"use client";

import { useState } from "react";

const navItems = [
  { label: "Home",     href: "/",         description: "Back to base" },
  { label: "Services", href: "/services", description: "What I build" },
  { label: "Projects", href: "/projects", description: "Case studies" },
  { label: "Blog",     href: "/blog",     description: "Thoughts & code" },
  { label: "News",     href: "/news",     description: "AI & tech updates" },
  { label: "Socials",  href: "/socials",  description: "Find me online" },
  { label: "Contact",  href: "/contact",  description: "Let's talk" },
];

export default function CenterNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      <nav className="fixed right-4 top-4 z-50 md:right-6 md:top-6">
        {/* Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            cursor: "pointer",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="flex flex-col justify-between" style={{ width: "16px", height: "12px" }}>
            <span style={{
              display: "block", height: "1.5px", width: "100%",
              background: "var(--tx-2)",
              transition: "transform 0.2s, opacity 0.2s",
              transform: isOpen ? "translateY(5.25px) rotate(45deg)" : "none",
            }} />
            <span style={{
              display: "block", height: "1.5px", width: "100%",
              background: "var(--tx-2)",
              transition: "opacity 0.2s",
              opacity: isOpen ? 0 : 1,
            }} />
            <span style={{
              display: "block", height: "1.5px", width: "100%",
              background: "var(--tx-2)",
              transition: "transform 0.2s, opacity 0.2s",
              transform: isOpen ? "translateY(-5.25px) rotate(-45deg)" : "none",
            }} />
          </div>
        </button>

        {/* Dropdown */}
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: 0,
            width: "220px",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            overflow: "hidden",
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? "auto" : "none",
            transform: isOpen ? "translateY(0)" : "translateY(-8px)",
            transition: "opacity 0.18s ease, transform 0.18s ease",
          }}
        >
          <div style={{ padding: "0.5rem" }}>
            {navItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => setHovered(item.label)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "5px",
                  background: hovered === item.label ? "var(--bg-hover)" : "transparent",
                  textDecoration: "none",
                  transition: "background 0.12s",
                  transitionDelay: isOpen ? `${index * 25}ms` : "0ms",
                }}
              >
                <div>
                  <span style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: hovered === item.label ? "var(--tx-1)" : "var(--tx-2)",
                    transition: "color 0.12s",
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    display: "block",
                    fontSize: "0.6875rem",
                    fontFamily: "var(--font-mono)",
                    color: "var(--tx-3)",
                    marginTop: "1px",
                  }}>
                    {item.description}
                  </span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     style={{ color: hovered === item.label ? "var(--tx-2)" : "var(--tx-3)", flexShrink: 0, transition: "color 0.12s, transform 0.12s", transform: hovered === item.label ? "translateX(2px)" : "none" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>

          <div style={{
            borderTop: "1px solid var(--border-faint)",
            padding: "0.5rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--tx-3)" }}>
              {new Date().getFullYear()}
            </span>
            <div className="flex items-center gap-1.5">
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "oklch(62% 0.15 145)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--tx-3)" }}>Live</span>
            </div>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
