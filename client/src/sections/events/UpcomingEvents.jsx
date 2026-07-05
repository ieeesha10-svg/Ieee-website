import React from 'react'

import SectionHeader from "../../components/SectionHeader";
import EventsListCard from "../../components/EventsListCard";
import SectionBackground from '../../assets/backgrounds/tech-circuit-pattern.png'

export default function UpcomingEvents({ events = [], loading }) {
	return (
		<section id="upcoming-events"
			className="min-h-screen relative overflow-hidden py-20 bg-contain"
			style={{ backgroundImage: `url(${SectionBackground})` }}
		>
			<div className='absolute inset-0 bg-primary/97 dark:bg-main/98' />
			
			<div className='relative z-10 container mx-auto px-4'>
				<div className="text-center mb-12">
					<SectionHeader
						title="Upcoming"
						highlight="Events"
						highlightColor="primary-light"
						variant="dark"
						line="white"
					/>
					<p className="text-white text-center text-3xl mt-4">
						Register now for upcoming IEEE activities and workshops.
					</p>
				</div>
				
				<div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
					{loading ? (
						[1, 2, 3].map((i) => (
							<div key={i} className="rounded-3xl bg-white/10 animate-pulse h-80" />
						))
					) : events.length > 0 ? (
						events.map((event) => (
							<EventsListCard key={event.id} {...event} type="upcoming" />
						))
					) : (
						<p className="col-span-full text-white/60 text-center text-lg py-10">
							No upcoming events at the moment. Check back soon!
						</p>
					)}
				</div>
			</div>
		</section>
	)
}
