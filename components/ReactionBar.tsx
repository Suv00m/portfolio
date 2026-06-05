"use client";

import { useState, useEffect, useCallback } from "react";
import { ReactionCounts, ReactionType } from "@/lib/types";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "fire", emoji: "🔥", label: "Fire" },
  { type: "think", emoji: "🤔", label: "Thinking" },
];

function getFingerprint(): string {
  const raw = [
    navigator.userAgent,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export default function ReactionBar({ pagePath }: { pagePath: string }) {
  const [counts, setCounts] = useState<ReactionCounts>({ like: 0, love: 0, fire: 0, think: 0 });
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const [fp, setFp] = useState("");

  useEffect(() => {
    const fingerprint = getFingerprint();
    setFp(fingerprint);

    fetch(`/api/reactions?path=${encodeURIComponent(pagePath)}&fp=${fingerprint}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCounts(data.counts);
          setUserReactions(data.userReactions);
        }
      })
      .catch(() => {});
  }, [pagePath]);

  const toggle = useCallback(
    async (type: ReactionType) => {
      // Optimistic update
      const wasActive = userReactions.includes(type);
      setCounts((prev) => ({
        ...prev,
        [type]: prev[type] + (wasActive ? -1 : 1),
      }));
      setUserReactions((prev) =>
        wasActive ? prev.filter((r) => r !== type) : [...prev, type]
      );

      try {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: pagePath, reaction: type, fingerprint: fp }),
        });
        const data = await res.json();
        if (data.success) setCounts(data.counts);
      } catch {
        // Revert on error
        setCounts((prev) => ({
          ...prev,
          [type]: prev[type] + (wasActive ? 1 : -1),
        }));
        setUserReactions((prev) =>
          wasActive ? [...prev, type] : prev.filter((r) => r !== type)
        );
      }
    },
    [pagePath, fp, userReactions]
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REACTIONS.map(({ type, emoji, label }) => {
        const active = userReactions.includes(type);
        const count = counts[type];
        return (
          <button
            key={type}
            onClick={() => toggle(type)}
            title={label}
            onMouseEnter={(e) => !active && (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => !active && (e.currentTarget.style.background = "var(--bg-subtle)")}
            style={{
              background: active ? "var(--accent)" : "var(--bg-subtle)",
              border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
              color: active ? "var(--bg)" : "var(--tx-2)",
              borderRadius: "4px",
              padding: "0.375rem 0.75rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem",
              transition: "all 0.15s",
            }}
          >
            <span>{emoji}</span>
            <span>{count > 0 ? count : ""}</span>
          </button>
        );
      })}
    </div>
  );
}
