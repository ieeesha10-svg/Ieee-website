import React from 'react'

import SectionHeader from "../../components/SectionHeader";
import EventsListCard from "../../components/events/EventsListCard";

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

				{totalPages > 1 && !loading && (
					<div className="flex items-center justify-center gap-1.5 mt-10">
						<button
							onClick={() => onPageChange(page - 1)}
							disabled={page <= 1}
							className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-[#222936] text-muted hover:text-foreground hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							Prev
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<button
								key={p}
								onClick={() => onPageChange(p)}
								className={`w-8 h-8 text-xs font-medium rounded-lg border transition-colors ${
									page === p
										? "bg-primary text-white border-primary"
										: "border-gray-200 dark:border-[#222936] text-muted hover:text-foreground hover:border-primary"
								}`}
							>
								{p}
							</button>
						))}
						<button
							onClick={() => onPageChange(page + 1)}
							disabled={page >= totalPages}
							className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-[#222936] text-muted hover:text-foreground hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							Next
						</button>
					</div>
				)}
			</div>
		</section>
	)
}
