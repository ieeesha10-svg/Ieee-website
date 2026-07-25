import React from 'react'

import SectionHeader from "../../components/SectionHeader";
import EventsListCard from "../../components/events/EventsListCard";
import SectionBackground from '../../assets/backgrounds/tech-circuit-pattern.png'
// import EventCountdown from '../../components/events/EventCountdown';

export default function UpcomingEvents({ events = [], loading, page = 1, totalPages = 1, onPageChange }) {
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
					<p className="text-white text-center text-xl md:text-2xl mt-4">
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
					<div className="col-span-full flex flex-col items-center gap-3 py-10">
						<div className="p-3 rounded-full bg-white/10 flex items-center justify-center text-2xl">
							<img src="/logo.png" className="w-20 h-20 object-contain" />
						</div>
						<p className="text-white/80 text-center text-lg uppercase font-gotham">Something exciting is brewing...</p>
						<p className="text-white/50 text-center">No upcoming events yet — but stay tuned, we're just getting started!</p>
					</div>
					)}
				</div>

    		{totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-1.5 mt-10">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/20 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 text-xs font-medium rounded-lg border transition-colors ${
                  page === p
                    ? "bg-white text-primary border-white"
                    : "border-white/20 text-white hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/20 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
				
      	{/* <EventCountdown events={events} />*/}
			</div>
		</section>
	)
}
