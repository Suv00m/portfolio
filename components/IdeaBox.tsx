"use client";

import { useState } from "react";

interface IdeaBoxProps {
  onInsertTitle?: (title: string) => void;
  onInsertContent?: (content: string) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-hover)",
  border: "1px solid var(--border)",
  color: "var(--tx-1)",
  borderRadius: "4px",
  padding: "0.5rem 0.625rem",
  fontSize: "0.8125rem",
  outline: "none",
  fontFamily: "var(--font-mono)",
  resize: "vertical" as const,
};

export default function IdeaBox({ onInsertTitle, onInsertContent }: IdeaBoxProps) {
  const [activeTab, setActiveTab] = useState<"ideas" | "assist">("ideas");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [assistContent, setAssistContent] = useState("");
  const [assistResult, setAssistResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistAction, setAssistAction] = useState<"expand" | "improve" | "summarize" | "fix-grammar">("improve");

  const generateIdeas = async () => {
    setIsGeneratingIdeas(true);
    try {
      const response = await fetch("/api/ai/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const data = await response.json();
        setIdeas(data.ideas || []);
      } else {
        const error = await response.json();
        alert("Failed to generate ideas: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error generating ideas:", error);
      alert("Failed to generate ideas");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleAssist = async () => {
    if (!assistContent.trim()) { alert("Please enter some content to process"); return; }
    setIsProcessing(true);
    try {
      const response = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: assistContent, action: assistAction }),
      });
      if (response.ok) {
        const data = await response.json();
        setAssistResult(data.result || "");
      } else {
        const error = await response.json();
        alert("Failed to process content: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error processing content:", error);
      alert("Failed to process content");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "480px",
      background: "var(--bg-subtle)",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      overflow: "hidden",
    }}>
      {/* Tabs */}
      <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
        {(["ideas", "assist"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "0.625rem 1rem",
              fontSize: "0.75rem",
              fontWeight: "500",
              cursor: "pointer",
              border: "none",
              borderBottom: activeTab === tab ? "1px solid var(--tx-1)" : "1px solid transparent",
              marginBottom: "-1px",
              background: "transparent",
              color: activeTab === tab ? "var(--tx-1)" : "var(--tx-3)",
              transition: "color 0.12s",
            }}
          >
            {tab === "ideas" ? "Ideas" : "Writing assistant"}
          </button>
        ))}
      </div>

      {/* Ideas tab */}
      {activeTab === "ideas" && (
        <div style={{ padding: "1.25rem" }} className="space-y-4">
          <button
            type="button"
            onClick={generateIdeas}
            disabled={isGeneratingIdeas}
            style={{
              width: "100%",
              background: "var(--accent)",
              color: "var(--bg)",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              fontSize: "0.8125rem",
              fontWeight: "500",
              cursor: isGeneratingIdeas ? "not-allowed" : "pointer",
              opacity: isGeneratingIdeas ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {isGeneratingIdeas ? (
              <><div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" /> Generating</>
            ) : (
              "Generate blog post ideas"
            )}
          </button>

          {ideas.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.1em] mb-2" style={{ color: "var(--tx-3)" }}>
                Suggestions
              </p>
              <div className="space-y-1.5" style={{ maxHeight: "320px", overflowY: "auto" }}>
                {ideas.map((idea, index) => (
                  <div
                    key={index}
                    onClick={() => onInsertTitle?.(idea)}
                    style={{
                      padding: "0.625rem 0.75rem",
                      background: "var(--bg-hover)",
                      border: "1px solid var(--border-faint)",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-faint)")}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: "var(--tx-1)", fontFamily: "var(--font-mono)" }}>
                      {idea}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onInsertTitle?.(idea); }}
                      className="mt-1.5 text-xs transition-colors hover:text-[var(--accent-hi)]"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", padding: 0 }}
                    >
                      Use as title →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ideas.length === 0 && !isGeneratingIdeas && (
            <p className="text-xs text-center py-4" style={{ color: "var(--tx-3)", fontFamily: "var(--font-mono)" }}>
              Generate ideas to get AI-powered suggestions
            </p>
          )}
        </div>
      )}

      {/* Writing assistant tab */}
      {activeTab === "assist" && (
        <div style={{ padding: "1.25rem" }} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Action</label>
            <select
              value={assistAction}
              onChange={(e) => setAssistAction(e.target.value as typeof assistAction)}
              style={{ ...inputStyle, resize: undefined }}
            >
              <option value="expand">Expand</option>
              <option value="improve">Improve</option>
              <option value="summarize">Summarize</option>
              <option value="fix-grammar">Fix grammar</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--tx-2)" }}>Content</label>
            <textarea
              value={assistContent}
              onChange={(e) => setAssistContent(e.target.value)}
              rows={5}
              placeholder="Paste content here..."
              style={inputStyle}
            />
          </div>

          <button
            type="button"
            onClick={handleAssist}
            disabled={isProcessing || !assistContent.trim()}
            style={{
              width: "100%",
              background: "var(--accent)",
              color: "var(--bg)",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              fontSize: "0.8125rem",
              fontWeight: "500",
              cursor: isProcessing || !assistContent.trim() ? "not-allowed" : "pointer",
              opacity: isProcessing || !assistContent.trim() ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {isProcessing ? (
              <><div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" /> Processing</>
            ) : (
              `Apply ${assistAction.replace("-", " ")}`
            )}
          </button>

          {assistResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.1em]" style={{ color: "var(--tx-3)" }}>Result</p>
                <button
                  type="button"
                  onClick={() => { setAssistContent(assistResult); setAssistResult(""); }}
                  className="text-xs transition-colors hover:text-[var(--accent-hi)]"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", padding: 0 }}
                >
                  Replace content
                </button>
              </div>
              <div style={{
                padding: "0.75rem",
                background: "var(--bg-hover)",
                border: "1px solid var(--border-faint)",
                borderRadius: "4px",
                maxHeight: "200px",
                overflowY: "auto",
              }}>
                <p className="text-xs leading-relaxed whitespace-pre-wrap"
                   style={{ color: "var(--tx-2)", fontFamily: "var(--font-mono)" }}>
                  {assistResult}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onInsertContent?.(assistResult)}
                style={{
                  width: "100%",
                  background: "var(--bg-hover)",
                  border: "1px solid var(--border)",
                  color: "var(--tx-2)",
                  borderRadius: "4px",
                  padding: "0.5rem 1rem",
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                }}
              >
                Insert into editor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
