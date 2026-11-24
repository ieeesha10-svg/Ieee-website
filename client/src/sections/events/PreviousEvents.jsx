import React from 'react'

import SectionHeader from "../../components/ui/SectionHeader";
import EventsListCard from "../../components/guest/events/EventsListCard";
import Pagination from "../../components/ui/Pagination";

export default function PreviousEvents({ events = [], loading, page = 1, totalPages = 1, onPageChange }) {
	return (
		<section id="previous-events" className="py-20">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<SectionHeader
					  title="Previous"
						highlight="Events"
						highlightColor="primary-dark"
						variant="light"
					  line="gradient"
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{loading ? (
						[1, 2, 3].map((i) => (
							<div key={i} className="rounded-3xl bg-card animate-pulse h-80" />
						))
					) : events.length > 0 ? (
						events.map((event) => (
							<EventsListCard key={event.id} {...event} type="previous" />
						))
					) : (
						/* Was a single line of muted text, which read as a broken
						   section rather than an intentional state. Mirrors the
						   upcoming section's empty state on the light background. */
						<div className="col-span-full flex flex-col items-center gap-3 py-10">
							<div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
								<img src="/logo.webp" alt="IEEE Logo" className="w-16 h-16 object-contain opacity-70" />
							</div>
							<p className="text-center text-lg uppercase font-gotham text-foreground">Our story starts here</p>
							<p className="text-center text-muted max-w-md">
								We haven&apos;t run any events yet. Once we do, they will be archived right here.
							</p>
						</div>
					)}
				</div>

				{!loading && <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />}
			</div>
		</section>
	)
}
