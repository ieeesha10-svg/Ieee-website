import React from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, FileText, LayoutGrid, ArrowRight } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import SectionHeader from '../../components/ui/SectionHeader'
import SectionIntro from '../../components/ui/SectionIntro'
import { committees } from '../../data/committeesData'

const stats = [
  { icon: Users, value: '150+', label: 'Active Volunteers' },
  { icon: Calendar, value: '50+', label: 'Events Hosted' },
  { icon: FileText, value: '23+', label: 'Workshops' },
  { icon: LayoutGrid, value: committees.length, label: 'Committees' },
]

export default function ImpactStatsSection() {
  return (
    <>
      {/* Header */}
      <SectionIntro>
        <Badge text="By the Numbers" />
        <SectionHeader
          title="Our Impact"
          highlight="So Far"
          highlightColor="primary"
          variant="light"
          className="mt-4"
        />
      </SectionIntro>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white dark:bg-card border border-border rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-card">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-4">
                <Icon size={20} className="text-primary" />
              </span>
              <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 w-[80%] sm:w-auto mx-auto">
        <Link
          to="/events"
          className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-full px-6 py-3 transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
        >
          See Our Events <ArrowRight size={18} />
        </Link>
        <Link
          to="/applications"
          className="inline-flex items-center justify-center gap-2 border border-primary text-primary font-semibold rounded-full px-6 py-3 transition-all duration-300 hover:bg-primary/10"
        >
          View Open Applications <ArrowRight size={18} />
        </Link>
      </div>
    </>
  )
}
