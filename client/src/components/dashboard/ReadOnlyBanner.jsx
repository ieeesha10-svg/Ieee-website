import React from "react";
import { Lock } from "lucide-react";
import { READ_ONLY_NOTICE } from "../../data/roles";

/**
 * Shown at the top of a dashboard page when the viewer can read but not write.
 *
 * This is a courtesy, not the enforcement. Every write is rejected server-side
 * by authorize(...WRITE_ROLES) regardless of what the UI shows, so a stale
 * client can never get through. Without this banner a board member would just
 * find the buttons missing and have no idea whether that was a bug.
 */
export default function ReadOnlyBanner({ className = "" }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200 ${className}`}
    >
      <Lock size={15} className="shrink-0" />
      <span>{READ_ONLY_NOTICE}</span>
    </div>
  );
}
