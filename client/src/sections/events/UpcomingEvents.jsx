import React from 'react'

// Components
import SectionHeader from "../../components/SectionHeader";
import EventsListCard from "../../components/EventsListCard";
// Images
import SectionBackground from '../../assets/backgrounds/tech-circuit-pattern.png'
import TableImage from '../../assets/images/events/table.jpg';
import TeamImage from '../../assets/images/events/team.jpg';
import WorkplaceImage from '../../assets/images/events/workplace.jpg';

const upcomingEvents = [
	{
		id: 0,
    image: TableImage,
    badge: "Technical",
    title: "Cybersecurity Workshop",
    dateTime: { day: "May 18", time: "6 PM" },
    description: "Learn penetration testing, ethical hacking, and cybersecurity fundamentals.",
  },
	{
		id: 1,
    image: TeamImage,
    badge: "Non-Technical",
    title: "Personal Branding Session",
    dateTime: { day: "May 22", time: "4 PM" },
    description: "Build your LinkedIn profile, improve communication, and develop your career identity.",
  },
	{
		id: 2,
    image: WorkplaceImage,
    badge: "Technical",
    title: "PCB Design Session",
    dateTime: { day: "June 1", time: "5 PM" },
    description: "Learn PCB fundamentals, circuit design, and hardware prototyping.",
  },
]

export default function UpcomingEvents({ events = upcomingEvents }) {
	
	return (
		<section id="upcoming-events"
			className="min-h-screen relative overflow-hidden py-20 bg-contain"
			style={{ backgroundImage: `url(${SectionBackground})` }}
		>
			{/* Overlay */}
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
				
				{/* Cards*/}
				<div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
					{events.map((event) => (
						<EventsListCard key={event.id} type="upcoming" {...event} />
					))}
				</div>

				{/* Countdown*/}
				<div className='mt-10 lg:mt-20 flex flex-col lg:flex-row gap-10 lg:gap-0 items-center justify-between rounded-2xl px-3.5 lg:px-7 py-4 lg:py-6 bg-primary-linear font-gotham shadow-2xl'>
					<div className='text-white text-center lg:text-left'>
						<p className='font-gotham-thin text-lg lg:text-[30px]'>coneference Date</p>
						<p className='text-3xl lg:text-[50px]'>counting time.....</p>
					</div>

					<div className='flex items-center *:flex *:flex-col *:gap-3 font-gotham text-white'>

						{[
						  ["04", "Weeks"],
						  ["06", "Days"],
						  ["14", "Hours"],
						  ["04", "Minutes"],
						].map(([value, label], index, arr) => (
						  <>
						    <div key={label}>
						      <span className='text-3xl sm:text-4xl md:text-5xl lg:text-7xl italic'>{value}</span>
						      <span className='sm:text-xl lg:text-3xl font-gotham-light'>{label}</span>
						    </div>
						    {index < arr.length - 1 && (
						      <span className="text-2xl sm:text-3xl md:text-4xl lg:text-7xl font-gotham-thin mx-3">/</span>
						    )}
						  </>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}