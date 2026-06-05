"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SearchResult {
  type: "blog" | "news";
  title: string;
  href: string;
  date: string;
}

const NAV_ITEMS = [
  { label: "Home", href: "/", description: "Back to base" },
  { label: "Services", href: "/services", description: "What I build" },
  { label: "Projects", href: "/projects", description: "Case studies" },
  { label: "Blog", href: "/blog", description: "Thoughts & code" },
  { label: "News", href: "/news", description: "AI & tech updates" },
  { label: "Socials", href: "/socials", description: "Find me online" },
  { label: "Contact", href: "/contact", description: "Let's talk" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Search
  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) setResults(data.results);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  // Filter nav items by query
  const filteredNav = query
    ? NAV_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      )
    : NAV_ITEMS;

  const allItems = [
    ...filteredNav.map((n) => ({ ...n, type: "nav" as const })),
    ...results.map((r) => ({ ...r, label: r.title, description: r.type })),
  ];

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && allItems[selectedIndex]) {
      const item = allItems[selectedIndex];
      window.location.href = item.href;
      setOpen(false);
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Dialog */}
      <div className="relative flex justify-center pt-[20vh]">
        <div
          className="w-full max-w-xl mx-4 bg-white border-3 border-[#0a0a0a] shadow-brutal-lg overflow-hidden"
          style={{ borderWidth: 3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b-3 border-[#0a0a0a]" style={{ borderBottomWidth: 3 }}>
            <svg className="w-5 h-5 text-[#737373] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search posts, pages..."
              className="flex-1 font-sans text-base outline-none placeholder-[#a3a3a3]"
            />
            <kbd className="hidden md:inline-block font-mono text-xs text-[#737373] border-2 border-[#e5e5e5] px-1.5 py-0.5">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {/* Navigation section */}
            {filteredNav.length > 0 && (
              <div>
                <div className="px-5 py-2 font-mono text-xs text-[#737373] uppercase tracking-wider bg-[#f5f5f5]">
                  Pages
                </div>
                {filteredNav.map((item, i) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-5 py-3 transition-colors duration-100 ${
                      selectedIndex === i
                        ? "bg-[#0a0a0a] text-white"
                        : "hover:bg-[#f5f5f5]"
                    }`}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <div>
                      <span className="font-display font-bold text-sm uppercase tracking-wide">
                        {item.label}
                      </span>
                      <span className={`ml-3 font-mono text-xs ${selectedIndex === i ? "text-[#a3a3a3]" : "text-[#737373]"}`}>
                        {item.description}
                      </span>
                    </div>
                    <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="square" strokeLinejoin="miter" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            )}

            {/* Search results */}
            {loading && (
              <div className="px-5 py-4 text-center">
                <span className="font-mono text-sm text-[#737373]">Searching...</span>
              </div>
            )}

            {results.length > 0 && (
              <div>
                <div className="px-5 py-2 font-mono text-xs text-[#737373] uppercase tracking-wider bg-[#f5f5f5]">
                  Posts
                </div>
                {results.map((result, i) => {
                  const idx = filteredNav.length + i;
                  return (
                    <a
                      key={result.href}
                      href={result.href}
                      className={`flex items-center justify-between px-5 py-3 transition-colors duration-100 ${
                        selectedIndex === idx
                          ? "bg-[#0a0a0a] text-white"
                          : "hover:bg-[#f5f5f5]"
                      }`}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div className="min-w-0">
                        <span className="font-display font-bold text-sm truncate block">
                          {result.title}
                        </span>
                      </div>
                      <span
                        className={`ml-3 flex-shrink-0 font-mono text-xs uppercase ${
                          selectedIndex === idx ? "text-[#ff3d00]" : "text-[#737373]"
                        }`}
                      >
                        {result.type}
                      </span>
                    </a>
                  );
                })}
              </div>
            )}

            {query.length >= 2 && !loading && results.length === 0 && filteredNav.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="font-display font-bold text-[#737373]">No results found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 bg-[#f5f5f5] border-t-3 border-[#0a0a0a] flex items-center gap-4" style={{ borderTopWidth: 3 }}>
            <span className="font-mono text-xs text-[#737373]">
              <kbd className="border-2 border-[#e5e5e5] px-1 py-0.5 mr-1">↑↓</kbd> navigate
            </span>
            <span className="font-mono text-xs text-[#737373]">
              <kbd className="border-2 border-[#e5e5e5] px-1 py-0.5 mr-1">↵</kbd> open
            </span>
            <span className="font-mono text-xs text-[#737373]">
              <kbd className="border-2 border-[#e5e5e5] px-1 py-0.5 mr-1">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
