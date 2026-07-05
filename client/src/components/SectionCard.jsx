import React from 'react'
export default function SectionCard({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm p-5 md:p-6 ${className}`}>
      {children}
    </div>
  );
}
