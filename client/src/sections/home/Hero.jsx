import React from 'react'
// Components
import Button from '../../components/Button.jsx'
// Images
import HeroBackground from '../../assets/backgrounds/hero-bg.jpg';
import VRSectorHero from '../../assets/images/home/vr-engineer-robotics-hero.jpg';
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
		{ bottom: '25%', left: '18%', size: 'w-2 h-2', opacity: 'bg-white/15' },
		// Bottom center
		{ bottom: '10%', left: '45%', size: 'w-1.5 h-1.5', opacity: 'bg-white/20' },
		{ bottom: '18%', left: '55%', size: 'w-1 h-1', opacity: 'bg-white/30' },
	];

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

			<div className='grid grid-cols-1 lg:grid-cols-2 text-center md:text-left gap-10 md:gap-15 max-w-7xl'>

				{/* Left Section */}
				<div className='flex flex-col text-white gap-3 md:gap-5'>
					<span className='text-xs md:text-base rounded-4xl bg-white/20 border border-white/20 mx-auto md:mx-0 w-fit p-3'>:✨ Empowering Innovation Since 2010</span>
					<h2 className='text-4xl md:text-7xl font-gotham text-ceter md:text-left uppercase *:block'>
						<span>EMPOWERING</span>
						<div>
							<span className='text-primary-light'>INNOVATION</span>
							,
						</div>
						<span>GROWTH</span>
						<span>INSPIRING</span>
					</h2>
					<p className='font-bold text-xs md:text-xl'>Join a vibrant community of innovators, engineers, and tech enthusiasts. Together, we're shaping the future through cutting-edge projects, workshops, and collaboration.</p>

					{/* Call-To-Action Buttons*/}
					<div className='flex gap-3 justify-center md:justify-start'>
						<Button>
							Get Started
						</Button>
						<Button variant='outline'>
							Learn More
						</Button>
					</div>

					<div className='flex justify-center gap-10 md:justify-between *:flex *:flex-col
						[&_span:first-child]:text-2xl md:[&_span:first-child]:text-4xl [&_span:first-child]:font-sans
						font-light md:pr-10
						[&_span:last-child]:text-sm'
					>
						<div>
							<span>500+</span>
							<span>Members</span>
						</div>
						<div>
							<span>100+</span>
							<span>Events</span>
						</div>
						<div>
							<span>15+</span>
							<span>Awards</span>
						</div>
					</div>

				</div>

				{/* Right Section - images & visuals */}
				<div className='relative p-0.5 rounded-3xl backdrop-blur-md shadow-2xl border-transparent bg-linear-to-br from-white/40 to-transparent bg-origin-border'>
					<img
					  src={VRSectorHero}
					  className="w-full h-full object-cover rounded-3xl"
					  style={{
					    backgroundImage: `url(${VRSectorHero})`,
						}} />
					<div className='absolute -bottom-2.5 -right-4 lg:-right-6 w-20 h-18 md:w-42 md:h-34 flex items-center flex-col justify-center bg-main rounded-2xl'>
						<img src={RocketIcon} alt="Rocket Icon" className='w-6 h-6 md:w-12 md:h-12'/>
						<span className='mt-3 text-center text-primary text-[8px] md:text-sm'>Innovation Hub</span>
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
