import React from "react";

export default function Pagination({ page, totalPages, onPageChange, variant = "light" }) {
  if (totalPages <= 1) return null;

  const isDark = variant === "dark";

  const btnBase = "px-3 py-1.5 text-xs font-medium rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition-colors";
  const btnIdle = isDark
    ? "border-white/20 text-white hover:bg-white/10"
    : "border-gray-200 dark:border-[#222936] text-muted hover:text-foreground hover:border-primary";
  const btnDisabled = "disabled:opacity-40 disabled:cursor-not-allowed";

  const numBase = "w-8 h-8 text-xs font-medium rounded-lg border transition-colors";
  const numIdle = isDark
    ? "border-white/20 text-white hover:bg-white/10"
    : "border-gray-200 dark:border-[#222936] text-muted hover:text-foreground hover:border-primary";
  const numActive = isDark
    ? "bg-white text-primary border-white"
    : "bg-primary text-white border-primary";

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${btnBase} ${btnIdle}`}
      >
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`${numBase} ${page === p ? numActive : numIdle}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${btnBase} ${btnIdle}`}
      >
        Next
      </button>
    </div>
  );
}
