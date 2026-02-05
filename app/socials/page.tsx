"use client";

import CenterNavbar from "@/components/CenterNavbar";
import { LinkPreview } from "@/components/ui/link-preview";
import Link from "next/link";

const socials = [
  {
    platform: "GitHub",
    description: "My code repositories, open-source contributions, and development projects.",
    url: "https://github.com/Suv00m",
    handle: "github.com/Suv00m",
    color: "#0a0a0a"
  },
  {
    platform: "X (Twitter)",
    description: "Quick thoughts, tech updates, and industry insights.",
    url: "https://x.com/shuvx_",
    handle: "@shuvx_",
    color: "#0a0a0a"
  },
  {
    platform: "Kaggle",
    description: "2x Kaggle Expert - Machine learning competitions, datasets, and data science notebooks.",
    url: "https://kaggle.com/shuvammandal121",
    handle: "kaggle.com/shuvammandal121",
    color: "#ff3d00"
  },
  {
    platform: "Hugging Face",
    description: "AI models, datasets, and machine learning research contributions.",
    url: "https://huggingface.co/shuvom",
    handle: "huggingface.co/shuvom",
    color: "#0066ff"
  }
];

export default function Socials() {
  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <CenterNavbar />

      {/* Socials Section */}
      <section className="relative min-h-screen px-6 md:px-12 lg:px-24 py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dots opacity-20" />

        {/* Decorative shapes */}
        <div className="absolute top-32 right-0 w-48 h-48 bg-[#ff3d00] -rotate-12 translate-x-1/2" />
        <div className="absolute bottom-32 left-0 w-32 h-32 bg-[#0066ff] rotate-12 -translate-x-1/2" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <span className="tag-brutal-filled mb-6 inline-block">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }).replace(/\//g, '.')}
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter">
              SOCIAL LINKS
            </h1>
            <p className="mt-6 text3xl text-[#525252] max-w-xl">
              Connect with me across different platforms where I share my work, thoughts, and projects.
            </p>
          </div>

          {/* Social Links Grid */}
          <div className="grid gap-6">
            {socials.map((social, index) => (
              <div
                key={index}
                className="group card-brutal p-6 md:p-8 overflow-hidden relative"
              >
                {/* Accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-2"
                  style={{ backgroundColor: social.color }}
                />

                <div className="pl-6">
                  <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight mb-3">
                    {social.platform}
                  </h2>
                  <p className="text-[#525252] leading-relaxed mb-4">
                    {social.description}
                  </p>
                  <LinkPreview
                    url={social.url}
                    className="inline-flex items-center gap-2 font-mono font-semibold text-[#0066ff] hover:text-[#ff3d00] transition-colors duration-200 group/link"
                  >
                    <span>{social.handle}</span>
                    <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </LinkPreview>
                </div>
              </div>
            ))}

            {/* Email Card */}
            <div className="card-brutal-inverse p-6 md:p-8">
              <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight mb-3">
                Email
              </h2>
              <p className="text-[#a3a3a3] leading-relaxed mb-4">
                For business inquiries, collaborations, or just to say hello.
              </p>
              <a
                href="mailto:shuvammandal131@gmail.com"
                className="inline-flex items-center gap-2 font-mono font-semibold text-[#ff3d00] hover:text-white transition-colors duration-200 group"
              >
                <span>shuvammandal131@gmail.com</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-16 pt-8 border-t-4 border-[#0a0a0a]">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-display font-bold uppercase tracking-wider text-[#525252] hover:text-[#ff3d00] transition-colors duration-200 group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 font-display font-bold uppercase tracking-wider text-[#525252] hover:text-[#0066ff] transition-colors duration-200 group"
            >
              Contact
              <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
