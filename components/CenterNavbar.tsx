"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  description?: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", description: "Back to base" },
  { label: "Services", href: "/services", description: "What I build" },
  { label: "Blog", href: "/blog", description: "Thoughts & code" },
  { label: "Socials", href: "/socials", description: "Find me online" },
  { label: "Contact", href: "/contact", description: "Let's talk" },
];

export default function CenterNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <>
      {/* Navbar Container */}
      <nav className="fixed right-4 top-4 z-50 md:right-8 md:top-8">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group relative flex h-14 w-14 items-center justify-center border-3 border-[#0a0a0a] bg-white transition-all duration-200",
            isOpen
              ? "shadow-brutal-accent"
              : "shadow-brutal-sm hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1"
          )}
          style={{ borderWidth: '3px' }}
          aria-label="Toggle navigation menu"
        >
          {/* Hamburger Icon */}
          <div className="flex h-5 w-5 flex-col justify-between">
            <span
              className={cn(
                "h-[3px] w-full bg-[#0a0a0a] transition-all duration-200",
                isOpen && "translate-y-[9px] rotate-45 bg-[#ff3d00]"
              )}
            />
            <span
              className={cn(
                "h-[3px] w-full bg-[#0a0a0a] transition-all duration-200",
                isOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "h-[3px] w-full bg-[#0a0a0a] transition-all duration-200",
                isOpen && "-translate-y-[9px] -rotate-45 bg-[#ff3d00]"
              )}
            />
          </div>
        </button>

        {/* Navigation Menu */}
        <div
          className={cn(
            "absolute right-0 top-0 overflow-hidden border-3 border-[#0a0a0a] bg-white transition-all duration-300 ease-out",
            isOpen
              ? "w-72 opacity-100 translate-x-0 translate-y-0 shadow-brutal-lg"
              : "w-14 opacity-0 translate-x-2 -translate-y-2 pointer-events-none"
          )}
          style={{ borderWidth: '3px' }}
        >
          {/* Header */}
          <div className="border-b-3 border-[#0a0a0a] p-5 bg-[#0a0a0a]" style={{ borderBottomWidth: '3px' }}>
            <h3 className="font-display text-lg font-black tracking-tight text-white uppercase">
              Navigate
            </h3>
          </div>

          {/* Navigation Items */}
          <div className="p-2">
            {navItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "group relative flex w-full items-center justify-between p-4 text-left transition-all duration-200",
                  "hover:bg-[#f5f5f5]",
                  "focus:outline-none focus:bg-[#f5f5f5]"
                )}
                style={{
                  transitionDelay: isOpen ? `${index * 40}ms` : "0ms",
                }}
              >
                {/* Content */}
                <div className="flex flex-col">
                  <span className={cn(
                    "font-display text-base font-bold uppercase tracking-wide transition-all duration-200",
                    hoveredItem === item.label
                      ? "text-[#ff3d00]"
                      : "text-[#0a0a0a]"
                  )}>
                    {item.label}
                  </span>
                  {item.description && (
                    <span className={cn(
                      "font-mono text-xs transition-all duration-200 mt-0.5",
                      hoveredItem === item.label
                        ? "text-[#0a0a0a]"
                        : "text-[#737373]"
                    )}>
                      {item.description}
                    </span>
                  )}
                </div>

                {/* Arrow Icon */}
                <svg
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    hoveredItem === item.label
                      ? "translate-x-1 text-[#ff3d00]"
                      : "text-[#a3a3a3]"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M9 5l7 7-7 7"
                  />
                </svg>

                {/* Hover Indicator Bar */}
                <div
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#ff3d00] transition-all duration-200",
                    hoveredItem === item.label
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t-3 border-[#0a0a0a] p-4 bg-[#f5f5f5]" style={{ borderTopWidth: '3px' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#737373] uppercase tracking-wider">2025</span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-3 w-3 bg-[#22c55e] border-2 border-[#0a0a0a]" />
                </div>
                <span className="font-mono text-xs font-bold text-[#0a0a0a] uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-white/80"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
