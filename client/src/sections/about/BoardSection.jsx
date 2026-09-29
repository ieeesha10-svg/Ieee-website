import React from 'react'
import Badge from '../../components/ui/Badge'
import SectionHeader from '../../components/ui/SectionHeader'
import SectionIntro from '../../components/ui/SectionIntro'
import linkedinIcon from "../../assets/images/chairpersons/linkedin.webp";
import facebookIcon from "../../assets/images/chairpersons/facebook.webp";
import collabratecIcon from "../../assets/images/chairpersons/collabratec-logo.webp";
import { useSeason } from "../../hooks/useSeasons";

function MemberCard({ member }) {
  return (
    <div className="bg-card rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-card">
      {/* Avatar */}
      <div className="h-32 sm:h-70 overflow-hidden bg-gray-200 dark:bg-gray-800">
        {member.image ? (
          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-500">
            {member.name?.trim()?.[0] || "?"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center py-4">
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
  const { excom, isLoading, isEmpty } = useSeason();

  // The counselor is lifted out of the grid and given a full-width card, which
  // is how the home page has always shown them. The server flags them by
  // position, so this stays right without anyone ticking a box.
  const counselors = excom.filter((person) => person.isCounselor);
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
        <div className="space-y-4">
          {counselors.map((person) => (
            <div key={person._id} className="max-w-sm mx-auto">
              <MemberCard member={person} />
            </div>
          ))}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {rest.map((person) => (
              <MemberCard key={person._id} member={person} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
