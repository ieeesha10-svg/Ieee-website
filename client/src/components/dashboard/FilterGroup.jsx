import React from 'react';
import { Filter } from "lucide-react";

export default function FilterGroup({ label, items, activeItems, onToggle }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <div className="flex items-center gap-1">
        <Filter className="w-4 h-4 text-muted" />
        <span className="text-xs text-muted font-bold">{label}</span>
      </div>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onToggle(item)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            activeItems.includes(item)
              ? "bg-primary text-white border-primary"
              : "bg-card-alt text-muted border border-border hover:border-primary hover:text-primary"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
