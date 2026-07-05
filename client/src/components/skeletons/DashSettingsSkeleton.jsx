import React from "react";

export default function Skeleton() {
  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-4xl animate-pulse">
      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm p-5 md:p-6 space-y-4">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-52 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}