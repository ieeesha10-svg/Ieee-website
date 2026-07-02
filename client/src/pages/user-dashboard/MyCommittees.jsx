import React from "react";
import { useOutletContext } from "react-router-dom";
import { Users, Check } from "lucide-react";

const COMMITTEES = [
  {
    name: "Technical Committee",
    emoji: "⚙️",
    description:
      "Workshops, projects and technical events for engineering students.",
    members: 34,
    joined: true,
  },
  {
    name: "Media & Design",
    emoji: "🎨",
    description: "Visual content, social media and branding for the branch.",
    members: 21,
    joined: false,
  },
  {
    name: "Marketing",
    emoji: "📣",
    description: "Outreach campaigns and promoting IEEE events across campus.",
    members: 18,
    joined: false,
  },
  {
    name: "Human Resources",
    emoji: "🤝",
    description: "Recruiting, onboarding and member well-being initiatives.",
    members: 14,
    joined: false,
  },
  {
    name: "Events & Logistics",
    emoji: "🎯",
    description: "Planning and executing all branch events end-to-end.",
    members: 28,
    joined: false,
  },
  {
    name: "Finance",
    emoji: "💰",
    description:
      "Budgeting, sponsorships and financial reporting for the branch.",
    members: 8,
    joined: false,
  },
];

function CommitteeCard({ name, emoji, description, members, joined }) {
  return (
    <div
      className={`relative bg-white dark:bg-[#13161D] rounded-[16px] md:rounded-[20px] border-[0.8px] p-5 md:p-6 transition-all duration-300 group hover:shadow-[0px_6px_20px_rgba(0,100,220,0.12)] ${
        joined
          ? "border-[#0096FF] dark:border-[rgba(0,150,255,0.3)] shadow-[0px_4px_16px_rgba(0,150,255,0.12)] dark:shadow-[0px_4px_16px_rgba(0,150,255,0.08)]"
          : "border-[rgba(0,120,255,0.11)] dark:border-[#222936] shadow-[0px_2px_8px_rgba(0,100,220,0.06)] dark:shadow-none dark:hover:border-[rgba(0,150,255,0.15)]"
      }`}
    >
      {/* Joined Badge */}
      {joined && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#1BCC6E] text-white text-[11px] font-lakes font-bold tracking-[0.3px] px-3 py-1.5 rounded-full shadow-[0px_2px_8px_rgba(27,204,110,0.3)]">
          <Check size={12} strokeWidth={3} />
          Joined
        </div>
      )}

      {/* Emoji Icon */}
      <div className="w-[44px] h-[44px] rounded-[12px] bg-[#F0F7FF] dark:bg-[#1A1F2E] flex items-center justify-center mb-4 text-[22px] transition-transform duration-300 group-hover:scale-105">
        {emoji}
      </div>

      {/* Info */}
      <h3 className="font-gotham font-normal text-[14.5px] md:text-[15px] leading-[19px] text-[#0A1628] dark:text-white mb-[6px] pr-16">
        {name}
      </h3>
      <p className="font-[Outfit] text-[12px] md:text-[12.8px] leading-[18px] text-[#7A96B2] dark:text-muted mb-4 line-clamp-2">
        {description}
      </p>

      {/* Members count */}
      <div className="flex items-center gap-[6px]">
        <Users size={13} className="text-[#0096FF] dark:text-primary" />
        <span className="font-lakes font-bold text-[11.5px] tracking-[0.3px] text-[#0096FF] dark:text-primary">
          {members} members
        </span>
      </div>
    </div>
  );
}

export default function MyCommittees() {
  const { userData } = useOutletContext();
  const userCommittee = userData?.committee || "";

  const committeesList = COMMITTEES.map((committee) => ({
    ...committee,
    joined: userCommittee
      ? committee.name.toLowerCase() === userCommittee.toLowerCase()
      : false,
  }));

  return (
    <div className="bg-white dark:bg-[#13161D] rounded-[32px] p-8 md:p-10 border border-[#F1F5F9] dark:border-[#222936]">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-[56px] h-[56px] rounded-[20px] bg-[#8B5CF6] flex items-center justify-center text-white">
          <Users size={24} />
        </div>
        <div>
          <h2 className="text-[24px] font-bold text-[#0A1628] dark:text-white">
            My Committees
          </h2>
          <p className="text-[#64748B] text-[14px]">
            Groups you're part of & can join
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {committeesList.map((c, i) => (
          <CommitteeCard key={i} {...c} />
        ))}
      </div>
    </div>
  );
}
