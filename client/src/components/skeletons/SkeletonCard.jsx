import React from "react";

export default function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow">
      {/* Image placeholder */}
      <div className="h-48 w-full rounded-lg bg-gray-200 dark:bg-gray-700 mb-4" />
      
      {/* Title placeholder */}
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
      
      {/* Subtitle placeholder */}
      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
};
