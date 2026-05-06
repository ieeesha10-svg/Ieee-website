import React from "react";
// Components
import SectionHeader from "../../components/SectionHeader";
// Images
import SectionBackground from '../../assets/backgrounds/tech-circuit-pattern.png'
// Icons
import LaptopIcon from '../../assets/icons/laptop.png'
import FlashIcon from '../../assets/icons/flash.png'
import BotIcon from '../../assets/icons/ai.png'
import GlobeIcon from '../../assets/icons/globe.png'
import HospitalIcon from '../../assets/icons/hospital.png'
import ChapterCard from "../../components/ChapterCard";

const CHAPTERS_DATA = [
  {
    title: "Computer Society",
    icon: LaptopIcon,
    branch: "IEEE CS",
    body: "Empowering students with the latest in software development, AI, and computing technologies to lead the digital transformation.",
		activeMembers: 150,
		bgColor: {from: '#2B7FFF', to: '#155DFC'},
  },
  {
    title: "Power & Energy",
    icon: FlashIcon,
    branch: "IEEE PES",
    body: "Building intelligent robots and exploring automation technologies.",
    activeMembers: 120,
		bgColor: {from: '#F0B100', to: '#FF6900'},
  },
  {
    title: "Robotics & Automation",
    icon: BotIcon,
    branch: "IEEE RAS",
    body: "Focusing on renewable energy systems and power grid innovation.",
    activeMembers: 100,
    bgColor: {from: '#901BED', to: '#4814C2'},
  },
  {
    title: "Communications",
    icon: GlobeIcon,
    branch: "IEEE ComSoc",
    body: "Merging technology with healthcare through medical device projects.",
    activeMembers: 90,
    bgColor: {from: '#00C950', to: '#00BC7D'},
  },
  {
    title: "Women in Engineering",
    icon: HospitalIcon,
    branch: "IEEE EMBS",
    body: "Empowering women in STEM through mentorship and community events.",
    activeMembers: 80,
    bgColor: {from: '#FB2C36', to: '#FF2056'},
  },
];

export default function Chapters() {

	return <section id="chapters" className="relative min-h-screen overflow-hidden py-20 bg-contain" style={{ backgroundImage: `url(${SectionBackground})`}}>
		{/* Overlay */}
		<div className='absolute inset-0 bg-primary/97 dark:bg-main/98' />
		
		{/* Section Header & Text */}
		<div className="relative z-10">
			<div className="text-center">
				<SectionHeader
				  title="Our"
					highlight="chapters"
					highlightColor="primary-light"
				  variant="dark"
				  line="white"
				/>
				<p className="text-white text-2xl mt-4">Explore our diverse technical chapters, each focus on advancing specialized fields of technology.</p>
			</div>
	
			{/* Cards */}
			<div className="max-w-7xl mx-auto mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{CHAPTERS_DATA.map((chapter, index) => {
					return <ChapterCard key={index}
						title={chapter.title}
						icon={chapter.icon}
						branch={chapter.branch}
						body={chapter.body}
						activeMembers={chapter.activeMembers}
						bgColor={chapter.bgColor}
					/>
				})}
			</div>

		</div>
	</section>
}
