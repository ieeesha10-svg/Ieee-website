import React from 'react'
import Badge from '../../components/Badge'

const EVENTS = [
  {
    date: 'SEPTEMBER 2024',
    title: 'Recruitment Season',
    desc: 'Open applications welcomed 120+ new members across all 8 committees.',
    side: 'left',
  },
  {
    date: 'NOVEMBER 2024',
    title: 'IEEE Day Celebration',
    desc: 'A full-day branch celebration with talks, workshops, and live demos.',
    side: 'right',
  },
  {
    date: 'JANUARY 2025',
    title: 'Winter Hackathon',
    desc: '48-hour build challenge with 200+ participants and industry judges.',
    side: 'left',
  },
  {
    date: 'MARCH 2025',
    title: 'Technical Workshop Series',
    desc: 'Six-week deep-dive series on embedded systems and IoT fundamentals.',
    side: 'right',
  },
  {
    date: 'MAY 2025',
    title: 'Industry Career Fair',
    desc: 'Connecting members with top engineering employers across Egypt.',
    side: 'left',
  },
]

export default function TimelineSection() {
  return (
    <section className="py-16 md:py-24 about-page-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge text={"Our Journey"} />
          <h2 className="font-gotham text-3xl sm:text-4xl font-bold mt-4">
            Annual <span className="text-primary">Timeline</span>
          </h2>
          <p className="text-muted mt-3">
            A year of milestones, growth, and unforgettable moments.
          </p>
        </div>

        {/* Desktop: alternating two-sided layout */}
        <div className="hidden lg:block relative">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

          <div className="relative flex flex-col gap-12">
            {EVENTS.map((evt, i) => (
              <div key={i} className="grid grid-cols-2 items-center relative">
                {/* Dot on center line */}
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary z-10" />

                {evt.side === 'left' ? (
                  <div className="flex justify-end pr-8">
                    <div className="w-full max-w-sm bg-white border border-border dark:bg-card rounded-xl p-5 text-right">
                      <span className="text-xs font-semibold text-primary uppercase">{evt.date}</span>
                      <h3 className="font-bold text-foreground mt-1">{evt.title}</h3>
                      <p className="text-sm text-muted mt-1">{evt.desc}</p>
                    </div>
                  </div>
                ) : (
                  <div className="col-start-2 flex justify-start pl-8">
                    <div className="w-full max-w-sm bg-white border border-border dark:bg-card rounded-xl p-5 text-left">
                      <span className="text-xs font-semibold text-primary uppercase">{evt.date}</span>
                      <h3 className="font-bold text-foreground mt-1">{evt.title}</h3>
                      <p className="text-sm text-muted mt-1">{evt.desc}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet: single-column left-aligned */}
        <div className="lg:hidden relative">
          {/* Left line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="relative flex flex-col gap-8 pl-12">
            {EVENTS.map((evt, i) => (
              <div key={i} className="relative">
                {/* Dot */}
                <div className="absolute -left-8 top-2 w-4 h-4 rounded-full bg-primary z-10" />

                {/* Card */}
                <div className="bg-white dark:bg-card border border-border rounded-xl p-5">
                  <span className="text-xs font-semibold text-primary uppercase">{evt.date}</span>
                  <h3 className="font-bold text-foreground mt-1">{evt.title}</h3>
                  <p className="text-sm text-muted mt-1">{evt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
