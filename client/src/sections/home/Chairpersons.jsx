import React, { useState, useEffect } from "react";
import { Linkedin, Mail, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

export default function Team() {
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const response = await api.get("/crew");

        const filteredCrew = response.data.filter((member) => {
          const position = (member.position || member.role || "").toLowerCase();
          return position.includes("xcom") || position.includes("head");
        });

        const formattedTeam = filteredCrew.map((member) => ({
          id: member._id || member.id,
          name: member.name || "Unknown Member",
          role: member.role || member.position || "Member",
          description: member.description || "No description provided.",
          image: member.image || "/images/avatar.jpg",
          socials: {
            linkedin: member.socials?.linkedin || member.linkedin || null,
            email: member.socials?.email || member.email || null,
            website: member.socials?.website || member.website || null,
          },
        }));

        setTeam(formattedTeam);
      } catch (error) {
        console.error("Error fetching crew members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrew();
  }, []);

  return (
    <section
      id="team"
      className="relative w-full py-16 lg:py-32 px-4 lg:px-6 bg-[#F2F2F2] dark:bg-[#0A0E1A] transition-colors duration-300 overflow-hidden flex flex-col justify-center items-center gap-[80px]"
    >
      <div className="absolute top-0 -left-[50px] w-[250px] lg:w-[400px] h-[250px] lg:h-[400px] bg-[#33B5FF] opacity-[0.05] blur-[32px] lg:blur-[67px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[20%] -right-[50px] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-[#33B5FF] opacity-[0.05] blur-[32px] lg:blur-[65px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center w-full">
        {/* Badge */}
        <div className="bg-[#0077CC]/10 text-[#0077CC] font-lakes rounded-full px-3 lg:px-5 py-1 lg:py-1.5 text-[10px] lg:text-[16px] mb-3 lg:mb-6 flex items-center gap-1 lg:gap-2">
          <span>🏆</span> Leadership Team
        </div>

        {/* Title */}
        <h2 className="text-[36px] lg:text-[72px] font-gotham font-medium text-[#1A1A1A] dark:text-[#F2F2F2] mb-1 lg:mb-4 text-center leading-[36px] lg:leading-tight transition-colors duration-300">
          Meet Our <br className="lg:hidden" />
          <span className="text-[#0077CC] dark:text-[#33B5FF]">
            Chairpersons
          </span>
        </h2>

        {/* Decorative Line */}
        <div className="w-[50px] lg:w-[100px] h-[3px] lg:h-[6px] bg-gradient-to-r from-[#0077CC] to-[#33B5FF] rounded-full mt-2 mb-4 lg:mb-8" />

        {/* Subtitle */}
        <p className="text-[#4A5565] dark:text-[#9CA3AF] text-[12px] lg:text-[24px] leading-[20px] lg:leading-[39px] font-lakes text-center max-w-[313px] lg:max-w-3xl mb-8 lg:mb-16 transition-colors duration-300">
          Dedicated <span className="text-[#33B5FF]">leaders</span> driving
          innovation and excellence in our IEEE community
        </p>

        {/* Grid Cards */}
        {isLoading ? (
          <div className="w-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#33B5FF]"></div>
          </div>
        ) : team.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No Chairpersons or Heads found.
          </div>
        ) : (
          <div className="w-full max-w-[360px] lg:max-w-none mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {team.map((person) => (
              <div
                key={person.id}
                className="group relative flex flex-col bg-white dark:bg-[#1A1F2E] rounded-[10px] lg:rounded-[14px] shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)] lg:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transition-all duration-300 hover:-translate-y-1 lg:hover:-translate-y-2 h-full"
              >
                <div className="hidden lg:block relative w-full aspect-square overflow-hidden bg-gray-200 dark:bg-gray-800">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/images/Checker.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 gap-3">
                    {person.socials?.linkedin && (
                      <a
                        href={person.socials.linkedin}
                        className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-gray-900 hover:bg-white transition-colors"
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
                    {person.socials?.email && (
                      <a
                        href={person.socials.email}
                        className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-gray-900 hover:bg-white transition-colors"
                      >
                        <Mail size={18} />
                      </a>
                    )}
                    {person.socials?.website && (
                      <a
                        href={person.socials.website}
                        className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-gray-900 hover:bg-white transition-colors"
                      >
                        <Globe size={18} />
                      </a>
                    )}
                  </div>
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

                  <div className="flex lg:hidden items-center justify-center gap-2 mt-auto">
                    {person.socials?.linkedin && (
                      <a
                        href={person.socials.linkedin}
                        className="w-[24px] h-[24px] rounded-full border-[0.5px] border-black/10 dark:border-white/20 bg-white flex items-center justify-center text-[#0A0A0A]"
                      >
                        <Linkedin size={12} strokeWidth={1.5} />
                      </a>
                    )}
                    {person.socials?.email && (
                      <a
                        href={person.socials.email}
                        className="w-[24px] h-[24px] rounded-full border-[0.5px] border-black/10 dark:border-white/20 bg-white flex items-center justify-center text-[#0A0A0A]"
                      >
                        <Mail size={12} strokeWidth={1.5} />
                      </a>
                    )}
                    {person.socials?.website && (
                      <a
                        href={person.socials.website}
                        className="w-[24px] h-[24px] rounded-full border-[0.5px] border-black/10 dark:border-white/20 bg-white flex items-center justify-center text-[#0A0A0A]"
                      >
                        <Globe size={12} strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="w-full flex justify-center mt-12 lg:mt-16">
          <Link
            to="/crew"
            className="bg-[#0077CC] hover:bg-[#005FA3] text-white font-lakes text-[14px] lg:text-[16px] px-6 py-3 lg:px-8 lg:py-4 rounded-[8px] lg:rounded-[10px] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            More Info About Our Crew
          </Link>
        </div>

        <div className="mt-12 lg:mt-24 w-full max-w-[394px] lg:max-w-none flex flex-col items-center bg-transparent lg:bg-black/5 dark:lg:bg-white/10 lg:border-[0.5px] border-transparent lg:border-black/10 dark:lg:border-white/20 rounded-[12px] lg:rounded-3xl py-8 lg:py-12 px-4 lg:px-8 transition-colors duration-300">
          <h3 className="text-[#1A1A1A] dark:text-[#F2F2F2] text-[18px] lg:text-[36px] font-lakes mb-8 lg:mb-12 text-center transition-colors duration-300">
            OUR PRESTIGIOUS SPONSORS
          </h3>
          <div className="w-full max-w-[296px] lg:max-w-none flex flex-wrap lg:flex-nowrap justify-center items-center gap-x-10 gap-y-8 lg:gap-24 opacity-80 hover:opacity-100 transition-opacity">
            <img
              src="/icons/Apple.png"
              alt="Apple"
              className="h-[34px] lg:h-12.5 dark:invert object-contain"
            />
            <img
              src="/icons/Microsoft.png"
              alt="Microsoft"
              className="h-[31px] lg:h-11.25 object-contain"
            />
            <img
              src="/icons/Slack.png"
              alt="Slack"
              className="h-[35px] lg:h-12.5 block dark:hidden"
            />
            <img
              src="/icons/SlackDark.png"
              alt="Slack"
              className="h-[35px] lg:h-12.5 hidden dark:block"
            />
            <img
              src="/icons/Google.png"
              alt="Google"
              className="h-[35px] lg:h-12.5 object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
