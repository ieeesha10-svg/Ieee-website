import React from 'react'

import SectionHeader from "../../components/SectionHeader";
import EventsListCard from "../../components/events/EventsListCard";
import Pagination from "../../components/events/Pagination";

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
						<p className="col-span-full text-muted text-center text-lg py-10">
							No previous events yet.
						</p>
					)}
				</div>

				{!loading && <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />}
			</div>
		</section>
	)
}
