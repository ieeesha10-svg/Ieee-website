import React from 'react'
import { Target, Eye } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import SectionHeader from '../../components/ui/SectionHeader'

export default function MissionVisionSection() {
  return (
    <section className="py-16 md:py-24 bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge text='Purpose' />
          <SectionHeader
            title="Our Mission"
            highlight="& Vision"
						highlightColor="primary"
						variant='light'
            className="mt-4"
          />
          <p className="text-muted mt-3 text-lg lg:text-xl">
            What drives us forward and where we&apos;re headed as a community of engineers.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 *:border *:border-border">
          {/* Mission */}
          <div className="bg-white dark:bg-navbar-background rounded-xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary mb-4 shadow-lg shadow-primary/40">
              <Target size={20} className="text-white" />
            </span>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Our Mission</h3>
            <p className="text-sm text-muted">
            	We provide students with opportunities to learn and improve through workshops, events, competitions, and networking that enhance technical knowledge, practical abilities, and soft skills. We create a friendly and supportive environment where everyone can collaborate, try new ideas, and prepare for the challenges in engineering and technology.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white dark:bg-navbar-background rounded-xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary mb-4 shadow-lg shadow-primary/40">
              <Eye size={20} className="text-white" />
            </span>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Our Vision</h3>
            <p className="text-sm text-muted">
							We aim to be a place where students grow in engineering and technology, develop practical and soft skills, work on exciting projects, and collaborate with each other, while building leadership, creativity, and a passion for technology.
						</p>
          </div>
        </div>
      </div>
    </section>
  )
}
