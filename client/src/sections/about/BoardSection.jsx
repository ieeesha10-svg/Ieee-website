import React from 'react'
import { Linkedin, Twitter, Github, Instagram } from 'lucide-react'
import Badge from '../../components/Badge'

const members = [
  {
    initials: 'MK',
    name: 'Mariam Khaled',
    role: 'BRANCH CHAIR',
    socials: [
      { icon: Linkedin, label: 'LinkedIn' },
      { icon: Twitter, label: 'Twitter' },
    ],
  },
  {
    initials: 'YA',
    name: 'Youssef Adel',
    role: 'VICE CHAIR',
    socials: [
      { icon: Linkedin, label: 'LinkedIn' },
      { icon: Instagram, label: 'Instagram' },
    ],
  },
  {
    initials: 'NS',
    name: 'Nour Sherif',
    role: 'TECHNICAL LEAD',
    socials: [
      { icon: Github, label: 'GitHub' },
      { icon: Linkedin, label: 'LinkedIn' },
    ],
  },
  {
    initials: 'OH',
    name: 'Omar Hesham',
    role: 'EVENTS DIRECTOR',
    socials: [
      { icon: Instagram, label: 'Instagram' },
      { icon: Twitter, label: 'Twitter' },
    ],
  },
]

export default function BoardSection() {
  return (
    <section className="py-16 md:py-24 about-page-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge text={"Leadership"} />
          <h2 className="font-gotham text-3xl sm:text-4xl font-bold mt-4">
            Meet the <span className="text-primary">Board</span>
          </h2>
          <p className="text-muted mt-3">
            The students leading the branch this academic year.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map((m, i) => (
            <div key={i} style={{ boxShadow: '0 2px 6px -1px rgba(0,150,255,0.04), 0 4px 14px -4px rgba(0,150,255,0.03), 0 8px 28px -6px rgba(0,0,0,0.12)' }} className="bg-card rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              {/* Avatar gradient */}
              <div className="flex items-center justify-center h-32 sm:h-70 bg-primary-light/30">
                <span className="text-3xl sm:text-4xl font-bold text-primary text-primary-light">{m.initials}</span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-foreground text-sm sm:text-base">{m.name}</h3>
                <p className="text-xs font-semibold text-primary uppercase mt-1">{m.role}</p>

                <div className="flex gap-2 mt-3">
                  {m.socials.map((Social, j) => {
                    const Icon = Social.icon
                    return (
                      <a key={j} href="#" aria-label={Social.label} className="text-muted hover:text-white transition-colors">
                        <Icon size={16} />
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
