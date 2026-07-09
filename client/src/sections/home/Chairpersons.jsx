import React from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/Badge";
import SectionHeader from "../../components/SectionHeader";
// Social icons
import linkedinIcon from "../../assets/images/chairpersons/linkedin.png";
import whatsappIcon from "../../assets/images/chairpersons/whatsapp.png";
import facebookIcon from "../../assets/images/chairpersons/facebook.png";
import collabratecIcon from "../../assets/images/chairpersons/collabratec-logo.png";
// Chairpersons
import { MEMBERS, COUNSELOR } from "../../data/chairpersons";
// Sponsors
import codeClouders from "../../assets/images/sponsers/code clouders.jpeg";
import edges from "../../assets/images/sponsers/edges.jpeg";
import eduvate from "../../assets/images/sponsers/EDUVATE.jpg";
import emas from "../../assets/images/sponsers/EMAS.png";
import haLogo from "../../assets/images/sponsers/HA logo.png";
import jetsolar from "../../assets/images/sponsers/jet-solar.png";
import tramAcademy from "../../assets/images/sponsers/tram-academy.JPG";
import kian from "../../assets/images/sponsers/kian.jpeg";
import neo from "../../assets/images/sponsers/neo (1).jpg";
import porto from "../../assets/images/sponsers/PORTO (1).jpg";
import seweddy from "../../assets/images/sponsers/SEWEDY (1).jpg";
import ult from "../../assets/images/sponsers/ULT.jpg";

const SPONSORS = [
  { src: codeClouders, alt: "Code Clouders" },
  { src: edges, alt: "Edges" },
  { src: eduvate, alt: "Eduvate" },
  { src: emas, alt: "EMAS" },
  { src: haLogo, alt: "HA Logo" },
  { src: jetsolar, alt: "JET SOLAR" },
  { src: tramAcademy, alt: "TRAM Academy" },
  { src: kian, alt: "Kian" },
  { src: neo, alt: "Neo" },
  { src: porto, alt: "Porto" },
  { src: seweddy, alt: "Sewedy" },
  { src: ult, alt: "ULT" },
];

