import React, {useState} from 'react'
import { Link } from 'react-router-dom';

import Button from '../../components/ui/Button';
import ImageSkeleton from '../../components/skeletons/ImageSkeleton.jsx';
import { useAuth } from '../../context/AuthContext';

export default function EventsHero({ featuredEvent, loading }) {
  const { user } = useAuth();
  const [imgLoaded, setImgLoaded] = useState(false);

  const title = featuredEvent?.title || "No Upcoming Events";
  const description = featuredEvent?.description || "Stay tuned, we're cooking up something exciting. Check back soon for our next event!";
  const eventImage = featuredEvent?.image || "";
  const initials = (title || "").split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "E";

	return <section id="events-hero" className="py-10 min-h-[calc(100vh-var(--navbar-height))] grid place-items-center gap-20 grid-cols-1 lg:grid-cols-2  max-w-7xl mx-auto px-4">

			{/* Left Section */}
			<div className='flex flex-col gap-3 md:gap-5 text-center md:text-left'>
				<h2 className='text-4xl md:text-7xl font-gotham text-ceter md:text-left uppercase *:block'>
					<span>Empowering</span>
					<div>
						<span className='text-primary-light'>innovation</span>
					</div>
					<span>trough</span>
					<span>events</span>
				</h2>
				<p className='max-w-[350px] lg:max-w-[550px] mx-auto lg:mx-0 font-medium text-sm text-muted dark:text-foreground md:text-xl'>
					Discover technical workshops, hackathons, competitions, and networking experiences designed to inspire future engineers and innovators.
				</p>

				{/* Call-To-Action Buttons*/}
				<div className='*:text-lg *:lg:text-xl flex flex-col lg:flex-row gap-4 lg:mx-0 w-[80%] mx-auto justify-center md:justify-start mt-5'>
					<a href='#upcoming-events'>
						<button
							className='px-6 py-3 lg:px-12 lg:py-6 w-full whitespace-nowrap rounded-xl font-light text-primary hover:bg-white/40 hover:text-primary-dark dark:text-white hover:dark:text-white dark:bg-[#2563EB] hover:dark:bg-[#2563EB]/60 transition duration-300'
							style={{ boxShadow: '0px 0px 12px #00C0E8B2, 0px 10px 15px #0000001A, 0px 4px 6px #0000001A' }}
						>
							Explore Events
						</button>
					</a>
					{
						!user && (
							<Link to='/registration'>
								<Button className='w-full whitespace-nowrap rounded-xl px-6 py-3 lg:px-12 lg:py-6 bg-linear-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary transition text-white dark:hover:bg-white/10 hover:text-white dark:bg-main dark:from-transparent dark:to-transparent hover:dark:from-transparent hover:dark:to-transparent dark:border dark:border-border'>
											Become a Member
								</Button>
							</Link>
						)
					}
				</div>

			</div>

			{/* Right Section - images & card */}
			<div className='w-full mx-10 md:mx-0 rounded-2xl shadow-[0px_10px_30px_0px_#2563EB1F] dark:shadow-[0px_0px_40px_0px_#2563EB33]rounded-3xl dark:bg-[#0F172ACC] border border-[#E2E8F0]/8 overflow-hidden'>
				{loading && !featuredEvent ? (
					<div className="animate-pulse">
						<div className="h-64 md:h-80 bg-white/10" />
						<div className='flex flex-col gap-4 py-7 px-5'>
							<div className="h-5 w-24 rounded-full bg-white/10" />
							<div className="h-7 w-48 rounded-lg bg-white/10" />
							<div className="h-4 w-full rounded-lg bg-white/10" />
							<div className="h-4 w-3/4 rounded-lg bg-white/10" />
						</div>
					</div>
				) : (
					<>
						<div className='relative h-64 md:h-80'>
							{eventImage && !imgLoaded && <ImageSkeleton />}
							{eventImage ? (
								<img
									src={eventImage}
									alt={title}
									onLoad={() => setImgLoaded(true)}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
									<span className="text-6xl font-bold text-primary/30">{initials}</span>
								</div>
							)}
						</div>
						<div className='flex flex-col gap-6 py-7 px-5'>
							<div className='text-[10px] lg:text-sm text-[#2563EB] bg-[#2563EB]/20 dark:text-primary-light dark:bg-primary-light/20 rounded-full w-fit px-3.5 py-2'>
								Upcoming Event
							</div>
							<h3 className='font-gotham text-xl lg:text-3xl'>
								{title}
							</h3>
						<p className='text-muted text-xs lg:text-base line-clamp-3'>
							{description}
						</p>
						</div>
					</>
				)}
			</div>
	</section>
}
