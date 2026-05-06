import React from "react";
// Components
import SectionHeader from "../../components/SectionHeader";
// Images
import AboutImage from '../../assets/about-image.png'
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

		<div className="grid grid-col-1 place-items-center md:grid-cols-2 gap-10 mt-20">
				<img src={AboutImage} className="rounded-3xl" alt="About Section's Picture" />

			<div className="flex flex-col gap-4">
				{CARDS_DATA.map((card, index) => {
					return <div key={index} className="px-10 py-10 flex items-center justify-center gap-5 rounded-2xl shadow-2xl">
						{/* Card's Image*/}
						<div className="w-16 rounded-2xl p-3 bg-linear-to-r from-primary-dark to-primary">
							<img src={card.icon} className="w-8 mx-auto" alt="Card Icon" />
						</div>

						{/* Card's Text */}
						<div>
							<h3 className="text-2xl">{card.title}</h3>
							<p className="font-light">{card.body}</p>
						</div>
					</div>
				})}
			</div>
		</div>
	</section>
}