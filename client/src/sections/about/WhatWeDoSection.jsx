import React from 'react'
import { Activity, Wrench, Lightbulb, Users, Phone, Rocket } from 'lucide-react'
import Badge from '../../components/Badge'

const ourActivities = [
  { tag: '02', icon: Activity, title: 'Technical Sessions', desc: 'Deep-dive sessions on emerging tech, research topics, and career-defining skill sets.' },
  { tag: '01', icon: Wrench, title: 'Workshops', desc: 'Hands-on sessions covering embedded systems, web dev, AI, and more — led by experienced members.' },
  { tag: '03', icon: Lightbulb, title: 'Competitions', desc: 'Hackathons, robotics challenges, and case competitions that push members to apply what they\'ve learned.' },
  { tag: '04', icon: Users, title: 'Community Activities', desc: 'Social events, team bonding trips, and volunteering initiatives that build lasting friendships.' },
  { tag: '05', icon: Phone, title: 'Industry Talks', desc: 'Sessions with engineers and founders from leading tech companies sharing real career insight.' },
  { tag: '06', icon: Rocket, title: 'Real Projects', desc: 'Build and ship real-world projects guided by experienced mentors from start to finish.' },
]

export default function WhatWeDoSection() {
  return (
    <section className="py-16 md:py-24 about-page-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge text={"Activities"}/>
          <h2 className="font-gotham text-3xl sm:text-4xl font-bold mt-4">
            What <span className="text-primary">We Do</span>
          </h2>
          <p className="text-muted mt-3">
            From hands-on workshops to industry talks, we create opportunities for students to learn, build, and grow.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ourActivities.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex flex-col bg-white dark:bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <span className="text-xs font-bold text-primary">{item.tag}</span>
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary shadow-lg shadow-primary/40 mt-3 mb-3">
                  <Icon size={20} className="text-white" />
                </span>
                <h3 className="font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted mt-1">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
