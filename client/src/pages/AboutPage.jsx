import React from 'react'

import HeroSection from '../sections/about/HeroAbout'
import ImpactStatsSection from '../sections/about/ImpactStatsSection'
import WhatWeDoSection from '../sections/about/WhatWeDoSection'
import CommitteesSection from '../sections/about/CommitteesSection'
import BoardSection from '../sections/about/BoardSection'
import CtaSection from '../sections/about/CtaSection'

export default function AboutPage() {
  return (
    <div className='overflow-hidden'>
      <HeroSection />
      <ImpactStatsSection />
      <WhatWeDoSection />
      <CommitteesSection />
      <BoardSection />
      <CtaSection />
    </div>
  )
}