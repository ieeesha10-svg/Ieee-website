import React from 'react'
// Components
import Button from '../../components/Button.jsx'
// Images
import HeroBackground from '../../assets/backgrounds/hero-bg.jpg';
import VRSectorHero from '../../assets/vr-engineer-robotics-hero.jpg';
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
	  <div className='absolute top-[-80px] left-[-60px] w-[400px] h-[400px] rounded-full bg-white/5 blur-[100px]' />
	  <div className='absolute bottom-[-100px] right-[-80px] w-[200px] h-[500px] rounded-full bg-white/5 blur-[120px]' />
	  <div className='absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-white/5 blur-[80px]' />

		{/* Random white dots via SVG */}
		<div className='relative z-10 flex flex-col items-center justify-around min-h-[calc(100vh-82px)]'>
			{DOTS.map((dot, i) => (
			  <div key={i} className={`absolute rounded-full bg-[#F2F2F2] dark:bg-[#9CA3AF] ${dot.size} ${dot.opacity}`} style={{ top: dot.top, bottom: dot.bottom, left: dot.left, right: dot.right }} />
			))}

			<div className='grid grid-cols-2 place-items-center gap-20 max-w-7xl'>

				{/* Left Section */}
				<div className='flex flex-col text-white gap-5'>
					<span className='rounded-4xl bg-white/20 border border-white/20 w-fit p-3'>:✨ Empowering Innovation Since 2010</span>
					<h2 className='text-7xl font-gotham uppercase *:block'>
						<span>EMPOWERING</span>
						<span className='text-primary-light'>INNOVATION,</span>
						<span>GROWTH</span>
						<span>INSPIRING</span>
					</h2>
					<p className='font-bold text-xl'>Join a vibrant community of innovators, engineers, and tech enthusiasts. Together, we're shaping the future through cutting-edge projects, workshops, and collaboration.</p>

					{/* Call-To-Action Buttons*/}
					<div className='flex gap-3'>
						<Button>
							Get Started
						</Button>
						<Button variant='outline'>
							Learn More
						</Button>
					</div>
					
					<div className='flex justify-between *:flex *:flex-col [&_span:first-child]:text-4xl [&_span:first-child]:font-sans font-light [&_span:last-child]:text-sm'>
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
				<div className='rounded-3xl
					bg-transparent
                backdrop-blur-2xl 
                border-4 border-white/30 relative'>
					<img src={VRSectorHero} alt="Teen Doing Robotics Experiments" className='w-146 h-150 rounded-3xl' />
					<div className='absolute -bottom-2.5 -right-7 flex items-center flex-col p-10 bg-main rounded-2xl'>
						<img src={RocketIcon} alt="Rocket Icon" className='w-12 h-12'/>
						<span className='mt-3 text-center text-primary'>Innovation Hub</span>
					</div>
				</div>
			</div>

		</div>
	</section>
}
