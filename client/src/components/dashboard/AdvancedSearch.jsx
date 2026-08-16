import React from 'react'
import { Search, X, Loader2 } from "lucide-react";

export default function AdvancedSearch({ value, onChange, isLoading, placeholder = "Search users...", className = "" }) {
  return (
    <div className={`my-auto w-full self-start flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card-alt focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent ${className}`}>
      {isLoading ? (
        <Loader2 className="w-4 h-4 text-muted shrink-0 animate-spin" />
      ) : (
        <Search className="w-4 h-4 text-muted shrink-0" />
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-sm bg-transparent focus:outline-none border-none p-0"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-muted hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
