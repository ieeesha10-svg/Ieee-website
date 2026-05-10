import React from "react";
// Components
import SectionHeader from "../../components/SectionHeader";
// Images
import AboutImage from '../../assets/images/home/about-image.png'
// Icons
import TrophyIcon from '../../assets/icons/trophy.png'
import MedalIcon from '../../assets/icons/medal.png'
import LightningIcon from '../../assets/icons/lightning.png'

export default function About() {
	const CARDS_DATA = [
		{
			title: "Award Winning Student Chapter",
			body: "Recognized nationally for excellence in technical activities, innovation, and community engagement.",
			icon: TrophyIcon
		},
		{
			title: "IEEE Outstanding Student Branch",
			body: "Awarded for exceptional contribution to IEEE's mission of advancing technology and student development.",
			icon: MedalIcon
		},
		{
			title: "Most Active Student Branch",
			body: "Leading in organizing impactful events, workshops, competitions, and technical innovations.",
			icon: LightningIcon
		},
	]

	return <section id="about" className="max-w-7xl mx-auto py-20">

		{/* Section Header & Text */}
		<div className="text-center ">
			<div className="text-primary-dark mx-auto bg-primary-dark/10 w-fit py-1 px-7 mb-4 rounded-full">🏆 Award Winning Chapter</div>
			<SectionHeader
			  title="A legacy of"
				highlight="winning"
				highlightColor="primary-dark"
			  variant="light"
			  line="gradient"
			/>

			<p className="text-2xl mt-4">We are a <span className="text-primary-dark">dynamic community</span> dedicated to advancing technology for the benefit of humanity. Our branch empowers students to explore, innovate, and lead.</p>
		</div>

		<div className="grid grid-col-1 place-items-center lg:grid-cols-2 gap-20 mt-20">
			<div className="relative order-2 lg:order-1">
				<img src={AboutImage} className="rounded-3xl" alt="About Section's Picture" />
				<div className='absolute -bottom-4 -right-4 py-8 px-6 lg:py-10 lg:px-8 flex items-center flex-col justify-center text-white bg-brand-linear rounded-3xl'>
					<span className="text-3xl lg:text-5xl">500+</span>
					<span className="text-[9px] lg:text-lg mt-2">Proud Members</span>
					<div className="relative">
						{/* Blue circle above the members floating card*/}
						<span className="absolute -top-10 right-0 w-3 h-3 lg:w-6 lg:h-6 bg-[##33B5FF]" />
					</div>
				</div>
			</div>

			<div className="order-1 lg:order-2 flex flex-col gap-4">
				{CARDS_DATA.map((card, index) => {
					return <div key={index} className="flex items-center justify-center lg:justify-between gap-5 bg-card border border-border px-6 py-6 lg:px-10 lg:py-10 rounded-2xl shadow-2xl">
						{/* Card's Image*/}
						<div className="relative rounded-2xl p-3 bg-primary-linear">
							<img src={card.icon} className="w-16 mx-auto" alt="Card Icon" />
						</div>

						{/* Card's Text */}
						<div>
							<h3 className="text-lg lg:text-2xl">{card.title}</h3>
							<p className="text-sm md:text-base font-light mt-3">{card.body}</p>
						</div>
					</div>
				})}
			</div>
		</div>
	</section>
}
