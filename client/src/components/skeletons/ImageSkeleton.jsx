import React from "react";

export default function ImageSkeleton({ className = "", aspectRatio = "16/9", rounded = "rounded-3xl" }) {
  return (
    <div
      className={`relative overflow-hidden bg-[#e5e7eb] dark:bg-[#1f2937] ${rounded} ${className}`}
      style={{ aspectRatio }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer" />
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
