import React from 'react'

// Components
import SectionHeader from "../../components/SectionHeader";
import EventsListCard from "../../components/EventsListCard";

// Images
import AiLaptopImage from '../../assets/images/events/ai-laptop.jpg';
import WorkplaceImage from '../../assets/images/events/meeting.png';
import TableImage from '../../assets/images/events/table.jpg';

const previousEvents = [
  {
    type: "previous",
    image: AiLaptopImage,
    title: "Robotics Workshop",
    attendees: "250+",
    description: "Students explored robotics systems, sensors, and automation technologies.",
  },
  {
    type: "previous",
    image: WorkplaceImage,
    title: "Engineering Summit",
    attendees: "500+",
    description: "Industry experts discussed innovation, entrepreneurship, and future engineering trends.",
  },
  {
    type: "previous",
    image: TableImage,
    title: "UI/UX Bootcamp",
    attendees: "320+",
    description: "Learn penetration testing, ethical hacking, and cybersecurity fundamentals.",
  },
]

export default function PreviousEvents({ events = previousEvents }) {
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
					{events.map((event, index) => (
						<EventsListCard key={index} type="previous" {...event} />
					))}
				</div>
			</div>
		</section>
	)
}