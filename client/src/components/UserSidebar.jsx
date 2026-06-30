import React from "react";

export function SidebarSection({ title, children }) {
  return (
    <div>
      <h3 className="text-[#9CA3AF] text-[12px] font-gotham font-bold tracking-[1.5px] uppercase mb-4 ml-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function NavItem({ icon, title, subtitle, isActive, hasNotification }) {
  return (
    <div
      className={`flex items-center justify-between p-[14.8px] rounded-[16px] cursor-pointer transition-all duration-300 ${
        isActive
          ? "bg-[linear-gradient(135deg,#0096FF_0%,#0055CC_100%)] dark:bg-brand-linear border-[0.8px] border-[#0077CC] dark:border-transparent shadow-[0px_4px_20px_rgba(0,150,255,0.35)] dark:shadow-[0_12px_32px_rgba(0,100,220,0.2)] text-white"
          : "bg-white dark:bg-[#13161D] border-[0.8px] border-[rgba(0,120,255,0.11)] dark:border-[#222936] shadow-[0px_2px_8px_rgba(0,100,220,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-primary/30 text-[#0A1628] dark:text-foreground"
      }`}
    >
      <div className="flex items-center gap-[18.8px]">
        <div
          className={`w-[40px] h-[40px] rounded-[12px] flex items-center justify-center transition-colors ${
            isActive
              ? "bg-white/20 text-white"
              : "bg-[#EBF4FF] dark:bg-[#1A1F2E] text-[#0096FF] dark:text-primary"
          }`}
        >
          {icon}
        </div>
        <div>
          <h4
            className={`text-[14.08px] leading-[17px] font-gotham font-normal ${isActive ? "text-white" : "text-[#0A1628] dark:text-white"}`}
          >
            {title}
          </h4>
          <p
            className={`text-[11.52px] leading-[15px] font-[Outfit] mt-[1px] ${isActive ? "text-white" : "text-[#7A96B2] dark:text-muted"}`}
          >
            {subtitle}
          </p>
        </div>
      </div>
      {hasNotification && (
        <div className="w-[8px] h-[8px] bg-[#FF4757] rounded-full shadow-[0px_0px_0px_2.8px_rgba(255,71,87,0.16)] mr-2"></div>
      )}
    </div>
  );
}
