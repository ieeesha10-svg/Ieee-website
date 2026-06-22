import React from 'react'
import Badge from '../../components/Badge'

const COMMITTES = [
  { emoji: '🎨', title: 'UI/UX', subtitle: 'Design & prototyping' },
  { emoji: '💻', title: 'Web Development', subtitle: 'Frontend & backend' },
  { emoji: '📱', title: 'Mobile Development', subtitle: 'iOS & Android apps' },
  { emoji: '🤖', title: 'Robotics', subtitle: 'Build & automate' },
  { emoji: '⚙️', title: 'Embedded Systems', subtitle: 'Hardware & firmware' },
  { emoji: '🧠', title: 'AI & Machine Learning', subtitle: 'Models & research' },
  { emoji: '📣', title: 'Marketing', subtitle: 'Brand & outreach' },
  { emoji: '🤝', title: 'Human Resources', subtitle: 'People & culture' },
]

export default function CommitteesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge text={"Get Involved"} />
          <h2 className="font-gotham text-3xl sm:text-4xl font-bold mt-4">
            Our <span className="text-primary">Committees</span>
          </h2>
          <p className="text-muted mt-3">
            Eight specialized teams, one shared mission — find where your skills fit best.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {COMMITTES.map((c, i) => (
            <div key={i} className="bg-white dark:bg-card rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="text-4xl mb-3">{c.emoji}</div>
              <h3 className="font-bold text-foreground">{c.title}</h3>
              <p className="text-xs text-muted mt-1">{c.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
