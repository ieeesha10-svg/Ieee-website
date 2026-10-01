import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Linkedin,
  Mail,
  Globe,
  User,
  Facebook,
  ChevronLeft,
  Users,
} from "lucide-react";
import { useSeason, useSeasons } from "../hooks/useSeasons";
import CenteredCardGrid from "../components/ui/CenteredCardGrid";

// Collabratec has no Lucide glyph, so it gets a generic people icon rather than
// being left out - the home card links to it, and a link that only works on one
// page of the site is a broken link on the other.
const SOCIAL_ICONS = [
  { key: "linkedin", Icon: Linkedin, label: "LinkedIn" },
  { key: "facebook", Icon: Facebook, label: "Facebook" },
  { key: "collabratec", Icon: Users, label: "Collabratec" },
  { key: "email", Icon: Mail, label: "Email" },
  { key: "website", Icon: Globe, label: "Website" },
];

function MemberCard({ person }) {
  const [imageFailed, setImageFailed] = useState(false);
  const links = SOCIAL_ICONS.filter(({ key }) => person.socials?.[key]);

  return (
    // `h-full` so the card fills the line height that CenteredCardGrid's
    // `items-stretch` gives it: the tallest card on a row decides the row
    // height, and every sibling card stretches to match instead of stopping
    // at its own content. Without it the equal-height rule silently does
    // nothing, because a block child of the <li> is only as tall as its text.
    <div className="group relative flex flex-col h-full bg-white dark:bg-[#151A28] rounded-xl shadow-lg dark:shadow-none overflow-hidden transition-all duration-300 hover:-translate-y-2 border border-transparent dark:border-gray-800">
      {/* 3:4 at every width. The photo is `aspect`-locked, so the card width
          decides the image height; 3:4 is the framing the crew photos are shot
          for, and it holds from a two-per-row phone all the way to five per row
          on a desktop, where the narrower card would otherwise undo the gain. */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-200 dark:bg-gray-800">
        {!person.image || imageFailed ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            <User size={64} strokeWidth={1.5} className="text-gray-400 dark:text-gray-500" />
          </div>
        ) : (
          <img
            src={person.image}
            alt={person.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        )}
        {links.length > 0 && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A]/90 via-[#0A0E1A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 gap-4">
            {links.map((link) => {
              const LinkIcon = link.Icon;
              return (
                <a
                  key={link.key}
                  // The server stores email as a bare address, so the mailto: is
                  // built here rather than trusted from the database.
                  href={
                    link.key === "email"
                      ? `mailto:${person.socials[link.key]}`
                      : person.socials[link.key]
                  }
                  target={link.key === "email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  title={`${person.name} on ${link.label}`}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-[#0077CC] hover:text-white transition-colors shadow-lg"
                >
                  <LinkIcon size={18} />
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* `flex-1` takes whatever height the stretched card has left over after
          the fixed 4:5 photo, and `justify-center` centres the name, position
          and bio inside it. So on a row where one card has a long bio, the
          shorter bios stay centred in their own card rather than clinging to
          the top with a gap underneath. */}
      <div className="flex flex-col items-center justify-center text-center p-6 flex-1">
        <h2 className="text-[#1A1A1A] dark:text-white text-lg font-bold font-lakes mb-1">
          {person.name}
        </h2>
        <p className="text-[#0077CC] dark:text-[#33B5FF] text-sm font-medium font-lakes mb-3">
          {person.position}
        </p>
        {person.bio && (
          <p className="text-[#4A5565] dark:text-[#9CA3AF] text-xs font-lakes leading-relaxed">
            {person.bio}
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ title, blurb, members }) {
  return (
    <section className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-4xl font-gotham font-bold text-[#1A1A1A] dark:text-[#F2F2F2]">
          {title}
        </h2>
        <p className="text-[#4A5565] dark:text-[#9CA3AF] text-sm lg:text-base font-lakes mt-2">
          {blurb}
        </p>
      </div>

      {members.length === 0 ? (
        <p className="text-center text-[#4A5565] dark:text-[#9CA3AF] font-lakes py-6">
          No {title.toLowerCase()} members listed for this season.
        </p>
      ) : (
        <CenteredCardGrid>
          {members.map((person) => (
            <MemberCard key={person._id} person={person} />
          ))}
        </CenteredCardGrid>
      )}
    </section>
  );
}

/**
 * The counselor list: one card per line, centred.
 *
 * Deliberately not the card grid. The counselor is a single senior role rather
 * than a row of peers, so each one gets a full line to itself instead of being
 * shrunk into a five-wide column beside the committee. The width is capped
 * because MemberCard is a portrait crop: letting a lone card span a 1280px row
 * would make it several times taller than the cards below it.
 */
function CounselorSection({ title, blurb, members }) {
  return (
    <section className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-4xl font-gotham font-bold text-[#1A1A1A] dark:text-[#F2F2F2]">
          {title}
        </h2>
        <p className="text-[#4A5565] dark:text-[#9CA3AF] text-sm lg:text-base font-lakes mt-2">
          {blurb}
        </p>
      </div>

      {members.length === 0 ? (
        <p className="text-center text-[#4A5565] dark:text-[#9CA3AF] font-lakes py-6">
          No counselor listed for this season.
        </p>
      ) : (
        <div className="w-full flex flex-col items-center gap-6 lg:gap-8">
          {members.map((person) => (
            <div key={person._id} className="w-full max-w-[280px] sm:max-w-[320px]">
              <MemberCard person={person} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * The crew page for one season.
 *
 * Mounted at both /crew and /crew/season/:seasonId, so the same component
 * serves the current season and every archived one. With no id in the URL it
 * reads the season published on the home page, which is what a visitor clicking
 * "Crew" in the navbar expects to land on.
 */
export default function CrewPage() {
  const { seasonId } = useParams();
  const { season, excom, counselor, board, isLoading, error, isEmpty } = useSeason(seasonId);
  const { seasons } = useSeasons();

  // Every season the visitor is not already looking at, so the labels at the
  // bottom always offer a way somewhere else. On /crew there is no id in the
  // URL, so the season on screen is the published one and that is what has to be
  // filtered out - otherwise the season being displayed is also offered as one
  // of the other seasons.
  const otherSeasons = seasons.filter(
    (s) => s._id !== seasonId && s._id !== season?._id
  );

  return (
    <div className="min-h-screen py-24 px-4 lg:px-8 bg-[#F2F2F2] dark:bg-[#0A0E1A] transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-16 lg:gap-24">
        <div className="flex flex-col items-center">
          <div className="bg-[#0077CC]/10 text-[#0077CC] font-lakes rounded-full px-4 py-1.5 text-sm mb-6 flex items-center gap-2 border border-[#0077CC]/20">
            <span>🏆</span> Leadership Team
          </div>

          <h1 className="text-4xl lg:text-6xl font-gotham font-bold text-[#1A1A1A] dark:text-[#F2F2F2] mb-4 text-center">
            {season ? (
              <>
                {season.name} <span className="text-[#33B5FF]">Crew</span>
              </>
            ) : (
              <>
                Our Crew <span className="text-[#33B5FF]">Details</span>
              </>
            )}
          </h1>

          {season && !season.isHome && (
            <p className="text-[#0077CC] dark:text-[#33B5FF] font-lakes text-sm mb-4">
              An archived season
            </p>
          )}

          <p className="text-[#4A5565] dark:text-[#9CA3AF] text-sm lg:text-lg font-lakes text-center max-w-2xl mb-4">
            Get to know the dedicated individuals who make IEEE SHA SB a thriving
            community
          </p>
        </div>

        {isLoading ? (
          <div className="w-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#33B5FF]" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 font-lakes py-20">{error}</p>
        ) : isEmpty ? (
          <p className="text-center text-[#4A5565] dark:text-[#9CA3AF] font-lakes py-20">
            No season has been published yet.
          </p>
        ) : (
          <>
            <CounselorSection
              title="Counselor"
              blurb="The counselor advising this season's committee."
              members={counselor}
            />
            <Section
              title="Excom"
              blurb="The executive committee leading this season."
              members={excom}
            />
            <Section
              title="Board"
              blurb="The board members supporting this season."
              members={board}
            />
          </>
        )}

        {/* Previous seasons */}
        {otherSeasons.length > 0 && (
          <div className="w-full flex flex-col items-center gap-4 pt-4 border-t border-[#D9DEE5] dark:border-[#222936]">
            <p className="text-[11px] lg:text-sm font-lakes font-bold uppercase tracking-wide text-[#4A5565] dark:text-[#9CA3AF]">
              {seasonId ? "Other seasons" : "Previous seasons"}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {otherSeasons.map((other) => (
                <Link
                  key={other._id}
                  to={`/crew/season/${other._id}`}
                  className={`font-lakes text-[12px] lg:text-[14px] px-4 py-2 rounded-[8px] border transition-colors ${
                    other.isHome
                      ? "border-[#0077CC]/30 text-[#0077CC] dark:text-[#33B5FF] hover:bg-[#0077CC]/10"
                      : "border-[#D9DEE5] dark:border-[#222936] text-[#4A5565] dark:text-[#9CA3AF] hover:border-[#0077CC] hover:text-[#0077CC] dark:hover:text-[#33B5FF]"
                  }`}
                >
                  {other.name}
                  <span className="ml-1.5 opacity-70">
                    ({other.memberCount})
                  </span>
                </Link>
              ))}
            </div>
            {seasonId && (
              <Link
                to="/crew"
                className="inline-flex items-center gap-1.5 font-lakes text-[12px] lg:text-[14px] text-[#0077CC] dark:text-[#33B5FF] hover:underline"
              >
                <ChevronLeft size={14} /> Back to the current season
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
