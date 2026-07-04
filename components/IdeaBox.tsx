"use client";

export type AssistAction = "expand" | "improve" | "summarize" | "fix-grammar";

interface IdeaBoxProps {
  scope: "selection" | "post";
  activeAction: AssistAction | null;
  onApply: (action: AssistAction) => void;
}

const ACTIONS: { key: AssistAction; label: string }[] = [
  { key: "improve", label: "Improve" },
  { key: "expand", label: "Expand" },
  { key: "summarize", label: "Summarize" },
  { key: "fix-grammar", label: "Fix grammar" },
];

export default function IdeaBox({ scope, activeAction, onApply }: IdeaBoxProps) {
  const busy = activeAction !== null;

  return (
    <div style={{
      width: "260px",
      background: "var(--bg-subtle)",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      padding: "0.75rem",
    }}>
      <p className="text-xs font-medium uppercase tracking-[0.1em] mb-0.5" style={{ color: "var(--tx-3)" }}>
        Writing assistant
      </p>
      <p className="text-xs mb-3" style={{ color: "var(--tx-3)", fontFamily: "var(--font-mono)" }}>
        {scope === "selection" ? "Applies to selected text" : "Applies to whole post"}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {ACTIONS.map(({ key, label }) => {
          const isActive = activeAction === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onApply(key)}
              disabled={busy}
              style={{
                padding: "0.5rem 0.625rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                borderRadius: "4px",
                border: "1px solid var(--border)",
                background: "var(--bg-hover)",
                color: "var(--tx-2)",
                cursor: busy ? "not-allowed" : "pointer",
                opacity: busy && !isActive ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.375rem",
              }}
            >
              {isActive ? (
                <><div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" /></>
              ) : label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
