import React from 'react';
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import Modal from "./Modal";

export default function DeleteModal({
  isOpen,
  title = "Delete item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  return (
    <Modal open={isOpen} onClose={onCancel} title={title}>
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
        </div>

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
    </Modal>
  );
}
