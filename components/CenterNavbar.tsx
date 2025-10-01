"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  description?: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", description: "Back to home" },
  { label: "About", href: "#about", description: "Learn more about me" },
  { label: "Blog", href: "/blog", description: "Read my blog" },
  { label: "Contact", href: "/contact", description: "Schedule a call" },
];

export default function CenterNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <>
      {/* Navbar Container */}
      <nav className="fixed right-8 top-1/2 z-50 -translate-y-1/2">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group relative flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-gray-400 hover:shadow-lg",
            isOpen && "border-gray-400 shadow-lg"
          )}
          aria-label="Toggle navigation menu"
        >
          {/* Hamburger Icon */}
          <div className="flex h-4 w-4 flex-col justify-between">
            <span
              className={cn(
                "h-0.5 w-full bg-gray-700 transition-all duration-300",
                isOpen ? "translate-y-1.5 rotate-45" : ""
              )}
            />
            <span
              className={cn(
                "h-0.5 w-full bg-gray-700 transition-all duration-300",
                isOpen ? "opacity-0" : ""
              )}
            />
            <span
              className={cn(
                "h-0.5 w-full bg-gray-700 transition-all duration-300",
                isOpen ? "-translate-y-1.5 -rotate-45" : ""
              )}
            />
          </div>
        </button>

        {/* Navigation Menu */}
        <div
          className={cn(
            "absolute right-0 top-0 overflow-hidden rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-xl transition-all duration-500 ease-out",
            isOpen
              ? "w-64 opacity-100 -translate-x-0 translate-y-0"
              : "w-12 opacity-0 translate-x-2 -translate-y-2 pointer-events-none"
          )}
        >
          {/* Header */}
          <div className="border-b border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Navigation</h3>
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
                  "group relative flex w-full items-center justify-between rounded-lg p-3 text-left transition-all duration-200",
                  "hover:bg-gray-50 hover:text-gray-900",
                  "focus:outline-none focus:ring-2 focus:ring-gray-200"
                )}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                }}
              >
                {/* Content */}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="text-xs text-gray-500">
                      {item.description}
                    </span>
                  )}
                </div>

                {/* Arrow Icon */}
                <svg
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-all duration-200",
                    hoveredItem === item.label
                      ? "translate-x-1 text-gray-600"
                      : ""
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>

                {/* Hover Background */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 transition-opacity duration-200",
                    hoveredItem === item.label ? "opacity-100" : ""
                  )}
                  style={{ zIndex: -1 }}
                />
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Portfolio 2025</span>
              <div className="flex space-x-1">
                <div className="h-2 w-2 mt-0.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
