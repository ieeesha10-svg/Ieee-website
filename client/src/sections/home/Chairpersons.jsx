import React from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import SectionHeader from "../../components/ui/SectionHeader";
import PersonCard from "../../components/guest/home/PersonCard";
import Sponsors from "./Sponsors";
// Chairpersons
import { MEMBERS, COUNSELOR } from "../../data/chairpersons";

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
        <Sponsors />
      </div>
    </section>
  );
}