function PersonCard({ person }) {
  return (
    <div className="group relative flex flex-col bg-white dark:bg-[#1A1F2E] rounded-[10px] lg:rounded-[14px] shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)] lg:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transition-all duration-400 hover:-translate-y-2 h-full">
      <div className="relative w-full aspect-square overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-t-2xl border-t-4 border-r-4 border-l-4 border-main group-hover:border-primary transition-all duration-500">
        <img
          src={person.image}
          alt={`${person.name} Image`}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-105"
        />
      </div>

      <div className="group-hover:bg-primary transition-colors duration-400 flex flex-col items-center justify-center text-center p-3 lg:p-6 flex-1">
        <div className="flex flex-col items-center justify-center flex-1 text-center mb-3 lg:mb-0 *:transition-colors *:duration-400">
          <h3 className="group-hover:text-white text-[13px] lg:text-[18px] font-bold leading-tight mb-1">
            {person.name}
          </h3>
          <p className="group-hover:text-white text-primary dark:text-primary-light text-[10px] lg:text-sm font-medium leading-tight mb-[6px] lg:mb-3">
            {person.role}
          </p>
          <p className="group-hover:text-white text-[#4A5565] dark:text-[#9CA3AF] text-[9px] lg:text-[14px] leading-[1.4] lg:leading-relaxed line-clamp-3 lg:line-clamp-none">
            {person.description}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-auto">
          {person.socials?.linkedin && (
            <a href={person.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] rounded-full flex items-center justify-center">
              <img src={linkedinIcon} alt="LinkedIn Account" className="w-full h-full object-contain" />
            </a>
          )}
          {person.socials?.facebook && (
            <a href={person.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] rounded-full flex items-center justify-center">
              <img src={facebookIcon} alt="facebook Account" className="w-full h-full object-contain" />
            </a>
          )}
          {person.socials?.whatsapp && (
            <a href={person.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] rounded-full flex items-center justify-center">
              <img src={whatsappIcon} alt="Whatsapp" className="w-full h-full object-contain" />
            </a>
          )}
          {person.socials?.collabratec && (
            <a href={person.socials.collabratec} target="_blank" rel="noopener noreferrer" className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] flex items-center justify-center">
              <img src={collabratecIcon} alt="Collabratec" className="w-full h-full object-contain" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Team() {

  return (
    <section
      id="team"
      className="relative w-full py-16 lg:py-32 px-4 lg:px-6 bg-main transition-colors duration-300 overflow-hidden flex flex-col justify-center items-center gap-[80px]"
    >
      <div className="absolute top-0 -left-[50px] w-[250px] lg:w-[400px] h-[250px] lg:h-[400px] bg-[#33B5FF] opacity-[0.05] blur-[32px] lg:blur-[67px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[20%] -right-[50px] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-[#33B5FF] opacity-[0.05] blur-[32px] lg:blur-[65px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center w-full">
        {/* Badge */}
        <Badge text="🏆 Leadership Team" className="mb-3 lg:mb-6 text-[10px] lg:text-[16px] px-3 lg:px-5 py-1 lg:py-1.5" />

        {/* Title */}
				<div className="text-center mb-20">
	     		<SectionHeader title="Meet Our" highlight="Chairpersons" highlightColor="primary-light" variant="light" />
	        <p className="text-[#4A5565] dark:text-[#9CA3AF] lg:text-2xl mt-4">
	          Dedicated <span className="text-[#33B5FF]">leaders</span> driving
	          innovation and excellence in our IEEE community
	        </p>
				</div>

        {/* Grid Cards */}
        <div className="w-full max-w-[360px] lg:max-w-none mx-auto space-y-3 lg:space-y-6">
          <div className="lg:max-w-sm mx-auto">
            <PersonCard person={COUNSELOR} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {MEMBERS.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </div>

        <div className="w-full flex justify-center mt-12 lg:mt-16">
          <Link
            to="/crew"
            className="bg-[#0077CC] hover:bg-[#005FA3] text-white font-lakes text-[14px] lg:text-[16px] px-6 py-3 lg:px-8 lg:py-4 rounded-[8px] lg:rounded-[10px] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            More Info About Our Crew
          </Link>
        </div>

        {/* Sponsors Section */}
        <div className="mt-12 lg:mt-24 w-full max-w-[394px] lg:max-w-none flex flex-col items-center bg-transparent lg:bg-black/5 dark:lg:bg-white/10 lg:border-[0.5px] border-transparent lg:border-black/10 dark:lg:border-white/20 rounded-[12px] lg:rounded-3xl py-8 lg:py-12 px-4 lg:px-8 transition-colors duration-300">
          <h3 className="text-[#1A1A1A] dark:text-[#F2F2F2] text-[18px] lg:text-[36px] font-lakes mb-8 lg:mb-12 text-center transition-colors duration-300">
            OUR PRESTIGIOUS SPONSORS
          </h3>
          <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="inline-flex animate-marquee hover:[animation-play-state:paused]">
              <div className="flex flex-shrink-0">
                {SPONSORS.map((s, i) => (
                  <div key={i} className="mr-6 lg:mr-8 flex items-center justify-center bg-white dark:bg-[#1a1f2e] rounded-xl p-4 h-24 lg:h-28 w-[140px] lg:w-[180px]">
                    <img src={s.src} alt={s.alt} className="rounded-full max-h-full max-w-full object-contain" />
                  </div>
                ))}
              </div>
              <div className="flex flex-shrink-0">
                {SPONSORS.map((s, i) => (
                  <div key={`dup-${i}`} className="mr-6 lg:mr-8 flex items-center justify-center bg-white dark:bg-[#1a1f2e] rounded-xl p-4 h-24 lg:h-28 w-[140px] lg:w-[180px]">
                    <img src={s.src} alt={s.alt} className="rounded-full max-h-full max-w-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
