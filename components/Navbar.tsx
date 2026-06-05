"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/blog",     label: "Writing"  },
  { href: "/projects", label: "Projects" },
  { href: "/news",     label: "News"     },
  { href: "/contact",  label: "Contact"  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50"
        style={{
          background: scrolled
            ? "color-mix(in oklch, var(--bg) 85%, transparent)"
            : "var(--bg)",
          borderBottom: scrolled ? "1px solid var(--border-faint)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "background 0.2s, border-color 0.2s, backdrop-filter 0.2s",
        }}
      >
        <div
          className="mx-auto flex h-14 items-center justify-between px-6"
          style={{ maxWidth: "720px" }}
        >
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight transition-colors duration-150"
            style={{ color: pathname === "/" ? "var(--tx-1)" : "var(--tx-2)" }}
          >
            Shuvam Mandal
          </Link>

          {/* Desktop */}
          <nav className="hidden sm:flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm transition-colors duration-150"
                style={{ color: isActive(l.href) ? "var(--tx-1)" : "var(--tx-2)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--tx-1)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = isActive(l.href)
                    ? "var(--tx-1)"
                    : "var(--tx-2)")
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className="sm:hidden p-2 -mr-2 rounded transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            style={{ color: "var(--tx-2)" }}
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 sm:hidden"
          style={{ background: "oklch(0% 0 0 / 0.5)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile dropdown */}
      {open && (
        <div
          className="fixed z-40 sm:hidden"
          style={{
            top: "60px",
            left: "1rem",
            right: "1rem",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 16px 40px oklch(0% 0 0 / 0.6)",
          }}
        >
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-5 py-4 text-sm transition-colors"
              style={{
                color: isActive(l.href) ? "var(--tx-1)" : "var(--tx-2)",
                borderBottom: i < links.length - 1 ? "1px solid var(--border-faint)" : "none",
                fontWeight: isActive(l.href) ? "500" : "400",
              }}
            >
              {l.label}
              {isActive(l.href) && (
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
