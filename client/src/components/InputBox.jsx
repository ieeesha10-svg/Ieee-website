import React from "react";

export default function InputBox({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = "text",
  placeholder,
}) {
  return (
    <div
      className={`bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-[24px] p-[18.8px] flex flex-col gap-[6px] transition-colors`}
    >
      <label className="text-[#475569] dark:text-muted font-bold text-[13px] leading-[16px] font-[Inter] tracking-wide">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={!isEditing}
        placeholder={placeholder}
        className="bg-[#F1F5F9] dark:bg-transparent border-[0.8px] border-[#CBD5E1] dark:border-transparent rounded-[12px] p-[12px] text-[#64748B] dark:text-foreground text-[14px] leading-[17px] font-[Inter] outline-none transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed placeholder:text-[#64748B]/60 focus:border-[#0096FF] focus:ring-1 focus:ring-[#0096FF] dark:focus:border-primary dark:focus:ring-primary"
      />
    </div>
  );
}
