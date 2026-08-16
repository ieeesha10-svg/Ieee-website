import React, { useState } from "react";
import { Linkedin, Mail, Globe, User } from "lucide-react";
import { useCrew } from "../hooks/useCrew";

export default function CrewPage() {
  const { team, isLoading } = useCrew();
  const [brokenImages, setBrokenImages] = useState(() => new Set());

  return (
    <div className="min-h-screen py-24 px-4 lg:px-8 bg-[#F2F2F2] dark:bg-[#0A0E1A] transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Badge */}
        <div className="bg-[#0077CC]/10 text-[#0077CC] font-lakes rounded-full px-4 py-1.5 text-sm mb-6 flex items-center gap-2 border border-[#0077CC]/20">
          <span>🏆</span> Leadership Team
        </div>

        {/* Title */}
        <h1 className="text-4xl lg:text-6xl font-gotham font-bold text-[#1A1A1A] dark:text-[#F2F2F2] mb-4 text-center">
          Our Crew <span className="text-[#33B5FF]">Details</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[#4A5565] dark:text-[#9CA3AF] text-sm lg:text-lg font-lakes text-center max-w-2xl mb-16">
          Get to know the dedicated individuals who make IEEE SHA SB a thriving
          community
        </p>

        {/* Grid Cards */}
        {isLoading ? (
          <div className="w-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#33B5FF]"></div>
          </div>
        ) : team.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400 font-lakes">
            No crew members found yet.
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {team.map((person) => (
              <div
                key={person.id}
                className="group relative flex flex-col bg-white dark:bg-[#151A28] rounded-xl shadow-lg dark:shadow-none overflow-hidden transition-all duration-300 hover:-translate-y-2 border border-transparent dark:border-gray-800"
              >
                {/* Image Section with Hover Overlay */}
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-200 dark:bg-gray-800">
                  {brokenImages.has(person.id) ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                      <User size={64} strokeWidth={1.5} className="text-gray-400 dark:text-gray-500" />
                    </div>
                  ) : (
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={() => setBrokenImages((prev) => new Set(prev).add(person.id))}
                    />
                  )}
                  {/* Social Icons Overlay (Shows on Hover) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A]/90 via-[#0A0E1A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 gap-4">
                    {person.socials?.linkedin && (
                      <a
                        href={person.socials.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-[#0077CC] hover:text-white transition-colors shadow-lg"
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
                    {person.socials?.email && (
                      <a
                        href={person.socials.email}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-[#0077CC] hover:text-white transition-colors shadow-lg"
                      >
                        <Mail size={18} />
                      </a>
                    )}
                    {person.socials?.website && (
                      <a
                        href={person.socials.website}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-[#0077CC] hover:text-white transition-colors shadow-lg"
                      >
                        <Globe size={18} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col items-center text-center p-6 flex-1">
                  <h3 className="text-[#1A1A1A] dark:text-white text-lg font-bold font-lakes mb-1">
                    {person.name}
                  </h3>
                  <p className="text-[#0077CC] dark:text-[#33B5FF] text-sm font-medium font-lakes mb-3">
                    {person.role}
                  </p>
                  <p className="text-[#4A5565] dark:text-[#9CA3AF] text-xs font-lakes leading-relaxed">
                    {person.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
