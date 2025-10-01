
"use client";

import { LinkPreview } from "@/components/ui/link-preview";
import CenterNavbar from "@/components/CenterNavbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <CenterNavbar />
      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl text-left">
          {/* Date and Title */}
          <div className="mb-8">
            <h1 className="mt-6 text-4xl font-medium font-sans tracking-tight">
            {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              }).replace(/\//g, '.')}
              <br />
              Shuvam Mandal
            </h1>
          </div>

          {/* Description */}
          <div className="mb-16 space-y-6 text-lg leading-relaxed text-gray-600 md:text-xl text-left max-w-2xl text-gray-800">
            <p>
              hello, i'm engineer from india, i enjoy building things that live on the internet.
              also love to play with data and build things that help people.
            </p>
            <p>
              <span>
                Currently building{" "}
                <span className="inline">
                  <LinkPreview
                    url="https://behooked.co"
                    className="text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2"
                  >
                    behooked.co
                  </LinkPreview>
                </span>
                {", a startup which i grew from $0 to $1,000 MRR in 3 months."}
              </span>
              <br />
              also i'm a 2x Kaggle Expert recognized for excellence in machine learning and data analysis.
            </p>
            <p>
              Let's create something amazing together and push the boundaries of what's possible.
            </p>
          </div>

          </div>
        </section>
      </main>
  );
}
