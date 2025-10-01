"use client";

import CenterNavbar from "@/components/CenterNavbar";
import { LinkPreview } from "@/components/ui/link-preview";
import Link from "next/link";

export default function Socials() {
  return (
    <main className="min-h-screen bg-white text-black">
      <CenterNavbar />
      {/* Socials Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl text-left">
          {/* Date and Title */}
          <div className="mb-8">
            <h1 className="mt-6 text-3xl font-medium font-sans tracking-tight">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              }).replace(/\//g, '.')}
              <br />
              Social Links
            </h1>
          </div>

          {/* Social Links */}
          <div className="mb-16 space-y-8 text-base leading-relaxed text-gray-600 md:text-lg text-left max-w-2xl text-gray-800">
            <div className="space-y-6">
              <p>
                Connect with me across different platforms where I share my work, thoughts, and projects.
              </p>
              
              {/* GitHub */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-medium font-sans tracking-tight text-black mb-3">
                  GitHub
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  My code repositories, open-source contributions, and development projects.
                </p>
                <LinkPreview
                  url="https://github.com/Suv00m"
                  className="inline-block text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
                >
                  github.com/Suv00m →
                </LinkPreview>
              </div>

              {/* X (Twitter) */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-medium font-sans tracking-tight text-black mb-3">
                  X (Twitter)
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Quick thoughts, tech updates, and industry insights.
                </p>
                <LinkPreview
                  url="https://x.com/00_shuv_00" 
                  className="inline-block text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
                >
                  @00_shuv_00 →
                </LinkPreview>
              </div>

              {/* Kaggle */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-medium font-sans tracking-tight text-black mb-3">
                  Kaggle
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  2x Kaggle Expert - Machine learning competitions, datasets, and data science notebooks.
                </p>
                <LinkPreview
                  url="https://kaggle.com/shuvammandal121" 
                  className="inline-block text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
                >
                  kaggle.com/shuvammandal121 →
                </LinkPreview>
              </div>

              {/* Hugging Face */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-medium font-sans tracking-tight text-black mb-3">
                  Hugging Face
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  AI models, datasets, and machine learning research contributions.
                </p>
                <LinkPreview
                  url="https://huggingface.co/shuvom" 
                  className="inline-block text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
                >
                  huggingface.co/shuvom →
                </LinkPreview>
              </div>

              {/* Email */}
              <div className="pb-6">
                <h2 className="text-xl font-medium font-sans tracking-tight text-black mb-3">
                  Email
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For business inquiries, collaborations, or just to say hello.
                </p>
                <a 
                  href="mailto:shuvammandal131@gmail.com" 
                  className="inline-block text-gray-900 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
                >
                  shuvammandal121@gmail.com →
                </a>
              </div>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
            <Link 
              href="/"
              className="text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
            >
            ← Back to Home
            </Link>
            <Link 
              href="/contact"
              className="text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors"
            >
              Contact →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
