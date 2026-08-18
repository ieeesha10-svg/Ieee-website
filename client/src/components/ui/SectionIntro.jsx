import React from 'react';
import { twMerge } from "tailwind-merge";

export default function SectionIntro({ children, className }) {
  return (
    <div
      className={twMerge(
        "text-center max-w-2xl mx-auto mb-12 flex flex-col items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
