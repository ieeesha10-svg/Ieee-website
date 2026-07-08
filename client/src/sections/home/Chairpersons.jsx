import React from "react";
import { Mail, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../../components/Badge";
import SectionHeader from "../../components/SectionHeader";
// Social icons
import linkedinIcon from "../../assets/images/chairpersons/linkedin.png";
import whatsappIcon from "../../assets/images/chairpersons/whatsapp.png";
// Chairpersons
import collabratecIcon from "../../assets/images/chairpersons/collabratec-logo.png";
import aliElsayedImg from "../../assets/images/chairpersons/ali-elsayed.jpg";
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

const COUNSELOR = {
  id: "counselor",
  name: "Dr. Mahmoud Abdelmohsen",
  role: "Counselor",
  description: "Guiding the student branch with years of academic and professional experience in engineering and technology.",
  image: "/images/Checker.png",
  socials: { linkedin: null, email: null, website: null },
};

const MEMBERS = [
  {
    id: 0,
    name: "Ali Elsayed",
    role: "Chairperson",
    description: "Leading the branch with a vision for innovation, collaboration, and technical excellence.",
    image: aliElsayedImg,
    socials: {
      linkedin: "https://www.linkedin.com/in/alli-elsayed",
      email: null,
      whatsapp: "https://wa.me/+201500331132",
      collabratec: "https://ieee-collabratec.ieee.org/app/p/AliElsayed1187445",
    },
  },
  {
    id: 1,
    name: "Reem Hendawy",
    role: "Vice Chairperson",
    description: "Supporting branch operations and driving engagement across all committees.",
    image: "/images/ieee-day.png",
    socials: { linkedin: null, email: null, website: null },
  },
  {
    id: 2,
    name: "Youssif Hany",
    role: "Secretary",
    description: "Managing communications, documentation, and coordinating branch activities.",
    image: "/images/ieee-day.png",
    socials: { linkedin: null, email: null, website: null },
  },
  {
    id: 3,
    name: "Alaa Mohamed",
    role: "Treasurer",
    description: "Overseeing budgets, sponsorships, and financial planning for the student branch.",
    image: "/images/ieee-day.png",
    socials: { linkedin: null, email: null, website: null },
  },
];

function PersonCard({ person }) {
  return (
    <div className="group relative flex flex-col bg-white dark:bg-[#1A1F2E] rounded-[10px] lg:rounded-[14px] shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)] lg:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transition-all duration-300 hover:-translate-y-1 lg:hover:-translate-y-2 h-full">
      <div className="hidden lg:block relative w-full aspect-square overflow-hidden bg-gray-200 dark:bg-gray-800">
        <img
          src={person.image}
          alt={person.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "/images/Checker.png"; }}
        />
      </div>

      <div className="flex flex-col items-center text-center p-3 lg:p-6 flex-1">
        <div className="flex flex-col items-center justify-start flex-1 mb-3 lg:mb-0">
          <h3 className="text-[#0A0A0A] dark:text-[#F2F2F2] text-[13px] lg:text-[18px] font-bold font-inter lg:font-lakes leading-tight mb-[4px] lg:mb-1">
            {person.name}
          </h3>
          <p className="text-[#155DFC] lg:text-[#0077CC] text-[10px] lg:text-[14px] font-medium font-inter lg:font-lakes leading-tight mb-[6px] lg:mb-3">
            {person.role}
          </p>
          <p className="text-[#4A5565] dark:text-[#9CA3AF] text-[9px] lg:text-[14px] font-inter lg:font-lakes leading-[1.4] lg:leading-relaxed line-clamp-3 lg:line-clamp-none">
            {person.description}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-auto">
          {person.socials?.linkedin && (
            <a href={person.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] rounded-full border-[0.5px] border-black/10 dark:border-white/20 bg-white flex items-center justify-center text-[#0A0A0A] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <img src={linkedinIcon} alt="LinkedIn Account" className="w-full h-full object-contain" />
            </a>
          )}
          {person.socials?.email && (
            <a href={person.socials.email} target="_blank" rel="noopener noreferrer" className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] rounded-full border-[0.5px] border-black/10 dark:border-white/20 bg-white flex items-center justify-center text-[#0A0A0A] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Mail size={12} strokeWidth={1.5} />
            </a>
          )}
          {person.socials?.whatsapp && (
            <a href={person.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] rounded-full border-[0.5px] border-black/10 dark:border-white/20 bg-white flex items-center justify-center text-[#0A0A0A] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <img src={whatsappIcon} alt="Whatsapp" className="w-full h-full object-contain" />
            </a>
          )}
          {person.socials?.collabratec && (
            <a href={person.socials.collabratec} target="_blank" rel="noopener noreferrer" className="w-[28px] lg:w-[37px] h-[28px] lg:h-[37px] flex items-center justify-center p-1">
              <img src={collabratecIcon} alt="Collabratec" className="w-full h-full object-contain" />
            </a>
          )}
          {person.socials?.website && (
            <a href={person.socials.website} target="_blank" rel="noopener noreferrer" className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] rounded-full border-[0.5px] border-black/10 dark:border-white/20 bg-white flex items-center justify-center text-[#0A0A0A] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Globe size={12} strokeWidth={1.5} />
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
      className="relative w-full py-16 lg:py-32 px-4 lg:px-6 bg-[#F2F2F2] dark:bg-[#0A0E1A] transition-colors duration-300 overflow-hidden flex flex-col justify-center items-center gap-[80px]"
    >
      <div className="absolute top-0 -left-[50px] w-[250px] lg:w-[400px] h-[250px] lg:h-[400px] bg-[#33B5FF] opacity-[0.05] blur-[32px] lg:blur-[67px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[20%] -right-[50px] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-[#33B5FF] opacity-[0.05] blur-[32px] lg:blur-[65px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center w-full">
        {/* Badge */}
        <Badge text="🏆 Leadership Team" className="mb-3 lg:mb-6 text-[10px] lg:text-[16px] px-3 lg:px-5 py-1 lg:py-1.5" />

        {/* Title */}
        <SectionHeader title="Meet Our" highlight="Chairpersons" highlightColor="primary-light" variant="light" />

        {/* Subtitle */}
        <p className="text-[#4A5565] dark:text-[#9CA3AF] text-[12px] lg:text-[24px] leading-[20px] lg:leading-[39px] font-lakes text-center max-w-[313px] lg:max-w-3xl mt-4 mb-8 lg:mb-16 transition-colors duration-300">
          Dedicated <span className="text-[#33B5FF]">leaders</span> driving
          innovation and excellence in our IEEE community
        </p>

        {/* Grid Cards */}
        <div className="w-full max-w-[360px] lg:max-w-none mx-auto grid grid-cols-2 gap-3 lg:gap-6">
          <PersonCard person={COUNSELOR} />
          <div className="grid grid-cols-2 gap-3 lg:gap-6">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 w-full items-center transition-opacity">
            {SPONSORS.map((s, i) => (
              <div key={i} className="flex items-center justify-center bg-white dark:bg-[#1a1f2e] rounded-xl p-4 h-24 lg:h-28">
                <img src={s.src} alt={s.alt} className="rounded-full max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
