import React from 'react'
import Badge from '../../components/ui/Badge'
import { MEMBERS } from '../../data/chairpersons'
import linkedinIcon from "../../assets/images/chairpersons/linkedin.webp";
import facebookIcon from "../../assets/images/chairpersons/facebook.webp";
import collabratecIcon from "../../assets/images/chairpersons/collabratec-logo.webp";

export default function BoardSection() {
  return (
    <section className="py-16 md:py-24 about-page-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge text={"Leadership"} />
          <h2 className="font-gotham text-3xl sm:text-4xl font-bold mt-4">
            Meet the <span className="text-primary">Executive Committee</span>
          </h2>
          <p className="text-muted mt-3">
            The students leading the branch this academic year.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {MEMBERS.map((m, i) => (
            <div key={i} style={{ boxShadow: '0 2px 6px -1px rgba(0,150,255,0.04), 0 4px 14px -4px rgba(0,150,255,0.03), 0 8px 28px -6px rgba(0,0,0,0.12)' }} className="bg-card rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              {/* Avatar */}
              <div className="h-32 sm:h-70 overflow-hidden bg-gray-200 dark:bg-gray-800">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="text-center py-4">
                <h3 className="font-bold text-foreground text-sm sm:text-base">{m.name}</h3>
                <p className="text-xs font-semibold text-primary uppercase mt-1">{m.role}</p>

                <div className="flex items-center justify-center gap-2 mt-3">
                  {m.socials?.facebook && (
                    <a href={m.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-7 lg:w-9 h-7 lg:h-9 rounded-full flex items-center justify-center">
                      <img src={facebookIcon} alt="facebook Account" className="w-full h-full object-contain" />
                    </a>
                  )}
                  {m.socials?.linkedin && (
                    <a href={m.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-7 lg:w-9 h-7 lg:h-9 rounded-full flex items-center justify-center">
                      <img src={linkedinIcon} alt="LinkedIn Account" className="w-full h-full object-contain" />
                    </a>
                  )}
                  {m.socials?.collabratec && (
                    <a href={m.socials.collabratec} target="_blank" rel="noopener noreferrer" className="w-7 lg:w-9 h-7 lg:h-9 flex items-center justify-center">
                      <img src={collabratecIcon} alt="Collabratec" className="w-full h-full object-contain" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
