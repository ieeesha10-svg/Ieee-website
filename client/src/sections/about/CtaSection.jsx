import React from 'react'
import { ArrowRight } from 'lucide-react'

export default function CtaSection() {
  return (
    <section className="py-16 md:py-24 about-page-bg">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-linear rounded-2xl md:rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to Build Something Great?
          </h2>
          <p className="text-white/80 mt-3 max-w-lg mx-auto">
            Join 150+ students already learning, building, and growing together at IEEE Student Branch.
          </p>
          <a href="/committees" className="mt-6 bg-white text-primary font-semibold rounded-full px-6 py-3 inline-flex items-center gap-2 mx-auto transition-all duration-300 hover:opacity-90 hover:scale-[1.02]">
            Apply Now <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}
