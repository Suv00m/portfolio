"use client";

import { useEffect } from "react";
import Link from "next/link";
import CenterNavbar from "@/components/CenterNavbar";

export default function Contact() {
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, prefer-rest-params */
    // Load Cal.com embed script (third-party code)
    (function (C: any, A: string, L: string) {
      let p = function (a: any, ar: any) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal;
        let ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement("script")).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api: any = function () { p(api, arguments); };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    // Initialize Cal.com
    (window as any).Cal("init", "30min", { origin: "https://app.cal.com" });

    (window as any).Cal.ns["30min"]("inline", {
      elementOrSelector: "#my-cal-inline-30min",
      config: { layout: "month_view", theme: "light" },
      calLink: "shuvam-mandal/30min",
    });

    (window as any).Cal.ns["30min"]("ui", {
      theme: "light",
      hideEventTypeDetails: false,
      layout: "month_view"
    });
    /* eslint-enable @typescript-eslint/no-explicit-any, prefer-const, prefer-rest-params */
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <CenterNavbar />

      {/* Contact Section */}
      <section className="relative min-h-screen px-6 md:px-12 lg:px-24 py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dots opacity-20" />

        {/* Decorative shapes */}
        <div className="absolute top-32 right-0 w-48 h-48 bg-[#ff3d00] -rotate-12 translate-x-1/2" />
        <div className="absolute bottom-32 left-0 w-32 h-32 bg-[#0066ff] rotate-12 -translate-x-1/2" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <span className="tag-brutal-filled mb-6 inline-block">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }).replace(/\//g, '.')}
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter">
              LET&apos;S CONNECT
            </h1>
          </div>

          {/* Description */}
          <div className="mb-16 space-y-6 max-w-2xl">
            <p className="text-lg md:text-xl leading-relaxed text-[#525252]">
              I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
              Schedule a 30-minute call with me below, and let&apos;s explore how we can work together.
            </p>
            <p className="text-lg leading-relaxed text-[#525252]">
              Whether you want to talk about building something amazing, need help with a project,
              or just want to connect, I&apos;d love to hear from you.
            </p>
          </div>

          {/* Cal.com Embed */}
          <div className="mb-16 w-full card-brutal overflow-hidden">
            <div
              id="my-cal-inline-30min"
              className="w-full bg-white"
              style={{
                minHeight: "700px",
                overflow: "auto"
              }}
            />
          </div>

          {/* Additional Contact Info */}
          <div className="mt-16 pt-8 border-t-4 border-[#0a0a0a]">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-brutal p-6">
                <h3 className="font-display font-bold text-lg mb-3">Prefer email?</h3>
                <p className="text-[#525252] mb-4">
                  Reach out directly and I&apos;ll get back to you within 24 hours.
                </p>
                <a
                  href="mailto:shuvammandal121@gmail.com"
                  className="font-mono text-[#0066ff] hover:text-[#ff3d00] font-semibold transition-colors"
                >
                  shuvammandal121@gmail.com
                </a>
              </div>
              <div className="card-brutal p-6">
                <h3 className="font-display font-bold text-lg mb-3">Find me online</h3>
                <p className="text-[#525252] mb-4">
                  Connect on LinkedIn, Twitter, or GitHub to see what I&apos;m working on.
                </p>
                <Link
                  href="/socials"
                  className="inline-flex items-center gap-2 font-display font-bold text-[#ff3d00] hover:text-[#0066ff] transition-colors"
                >
                  View all socials
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="mt-16 pt-8 border-t-4 border-[#0a0a0a]">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-display font-bold uppercase tracking-wider text-[#525252] hover:text-[#ff3d00] transition-colors duration-200 group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
