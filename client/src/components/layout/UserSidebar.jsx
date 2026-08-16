import React from "react";
import { ChevronRight } from "lucide-react";

// Section Header
export function SidebarSection({ title, children }) {
  return (
    <div className="space-y-[12px]">
      <h3 className="text-[#7A96B2] dark:text-[#4A6080] text-[12px] font-lakes font-bold tracking-[1.088px] uppercase pl-1">
        {title}
      </h3>
      <div className="flex flex-col gap-2 md:gap-4">{children}</div>
    </div>
  );
}

// Nav Item
export function NavItem({ icon, title, subtitle, isActive, hasNotification }) {
  return (
    <div
      className={`relative flex items-center justify-between px-[14.8px] py-[14.8px] rounded-[16px] cursor-pointer transition-all duration-300 group ${
        isActive
          ? "bg-[linear-gradient(135deg,#0096FF_0%,#0055CC_100%)] border-[0.8px] border-[#0077CC] shadow-[0px_4px_20px_rgba(0,150,255,0.35)] text-white"
          : "bg-white dark:bg-[#13161D] border-[0.8px] border-[rgba(0,120,255,0.11)] dark:border-[#222936] shadow-[0px_2px_8px_rgba(0,100,220,0.08)] hover:border-[rgba(0,120,255,0.3)] dark:hover:border-[rgba(0,150,255,0.2)] hover:shadow-[0px_4px_14px_rgba(0,100,220,0.12)] text-[#0A1628] dark:text-foreground"
      }`}
    >
      {/* Icon + Text */}
      <div className="flex items-center gap-[14px]">
        {/* Icon Box */}
        <div
          className={`w-[40px] h-[40px] rounded-[12px] flex items-center justify-center flex-shrink-0 transition-colors ${
            isActive
              ? "bg-[rgba(255,255,255,0.2)] text-white"
              : "bg-[#EBF4FF] dark:bg-[#1A1F2E] text-[#0096FF] dark:text-primary"
          }`}
        >
          {icon}
        </div>

        {/* Title + Subtitle */}
        <div className="min-w-0">
          <h4
            className={`text-[14.08px] leading-[17px] font-gotham font-normal truncate ${
              isActive ? "text-white" : "text-[#0A1628] dark:text-white"
            }`}
          >
            {title}
          </h4>
          <p
            className={`text-[11.52px] leading-[15px] font-[Outfit] mt-[1px] truncate ${
              isActive ? "text-white/85" : "text-[#7A96B2] dark:text-muted"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Side: notification dot OR chevron */}
      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
        {hasNotification && (
          <div className="w-[8px] h-[8px] bg-[#FF4757] rounded-full shadow-[0px_0px_0px_2.81px_rgba(255,71,87,0.16)]" />
        )}
        <ChevronRight
          size={15}
          className={`transition-colors ${
            isActive
              ? "text-[rgba(255,255,255,0.8)]"
              : "text-[#7A96B2] dark:text-muted opacity-50"
          }`}
        />
      </div>
    </div>
  );
}
