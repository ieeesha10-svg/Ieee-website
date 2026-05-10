import React from 'react'
import { Link } from 'react-router-dom';

import HeroImage from '../../assets/images/events/events-hero.jpg';
import Button from '../../components/Button';
 
export default function EventsHero() {
	return <section id="events-hero" className="py-10 min-h-[calc(100vh-var(--navbar-height))] grid place-items-center gap-20 grid-cols-1 lg:grid-cols-2 text-center md:text-left max-w-7xl mx-auto">

		  {/* Bottom shadow overlay */}
		  {/* <div className="absolute bottom-0 left-0 right-0 h-8 shadow-[0px_4px_6px_6px_#00000040] pointer-events-none" />*/}

			{/* Left Section */}
			<div className='flex flex-col gap-3 md:gap-5'>
				<h2 className='text-4xl md:text-7xl font-gotham text-ceter md:text-left uppercase *:block'>
					<span>Empowering</span>
					<div>
						<span className='text-primary-light'>innovation</span>
					</div>
					<span>trough</span>
					<span>events</span>
				</h2>
				<p style={{ maxWidth: '400px' }} className='font-medium text-sm text-muted dark:text-foreground md:text-xl'>
					Discover technical workshops, hackathons, competitions, and networking experiences designed to inspire future engineers and innovators.
				</p>

				{/* Call-To-Action Buttons*/}
				<div className='*:text-lg *:lg:text-xl flex gap-3 justify-center md:justify-start mt-5 *:px-6 *:py-3 lg:*:px-12 lg:*:py-6 *:rounded-xl'>
					<button
						className='font-light text-primary hover:bg-white/40 hover:text-primary-dark dark:text-white hover:dark:text-white dark:bg-[#2563EB] hover:dark:bg-[#2563EB]/60 transition duration-300'
						style={{ boxShadow: '0px 0px 12px #00C0E8B2, 0px 10px 15px #0000001A, 0px 4px 6px #0000001A' }}
					>
							<Link to='/'>
									Explore Events
							</Link>
					</button>
					{/* bg-primary-linear*/}
					<Button className='bg-linear-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary transition text-white dark:hover:bg-white/10 hover:text-white dark:bg-main dark:from-transparent dark:to-transparent hover:dark:from-transparent hover:dark:to-transparent dark:border dark:border-border'>
						<Link to='/signup'>
								Become a Member
						</Link>
					</Button>
				</div>

			</div>

			{/* Right Section - images & card */}
			<div className='mx-10 md:mx-0 rounded-2xl shadow-[0px_10px_30px_0px_#2563EB1F] dark:shadow-[0px_0px_40px_0px_#2563EB33]rounded-3xl dark:bg-[#0F172ACC] border border-[#E2E8F0]/8'>
				<img
				  src={HeroImage}
				  className="w-full h-full object-cover rounded-3xl"
				/>
				<div className='flex flex-col gap-6 py-7 px-5'>
					{/* Badge */}
					<div className='text-[10px] lg:text-sm text-[#2563EB] bg-[#2563EB]/20 dark:text-primary-light dark:bg-primary-light/20 rounded-full w-fit px-3.5 py-2'>
						Upcoming Event
					</div>

					{/* Card Title*/}
					<h3 className='font-gotham text-xl lg:text-3xl'>
						IEEE AI Bootcamp
					</h3>

					{/* Card Body*/}
					<p className='text-muted text-xs lg:text-base'>
						Join our hands-on AI workshop exploring machine learning, embedded systems, and future technologies. 
					</p>
				</div>
			</div>
	</section>
}