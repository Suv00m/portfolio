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
      config: { layout: "month_view" },
      calLink: "shuvam-mandal/30min",
    });

    (window as any).Cal.ns["30min"]("ui", {
      hideEventTypeDetails: false,
      layout: "month_view"
    });
    /* eslint-enable @typescript-eslint/no-explicit-any, prefer-const, prefer-rest-params */
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <CenterNavbar />
      
      {/* Contact Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl text-left w-full">
          {/* Date and Title */}
          <div className="mb-8">
            <h1 className="mt-6 text-4xl font-medium font-sans tracking-tight">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              }).replace(/\//g, '.')}
              <br />
              Let&apos;s Connect
            </h1>
          </div>

          {/* Description */}
          <div className="mb-16 space-y-6 text-lg leading-relaxed text-gray-600 md:text-xl text-left max-w-2xl text-gray-800">
            <p>
              I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your vision. 
              Schedule a 30-minute call with me below, and let&apos;s explore how we can work together.
            </p>
            <p>
              Whether you want to talk about building something amazing, need help with a project, 
              or just want to connect, I&apos;d love to hear from you.
            </p>
          </div>

          {/* Cal.com Embed */}
          <div className="mb-16 w-full">
            <div 
              id="my-cal-inline-30min" 
              className="w-full rounded-lg border border-gray-200 bg-white shadow-sm"
              style={{ 
                minHeight: "700px",
                overflow: "auto"
              }}
            />
          </div>

          {/* Additional Contact Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="space-y-4 text-lg text-gray-600">
              <p>
                <span className="font-medium text-gray-900">Prefer email?</span>
                <br />
                Reach out directly and I&apos;ll get back to you within 24 hours.
              </p>
              <p className="text-gray-500 text-base">
                You can also find me on LinkedIn, Twitter, or GitHub. Let&apos;s create something amazing together.
              </p>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="mt-12">
            <Link 
              href="/"
              className="text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
