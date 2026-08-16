import React, { useState } from "react";

export default function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);

  if (!text) return children;

  return (
    <div className="relative w-full" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[11px] font-medium whitespace-nowrap shadow-lg z-50 pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
        </div>
      )}
    </div>
  );
}
