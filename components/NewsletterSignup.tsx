"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage("You're in! Thanks for subscribing.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to subscribe. Try again.");
    }
  };

  return (
    <div className="card-brutal-inverse p-6 md:p-8">
      <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight mb-2">
        Stay in the loop
      </h3>
      <p className="text-[#a3a3a3] mb-6">
        Get notified when I publish new posts. No spam, unsubscribe anytime.
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-[#22c55e] font-display font-bold">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
          </svg>
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 bg-white text-[#0a0a0a] border-3 border-white font-sans text-sm outline-none focus:border-[#ff3d00] transition-colors"
            style={{ borderWidth: 3 }}
            required
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-brutal bg-[#ff3d00] border-[#ff3d00] !py-3 !px-6 text-sm disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="mt-3 font-mono text-sm text-[#ff3d00]">{message}</p>
      )}
    </div>
  );
}
