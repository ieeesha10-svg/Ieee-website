import React from "react";

export default function ProfileBadge({ text }) {
  return (
    <span className="px-[14.8px] flex items-center justify-center rounded-full font-lakes font-medium text-[12px] leading-[17px] tracking-[0.24px] backdrop-blur-sm transition-all duration-300 h-[26px] bg-[rgba(255,255,255,0.15)] border-[0.8px] border-[rgba(255,255,255,0.25)] text-white dark:bg-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.18)] dark:text-white/90">
      {text}
    </span>
  );
}
