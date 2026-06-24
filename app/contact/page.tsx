"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Contact() {
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, prefer-rest-params */
    (function (C: any, A: string, L: string) {
      let p = function (a: any, ar: any) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal; let ar = arguments;
        if (!cal.loaded) {
          cal.ns = {}; cal.q = cal.q || [];
          d.head.appendChild(d.createElement("script")).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api: any = function () { p(api, arguments); };
          const namespace = ar[1]; api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    (window as any).Cal("init", "30min", { origin: "https://app.cal.com" });
    (window as any).Cal.ns["30min"]("inline", {
      elementOrSelector: "#cal-embed",
      config: { layout: "month_view", theme: "dark" },
      calLink: "shuvam-mandal/30min",
    });
    (window as any).Cal.ns["30min"]("ui", {
      theme: "dark",
      hideEventTypeDetails: false,
      layout: "month_view",
    });
    /* eslint-enable @typescript-eslint/no-explicit-any, prefer-const, prefer-rest-params */
  }, []);

  return (
    <main style={{ background: "var(--bg)", color: "var(--tx-1)", minHeight: "100vh" }}>
      <Navbar />

      <div className="mx-auto px-6 pt-32 pb-24" style={{ maxWidth: "680px" }}>
        <header className="mb-10">
          <h1 className="text-xl font-semibold tracking-tight mb-2">Contact</h1>
          <p className="text-sm" style={{ color: "var(--tx-2)" }}>
            Schedule a 30-minute call, or reach out by email.
          </p>
        </header>

        {/* Email */}
        <section className="mb-10 pb-8" style={{ borderBottom: "1px solid var(--border-faint)" }}>
          <p className="text-xs font-medium uppercase mb-3" style={{ color: "var(--tx-3)", letterSpacing: "0.1em" }}>
            Email
          </p>
          <a
            href="mailto:shuvammandal121@gmail.com"
            className="text-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--tx-2)" }}
          >
            shuvammandal121@gmail.com
          </a>
        </section>

        {/* Cal.com embed */}
        <section className="mb-10">
          <p className="text-xs font-medium uppercase mb-4" style={{ color: "var(--tx-3)", letterSpacing: "0.1em" }}>
            Schedule a call
          </p>
          <div
            id="cal-embed"
            className="w-full rounded-md overflow-hidden"
            style={{
              minHeight: "680px",
              border: "1px solid var(--border-faint)",
            }}
          />
        </section>

        <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border-faint)" }}>
          <Link
            href="/"
            className="text-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--tx-3)" }}
          >
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
