"use client";

import { useState, useEffect } from "react";

export default function ViewCounter({ pagePath }: { pagePath: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Track view and get count
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pagePath }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCount(data.count);
      })
      .catch(() => {});
  }, [pagePath]);

  if (count === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-sm text-[#737373]">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      {count.toLocaleString()} views
    </span>
  );
}
