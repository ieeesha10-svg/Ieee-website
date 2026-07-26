import React from "react";

export default function FlagshipSkeleton() {
  return (
    <div className="w-full lg:max-w-[620px] flex flex-col animate-pulse">
      <div className="h-[250px] md:h-[300px] lg:h-[384px] rounded-[16px] lg:rounded-[24px] bg-gray-200 dark:bg-gray-700/50" />
      <div className="mt-4 lg:mt-6 space-y-3">
        <div className="h-3 w-20 rounded-full bg-gray-200 dark:bg-gray-700/50" />
        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700/50" />
        <div className="h-3 w-3/4 rounded-full bg-gray-200 dark:bg-gray-700/50" />
      </div>
    </div>
  );
}
