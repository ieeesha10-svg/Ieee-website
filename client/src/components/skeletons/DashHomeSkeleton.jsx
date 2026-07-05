import React from 'react';

export default function Skeleton() {
  const skeletonCard = (key, rows) => (
    <div
      key={key}
      className="bg-card-alt rounded-2xl shadow-sm p-5 md:p-6 animate-pulse"
    >
      {rows}
    </div>
  );

  return (
    <div className="min-h-screen p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) =>
          skeletonCard(
            i,
            <>
              <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 mb-4" />
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </>,
          ),
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) =>
          skeletonCard(
            i,
            <>
              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-5" />
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </>,
          ),
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) =>
          skeletonCard(
            i,
            <>
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-5" />
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex items-center gap-3 py-2.5">
                  <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1">
                    <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              ))}
            </>,
          ),
        )}
      </div>
    </div>
  );
}