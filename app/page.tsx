"use client";

import { LinkPreview } from "@/components/ui/link-preview";
import CenterNavbar from "@/components/CenterNavbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0a0a0a] overflow-hidden">
      <CenterNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dots opacity-30" />

        {/* Large decorative shapes - positioned to not overlap content */}
        <div className="absolute top-20 right-0 w-64 h-64 md:w-96 md:h-96 bg-[#ff3d00] -rotate-12 translate-x-1/2 z-0" />
        <div className="absolute -bottom-20 left-0 w-48 h-48 md:w-72 md:h-72 bg-[#0066ff] rotate-6 -translate-x-2/3 z-0" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 border-[6px] border-[#0a0a0a] rotate-45 hidden lg:block z-0" />

        <div className="relative z-10 max-w-6xl">
          {/* Date Badge */}
          <div className="mb-8 animate-reveal">
            <span className="tag-brutal-filled">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }).replace(/\//g, '.')}
            </span>
          </div>

          {/* Main Heading */}
          <div className="mb-12">
            <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] animate-reveal animate-reveal-delay-1">
              <span className="block">SHUVAM</span>
              <span className="block text-stroke-only">MANDAL</span>
            </h1>
            <style jsx>{`
              .text-stroke-only {
                -webkit-text-stroke: 4px #0a0a0a;
                -webkit-text-fill-color: transparent;
              }
              @media (min-width: 768px) {
                .text-stroke-only {
                  -webkit-text-stroke: 6px #0a0a0a;
                }
              }
            `}</style>
            <div className="mt-8 flex flex-wrap items-center gap-4 animate-reveal animate-reveal-delay-2">
              <span className="text-xl md:text-2xl font-display font-bold">Engineer</span>
              <span className="w-4 h-4 bg-[#ff3d00] rotate-45" />
              <span className="text-xl md:text-2xl font-display font-bold">Builder</span>
              <span className="w-4 h-4 bg-[#0066ff] rotate-45" />
              <span className="text-xl md:text-2xl font-display font-bold">Creator</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-16 space-y-8 max-w-2xl animate-reveal animate-reveal-delay-3">
            <p className="text-lg md:text-xl leading-relaxed text-[#525252]">
              I&apos;m an engineer from India who builds things that live on the internet.
              I play with <span className="font-bold text-[#ff3d00]">data</span> and create
              solutions that actually <span className="font-bold text-[#0066ff]">help people</span>.
            </p>

            <p className="text-lg md:text-xl leading-relaxed text-[#525252]">
              Currently building{" "}
              <LinkPreview
                url="https://behooked.co"
                className="font-bold text-[#ff3d00] link-underline link-underline-accent"
              >
                behooked.co
              </LinkPreview>
              {" "}&mdash; a startup that grew from{" "}
              <span className="font-bold text-[#0a0a0a] underline decoration-4 decoration-[#ff3d00] underline-offset-4">
                $0 to $1,000 MRR
              </span>
              {" "}in just 3 months after launch.
            </p>

            <p className="text-lg md:text-xl leading-relaxed text-[#525252]">
              <span className="inline-flex items-center gap-2">
                <span className="tag-brutal-accent">2x Kaggle Expert</span>
              </span>
              {" "}recognized for excellence in machine learning and data analysis.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4 animate-reveal animate-reveal-delay-4">
            <a href="/contact" className="btn-brutal">
              Let&apos;s Connect
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a href="/blog" className="btn-brutal-outline">
              Read Blog
            </a>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="relative py-8 bg-[#0a0a0a] text-white overflow-hidden border-y-4 border-[#0a0a0a]">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              <span className="font-display text-2xl md:text-4xl font-black tracking-tight">WEB DEVELOPMENT</span>
              <span className="w-4 h-4 bg-[#ff3d00] rotate-45" />
              <span className="font-display text-2xl md:text-4xl font-black tracking-tight">MACHINE LEARNING</span>
              <span className="w-4 h-4 bg-[#0066ff] rotate-45" />
              <span className="font-display text-2xl md:text-4xl font-black tracking-tight">DATA SCIENCE</span>
              <span className="w-4 h-4 bg-[#ff3d00] rotate-45" />
              <span className="font-display text-2xl md:text-4xl font-black tracking-tight">PRODUCT STRATEGY</span>
              <span className="w-4 h-4 bg-[#0066ff] rotate-45" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
