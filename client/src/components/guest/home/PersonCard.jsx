import React from "react";
import linkedinIcon from "../../../assets/images/chairpersons/linkedin.png";
import facebookIcon from "../../../assets/images/chairpersons/facebook.png";
import collabratecIcon from "../../../assets/images/chairpersons/collabratec-logo.png";

export default function PersonCard({ person }) {
  return (
    <div className="group relative flex flex-col bg-white dark:bg-[#1A1F2E] rounded-[10px] lg:rounded-[14px] shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)] lg:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transition-all duration-400 hover:-translate-y-2 h-full">
      <div className="relative w-full aspect-square overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-t-2xl border-t-4 border-r-4 border-l-4 border-main group-hover:border-primary transition-all duration-500">
        <img
          src={person.image}
          alt={person.name}
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
          {person.socials?.facebook && (
            <a href={person.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] rounded-full flex items-center justify-center">
              <img src={facebookIcon} alt="facebook Account" className="w-full h-full object-contain" />
            </a>
          )}
          {person.socials?.linkedin && (
            <a href={person.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] rounded-full flex items-center justify-center">
              <img src={linkedinIcon} alt="LinkedIn Account" className="w-full h-full object-contain" />
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
