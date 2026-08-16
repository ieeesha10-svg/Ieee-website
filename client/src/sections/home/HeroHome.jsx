import React, { useState } from 'react'
import { Link } from 'react-router-dom'
// Components
import Button from '../../components/ui/Button.jsx'
import ImageSkeleton from '../../components/skeletons/ImageSkeleton.jsx';
// Images
import HeroBackground from '../../assets/backgrounds/hero-bg.jpg';
import RocketIcon from '../../assets/icons/rocket.png'

export default function Hero() {
	// Dots that we will be mapping on them to display them randomly in the hero section
	const DOTS = [
		// Right top
		{ top: '8%', right: '10%', size: 'w-1.5 h-1.5', opacity: 'bg-white/30' },
		{ top: '5%', right: '20%', size: 'w-1 h-1', opacity: 'bg-white/20' },
		{ top: '12%', right: '15%', size: 'w-2 h-2', opacity: 'bg-white/15' },
		{ top: '3%', right: '30%', size: 'w-1 h-1', opacity: 'bg-white/25' },
		{ top: '18%', right: '8%', size: 'w-1.5 h-1.5', opacity: 'bg-white/20' },
		// Left
		{ top: '6%', left: '12%', size: 'w-1.5 h-1.5', opacity: 'bg-white/25' },
		{ bottom: '15%', left: '8%', size: 'w-1 h-1', opacity: 'bg-white/20' },
		// Bottom center
		{ bottom: '10%', left: '45%', size: 'w-1.5 h-1.5', opacity: 'bg-white/20' },
		{ bottom: '18%', left: '55%', size: 'w-1 h-1', opacity: 'bg-white/30' },
	];

	const [imgLoaded, setImgLoaded] = useState(false);

	return <section className='relative overflow-hidden bg-cover' style={{ backgroundImage: `url(${HeroBackground})` }}>
		{/* Overlay */}
		<div className='absolute inset-0 bg-primary/95 dark:bg-main/98' />

	  {/* Blurry glow circles */}
		<div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className='absolute top-[-80px] left-[-60px] w-[400px] h-[400px] rounded-full bg-white/5 blur-[100px]' />
      <div className='absolute bottom-[-100px] right-[-80px] w-[200px] h-[500px] rounded-full bg-white/5 blur-[120px]' />
      <div className='absolute top-1/2 left-1/3 w-75 h-75 rounded-full bg-white/5 blur-[80px]' />
    </div>

		<div className='relative z-10 flex flex-col items-center justify-around min-h-[calc(100vh-82px)] pb-20 lg:pb-10 py-10'>
			{/* Random white dots via SVG */}
			{DOTS.map((dot, i) => (
			  <div key={i} className={`absolute rounded-full bg-[#F2F2F2] dark:bg-[#9CA3AF] ${dot.size} ${dot.opacity}`} style={{ top: dot.top, bottom: dot.bottom, left: dot.left, right: dot.right }} />
			))}

			<div className='grid grid-cols-1 lg:grid-cols-2 items-center text-center md:text-left gap-10 md:gap-15 max-w-7xl'>

				{/* Left Section */}
				<div className='flex flex-col text-white gap-3 md:gap-5'>
					<span className='text-xs md:text-base rounded-4xl bg-white/20 border border-white/20 mx-auto md:mx-0 w-fit p-3'>:✨ Empowering Innovation Since 2016</span>
					<h2 className='text-4xl md:text-7xl font-gotham text-ceter md:text-left uppercase'>
						<p>Lead</p>
						<div>
							the <span className='text-primary-light'>vision</span>,
						</div>
						<div>
							be the <span className='text-primary-light'>future</span>
						</div>
					</h2>
					<p className='font-bold text-xs md:text-xl'>Join a vibrant community of innovators, engineers, and tech enthusiasts. Together, we're shaping the future through cutting-edge projects, workshops, and collaboration.</p>

					{/* Call-To-Action Buttons*/}
					<div className='flex gap-3 justify-center md:justify-start'>
						<Link to="/committees">
							<Button className='bg-white text-primary hover:bg-white/80 dark:text-white'>
								Get Started
							</Button>
						</Link>
						<Link to="/about">
							<button className='px-6 py-3 text-white rounded-lg border border-white hover:bg-white/15 transition-colors duration-300'>
								Learn More
							</button>
						</Link>
					</div>

					<div className='flex justify-center md:justify-start gap-30 font-light md:pr-10'>
						<div className='flex flex-col'>
							<span className='text-2xl md:text-4xl'>10+</span>
							<span className='text-sm'>Years</span>
						</div>
						<div className='flex flex-col'>
							<span className='text-2xl md:text-4xl'>200+</span>
							<span className='text-sm'>Events Hosted</span>
						</div>
					</div>

				</div>

				{/* Right Section - images & visuals */}
				<div className='relative p-0.5 rounded-3xl'>
					{!imgLoaded && <ImageSkeleton />}
					<img
					  src="https://res.cloudinary.com/xcdyzvmc/image/upload/v1785685478/ieee-family.jpg_ezqw29.jpg"
						alt="IEEE family photo"
						className="w-full rounded-3xl shadow-2xl border-2 border-white/50"
						onLoad={() => setImgLoaded(true)}
					 />
					<div className='absolute -bottom-5 -right-3 lg:-bottom-8 lg:-right-5 p-3.5 md:p-4.5 lg:p-6 flex items-center flex-col justify-center bg-main rounded-2xl'>
						<img src={RocketIcon} alt="Rocket Icon" className='w-6 h-6 md:w-12 md:h-12'/>
						<span className='mt-3 text-center text-primary text-[11px] md:text-sm'>Innovation Hub</span>
					</div>
				</div>
			</div>

			{/* Mouse Scroll Indicator */}
			<div className="absolute bottom-5 lg:bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
			  <div className="w-6 h-10 rounded-full border-2 border-white/60 flex justify-center pt-2">
			    <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" />
			  </div>
			</div>
		</div>
	</section>
}
