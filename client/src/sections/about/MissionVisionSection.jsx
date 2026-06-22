import React from 'react'
import { Target, Eye } from 'lucide-react'
import Badge from '../../components/Badge'

export default function MissionVisionSection() {
  return (
    <section className="py-16 md:py-24 about-page-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge text='Purpose' />
          <h2 className="text-3xl font-gotham sm:text-4xl font-bold mt-4">
            <span className="text-primary">Our Mission</span>{' '}
            <span className="text-foreground">& Vision</span>
          </h2>
          <p className="text-muted mt-3">
            What drives us forward and where we&apos;re headed as a community of engineers.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 *:border *:border-border">
          {/* Mission */}
          <div className="bg-white dark:bg-card rounded-xl p-6 md:p-8">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary mb-4 shadow-lg shadow-primary/40">
              <Target size={20} className="text-white" />
            </span>
            <h3 className="text-lg font-bold text-foreground mb-2">Our Mission</h3>
            <p className="text-sm text-muted">
              To empower students through hands-on technical experience, mentorship, and collaborative projects — bridging the gap between classroom theory and real-world engineering practice across Egypt.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white dark:bg-card rounded-xl p-6 md:p-8">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary mb-4 shadow-lg shadow-primary/40">
              <Eye size={20} className="text-white" />
            </span>
            <h3 className="text-lg font-bold text-foreground mb-2">Our Vision</h3>
            <p className="text-sm text-muted">
              To be the leading student-driven technical community in the region — recognized for innovation, inclusivity, and producing graduates ready to lead the next generation of technology.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
