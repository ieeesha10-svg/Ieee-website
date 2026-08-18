import React from 'react'
import Badge from '../../components/ui/Badge'
import SectionHeader from '../../components/ui/SectionHeader'
import SectionIntro from '../../components/ui/SectionIntro'
import { MEMBERS } from '../../data/chairpersons'
import linkedinIcon from "../../assets/images/chairpersons/linkedin.webp";
import facebookIcon from "../../assets/images/chairpersons/facebook.webp";
import collabratecIcon from "../../assets/images/chairpersons/collabratec-logo.webp";

export default function BoardSection() {
  return (
    <>
      {/* Header */}
      <SectionIntro>
        <Badge text={"Leadership"} />
        <SectionHeader
          title="Meet the"
          highlight="Executive Committee"
          highlightColor="primary"
          variant="light"
          className="mt-4"
        />
        <p className="text-muted mt-3">
          The students leading the branch this academic year.
        </p>
      </SectionIntro>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MEMBERS.map((m, i) => (
          <div key={i} className="bg-card rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-card">
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
    </>
  )
}
