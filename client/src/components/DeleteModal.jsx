import React from 'react';
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";

export default function DeleteModal({
  isOpen,
  title = "Delete item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-card-alt rounded-xl border border-border shadow-xl p-6 animate-in fade-in zoom-in-95">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="absolute top-3 right-3 text-muted hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
        </div>

        <h3 className="text-base font-semibold text-foreground text-center mb-2">
          {title}
        </h3>

        <p className="text-sm text-muted text-center mb-6 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center gap-3 justify-center">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-foreground bg-transparent border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
