import React from 'react'
import Badge from '../../components/ui/Badge'
import SectionHeader from '../../components/ui/SectionHeader'
import SectionIntro from '../../components/ui/SectionIntro'
import linkedinIcon from "../../assets/images/chairpersons/linkedin.webp";
import facebookIcon from "../../assets/images/chairpersons/facebook.webp";
import collabratecIcon from "../../assets/images/chairpersons/collabratec-logo.webp";
import { useSeason } from "../../hooks/useSeasons";
import CenteredCardGrid, { FEATURE_BASIS } from "../../components/ui/CenteredCardGrid";

function MemberCard({ member }) {
  return (
    // The ring and the lifted dark surface are what make the card visible. This
    // section sits in an `odd:bg-white dark:bg-card` wrapper, and `bg-card`
    // resolves to `--bg-main`, so in dark mode a plain `bg-card` card was
    // exactly the same colour as the section behind it and disappeared. The
    // lighter dark surface separates it from the #1A1F2E background, and the
    // ring gives a defined edge in light mode where card (#f2f2f2) on white is
    // only a shade apart.
    //
    // `h-full` is required, not decorative: CenteredCardGrid stretches the <li>,
    // and a block child is only as tall as its own content without it. Paired
    // with `justify-center` on the info block below, that gives every card in a
    // line the same height with its text centred in the leftover space.
    <div className="flex flex-col h-full bg-card dark:bg-[#232B3F] rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-card">
      {/* Avatar */}
      {/* Aspect ratio rather than the fixed `h-32 sm:h-70` this used. A fixed
          height ignored the card width, so two per row on a phone squeezed the
          photo into a 150x128 squat crop while a desktop card got a 280px
          letterbox - the same card, two completely different pictures. 3:4
          scales with the column and matches the crew cards. */}
      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0">
        {member.image ? (
          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-500">
            {member.name?.trim()?.[0] || "?"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-center text-center py-4 px-2">
        <h3 className="font-bold text-foreground text-sm sm:text-base">{member.name}</h3>
        <p className="text-xs font-semibold text-primary uppercase mt-1">{member.position}</p>

        <div className="flex items-center justify-center gap-2 mt-3">
          {member.socials?.facebook && (
            <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-7 lg:w-9 h-7 lg:h-9 rounded-full flex items-center justify-center">
              <img src={facebookIcon} alt="facebook Account" className="w-full h-full object-contain" />
            </a>
          )}
          {member.socials?.linkedin && (
            <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-7 lg:w-9 h-7 lg:h-9 rounded-full flex items-center justify-center">
              <img src={linkedinIcon} alt="LinkedIn Account" className="w-full h-full object-contain" />
            </a>
          )}
          {member.socials?.collabratec && (
            <a href={member.socials.collabratec} target="_blank" rel="noopener noreferrer" className="w-7 lg:w-9 h-7 lg:h-9 flex items-center justify-center">
              <img src={collabratecIcon} alt="Collabratec" className="w-full h-full object-contain" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BoardSection() {
  // The published season, same source as the home page. This section used to
  // import a hardcoded list, which meant a member added or edited from the
  // dashboard never appeared here - and the counselor was missing entirely,
  // because that list only ever held the four officers.
  const { excom, counselor, isLoading, isEmpty } = useSeason();

  // The counselor is lifted out of the grid and given a full-width card, which
  // is how the home page has always shown them. Read from their own section,
  // with the position match kept as a fallback for a member added to the Excom
  // as "Counselor" before that section existed.
  const counselors = [
    ...counselor,
    ...excom.filter((person) => person.isCounselor),
  ];
  const rest = excom.filter((person) => !person.isCounselor);

  return (
    <>
      {/* Header */}
      <SectionIntro>
        <Badge text={"Leadership"} />
        <SectionHeader
          title="Meet the"
          highlight="Executive Committee"
          highlightColor="primary"
          variant="light"
          className="mt-4"
        />
        <p className="text-muted mt-3">
          The students leading the branch this academic year.
        </p>
      </SectionIntro>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
        </div>
      ) : isEmpty ? (
        // Same reasoning as the home page: no published season means no
        // leadership section, rather than a heading over nothing. The fix is
        // publishing a season from the dashboard.
        null
      ) : (
        <div className="space-y-6">
          {counselors.map((person) => (
            // FEATURE_BASIS, not a fixed cap: 1.5x a grid card at every width,
            // so the counselor reads as the senior member it is instead of
            // landing within a few pixels of an Excom card on a desktop.
            <div key={person._id} className={`${FEATURE_BASIS} mx-auto`}>
              <MemberCard member={person} />
            </div>
          ))}

          {/* CenteredCardGrid, not `grid-cols-2 lg:grid-cols-4`. Five officers
              in a four-column CSS grid left the fifth stranded against the left
              edge, and unlike the crew pages the cards were not the same width
              as each other in a short row. This also puts the section on the
              same 2/3/4/5 rhythm as /crew and the home page. */}
          <CenteredCardGrid>
            {rest.map((person) => (
              <MemberCard key={person._id} member={person} />
            ))}
          </CenteredCardGrid>
        </div>
      )}
    </>
  )
}
