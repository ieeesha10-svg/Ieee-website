import React from 'react'

import HeroSection from '../sections/about/HeroAbout'
import ImpactStatsSection from '../sections/about/ImpactStatsSection'
import WhatWeDoSection from '../sections/about/WhatWeDoSection'
import CommitteesSection from '../sections/about/CommitteesSection'
import BoardSection from '../sections/about/BoardSection'
import CtaSection from '../sections/about/CtaSection'

function Wrapper({children}) {
	return <section className='py-16 md:py-24 odd:bg-white odd:dark:bg-card'>
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
			{children}
		</div>
	</section>
}

export default function AboutPage() {
  return (
		<div className='overflow-hidden'>
			<Wrapper>
      	<HeroSection />
			</Wrapper>

			<Wrapper>
        <ImpactStatsSection />
			</Wrapper>

			<Wrapper>
      	<WhatWeDoSection />
			</Wrapper>

			<Wrapper>
        <CommitteesSection />
			</Wrapper>

			<Wrapper>
      	<BoardSection />
			</Wrapper>

			<Wrapper>
				<CtaSection />
			</Wrapper>
    </div>
  )
}