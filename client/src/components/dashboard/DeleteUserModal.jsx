import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import Modal from "../Modal";
import Button from "../Button";

export default function DeleteUserModal({
  open,
  user,
  onClose,
  onConfirm,
  loading,
}) {
  const [confirmation, setConfirmation] = useState("");

  const confirmed = confirmation.trim().toLowerCase() === "yes delete user";

  return (
    <Modal open={open} onClose={onClose} title="Delete User" maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/10 flex-shrink-0">
            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="text-sm text-muted">
            <p>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{user?.name}</span>?
            </p>
            <p className="mt-1 text-xs">
              This action cannot be undone and will permanently remove the user
              from the database.
            </p>
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-xs text-muted">
          Type{" "}
          <span className="font-semibold text-foreground">yes delete user</span>{" "}
          to confirm:
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="yes delete user"
            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm"
          />
        </label>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!confirmed || loading}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Delete User"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
