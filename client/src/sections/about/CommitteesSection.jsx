import React from 'react'
import Badge from '../../components/ui/Badge'
import SectionHeader from '../../components/ui/SectionHeader'
import SectionIntro from '../../components/ui/SectionIntro'
import { committees } from '../../data/committeesData'

export default function CommitteesSection() {
  return (
    <>
        {/* Header */}
        <SectionIntro>
          <Badge text={"Get Involved"} />
          <SectionHeader
            title="Our"
            highlight="Committees"
            highlightColor="primary"
            variant="light"
            className="mt-4"
          />
          <p className="text-muted mt-3">
            Eight specialized teams, one shared mission — find where your skills fit best.
          </p>
        </SectionIntro>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {committees.map((c) => (
            <div key={c.id} className="bg-white dark:bg-card rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex justify-center mb-3">
                <img src={c.icon} alt={c.label} className="w-8 h-8 object-contain" />
              </div>
              <h3 className="font-bold text-foreground">{c.label}</h3>
              <p className="text-xs text-muted mt-1">{c.subtitle}</p>
            </div>
          ))}
        </div>
    </>
  )
}
