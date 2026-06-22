import React from 'react'
import { Users, Calendar, FileText, LayoutGrid } from 'lucide-react'
import Badge from '../../components/Badge'

const stats = [
  { icon: Users, value: '350+', label: 'Active Members' },
  { icon: Calendar, value: '60+', label: 'Events Hosted' },
  { icon: FileText, value: '45+', label: 'Workshops' },
  { icon: LayoutGrid, value: '8', label: 'Committees' },
]

export default function ImpactStatsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge text="By the Numbers" />
          <h2 className="text-3xl font-gotham sm:text-4xl font-bold mt-4">
            Our Impact <span className="text-primary">So Far</span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="bg-white dark:bg-card border border-border rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ boxShadow: '0 2px 6px -1px rgba(0,150,255,0.04), 0 4px 14px -4px rgba(0,150,255,0.03), 0 8px 28px -6px rgba(0,0,0,0.12)' }}>
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-4">
                  <Icon size={20} className="text-primary" />
                </span>
                <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted mt-1">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
