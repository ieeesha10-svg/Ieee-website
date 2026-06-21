import React from 'react'
import { ArrowRight } from 'lucide-react'
import VRPicture from '../../assets/images/about/vr-engineer-robotics-hero.jpg'
import Badge from '../../components/Badge'

function Chip({ title, subtitle, label, className }) {
  return (
    <div className={`bg-card/90 backdrop-blur rounded-xl px-5 py-2 flex items-center gap-2 shadow-lg ${className}`}>
      <span className="w-1 h-2 bg-primary shrink-0" />
      {label ? (
        <span className="text-xs text-foreground">{label}</span>
      ) : (
        <div className="text-xs">
          <span className="block font-bold text-foreground">{title}</span>
          <span className="block text-foreground/80">{subtitle}</span>
        </div>
      )}
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="py-16 md:py-24 about-page-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Column */}
          <div className="flex flex-col items-center justify-center lg:items-start lg:justify-start text-center lg:text-left gap-6">
            <Badge text={"IEEE Student Branch · Shorouk"} />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Engineering the Future, Together
            </h1>
            <p className="text-muted text-sm sm:text-base">
              We&apos;re a community of curious engineers, designers, and builders at the heart of campus — driving innovation through workshops, real-world projects, and a shared passion for technology.
            </p>
            <div className="flex justify-center lg:justify-start gap-3 flex-wrap">
              <a href='/signup' className="bg-primary-linear text-white font-semibold rounded-full px-6 py-3 flex items-center gap-2">
                Become a Member <ArrowRight size={18} />
              </a>
              <a href='/events' className="border border-border text-foreground rounded-full px-6 py-3 font-semibold">
                Explore Events
              </a>
            </div>
            <div className="flex gap-8 mt-2">
              <div>
                <span className="text-2xl md:text-3xl font-bold text-primary">350+</span>
                <span className="block text-xs text-muted">Active Members</span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-bold text-primary">60+</span>
                <span className="block text-xs text-muted">Events Hosted</span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-bold text-primary">8</span>
                <span className="block text-xs text-muted">Committees</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative rounded-2xl">
            <img
              src={VRPicture}
              alt="Person wearing VR headset working on robotics"
              className="mx-auto w-full lg:w-[80%] object-cover rounded-2xl"
            />

            <Chip title="350+" subtitle="Members" className="absolute top-4 -left-2 lg:left-4" />
            <Chip label="AI Workshop" className="absolute bottom-4 -left-2 lg:left-4" />
            <Chip label="Robotics Lab" className="absolute bottom-4 -right-2 lg:right-4" />
          </div>
        </div>
      </div>
    </section>
  )
}
