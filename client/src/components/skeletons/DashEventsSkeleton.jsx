import React from "react";

export default function Skeleton() {
  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div><div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" /><div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 rounded" /></div>
        <div className="h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <div className="flex gap-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />)}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card-alt rounded-xl p-5 space-y-4">
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}