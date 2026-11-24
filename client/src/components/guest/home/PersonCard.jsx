import React, { useState } from "react";
import linkedinIcon from "../../../assets/images/chairpersons/linkedin.webp";
import facebookIcon from "../../../assets/images/chairpersons/facebook.webp";
import collabratecIcon from "../../../assets/images/chairpersons/collabratec-logo.webp";

/**
 * A home-page leadership card.
 *
 * Takes the crew shape the API returns (`position`, `bio`), falling back to the
 * `role` and `description` names the hardcoded chairperson list used. Both are
 * accepted so this keeps rendering if it is ever handed the static data again.
 */
export default function PersonCard({ person }) {
  const role = person.position || person.role;
  const description = person.bio || person.description;

  // A member with no photo used to render a bare `<img src="">`, i.e. a broken
  // image in a grey box, which is exactly what /crew shows for a missing photo.
  // The two pages then looked identical for anyone without a picture. This is a
  // brand-coloured monogram instead, so a photo-less member is obviously a
  // deliberate treatment on the home page rather than a broken card.
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(person.image) && !imageFailed;
  const initial = person.name?.trim()?.[0]?.toUpperCase() || "?";

  return (
    <div className="group relative flex flex-col bg-white dark:bg-[#1A1F2E] rounded-[10px] lg:rounded-[14px] shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)] lg:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transition-all duration-400 hover:-translate-y-2 h-full">
      {/* 3:4 at every width, matching the crew card. Square was fine when this
          was one card per row, but two per row halved the width and with it the
          picture, and md and up are narrower than they used to be too, so the
          ratio is set once here instead of per breakpoint. */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-t-2xl border-t-4 border-r-4 border-l-4 border-main group-hover:border-primary transition-all duration-500">
        {hasImage ? (
          <img
            src={person.image}
            alt={person.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0077CC] via-[#0A84D8] to-[#33B5FF] dark:from-[#0B3A5D] dark:via-[#10456B] dark:to-[#155A82]">
            <span className="font-gotham font-bold text-white/90 text-6xl lg:text-7xl leading-none select-none">
              {initial}
            </span>
          </div>
        )}
      </div>

      <div className="group-hover:bg-primary transition-colors duration-400 flex flex-col items-center justify-center text-center p-3 lg:p-6 flex-1">
        <div className="flex flex-col items-center justify-center flex-1 text-center mb-3 lg:mb-0 *:transition-colors *:duration-400">
          <h3 className="group-hover:text-white text-[13px] lg:text-[18px] font-bold leading-tight mb-1">
            {person.name}
          </h3>
          <p className="group-hover:text-white text-primary dark:text-primary-light text-[10px] lg:text-sm font-medium leading-tight mb-[6px] lg:mb-3">
            {role}
          </p>
          {description && (
            <p className="group-hover:text-white text-[#4A5565] dark:text-[#9CA3AF] text-[9px] lg:text-[14px] leading-[1.4] lg:leading-relaxed line-clamp-3 lg:line-clamp-none">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-auto">
          {person.socials?.facebook && (
            <a href={person.socials.facebook} target="_blank" rel="noopener noreferrer" title={`${person.name} on Facebook`} className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] rounded-full flex items-center justify-center">
              <img src={facebookIcon} alt="facebook Account" className="w-full h-full object-contain" />
            </a>
          )}
          {person.socials?.linkedin && (
            <a href={person.socials.linkedin} target="_blank" rel="noopener noreferrer" title={`${person.name} on LinkedIn`} className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] rounded-full flex items-center justify-center">
              <img src={linkedinIcon} alt="LinkedIn Account" className="w-full h-full object-contain" />
            </a>
          )}
          {person.socials?.collabratec && (
            <a href={person.socials.collabratec} target="_blank" rel="noopener noreferrer" title={`${person.name} on Collabratec`} className="w-[24px] lg:w-[32px] h-[24px] lg:h-[32px] flex items-center justify-center">
              <img src={collabratecIcon} alt="Collabratec" className="w-full h-full object-contain" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

