"use client";

import CenterNavbar from "@/components/CenterNavbar";
import Link from "next/link";

const services = [
  {
    title: "Web Development",
    description: "Building modern, responsive, and high-performance web applications using cutting-edge technologies. From sleek landing pages to complex full-stack applications.",
    tags: ["Next.js", "React", "TypeScript", "Node.js"],
    color: "#ff3d00"
  },
  {
    title: "Machine Learning & Data Science",
    description: "Leveraging data to build intelligent systems and provide actionable insights. From predictive models to deep learning solutions that drive real business value.",
    tags: ["Python", "TensorFlow", "PyTorch", "Kaggle"],
    color: "#0066ff"
  },
  {
    title: "Product Strategy",
    description: "Helping startups go from zero to profitable by focusing on user needs and rapid iteration. Proven track record of $0 to $1,000+ MRR launches.",
    tags: ["MVP", "Growth", "Analytics", "UX"],
    color: "#0a0a0a"
  }
];

export default function Services() {
  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <CenterNavbar />

      {/* Services Section */}
      <section className="relative min-h-screen px-6 md:px-12 lg:px-24 py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dots opacity-20" />

        {/* Decorative shapes */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-[#ff3d00] -rotate-12 translate-x-1/2" />
        <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-[#0066ff] rotate-12 -translate-x-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-20">
            <span className="tag-brutal mb-6 inline-block">
              What I Do
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter">
              SERVICES
            </h1>
            <p className="mt-6 text-xl text-[#525252] max-w-2xl">
              Professional offerings tailored to help you build, grow, and optimize your digital presence.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative card-brutal p-8 md:p-10 overflow-hidden"
              >
                {/* Left Accent Bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-2"
                  style={{ backgroundColor: service.color }}
                />

                {/* Number */}
                <div className="absolute -top-4 right-4 md:top-6 md:right-8 font-display text-7xl md:text-8xl font-black text-[#f5f5f5] select-none">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="relative pl-6">
                  {/* Title */}
                  <h3
                    className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4"
                    style={{ color: service.color }}
                  >
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#525252] text-lg leading-relaxed mb-6 max-w-2xl">
                    {service.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="tag-brutal"
                        style={{
                          borderColor: service.color,
                          color: service.color,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 card-brutal-inverse p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Ready to build something?
            </h2>
            <p className="text-[#a3a3a3] text-lg mb-8 max-w-xl mx-auto">
              Let&apos;s discuss your project and explore how we can work together to bring your vision to life.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-brutal bg-[#ff3d00] border-[#ff3d00] hover:bg-white hover:text-[#ff3d00]">
                Schedule a Call
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/socials" className="btn-brutal-outline bg-transparent text-white border-white hover:bg-white hover:text-[#0a0a0a] hover:shadow-none">
                View Socials
              </Link>
            </div>
          </div>

          {/* Back Navigation */}
          <div className="mt-20 pt-8 border-t-4 border-[#0a0a0a]">
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
