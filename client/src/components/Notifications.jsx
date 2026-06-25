import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export default function Notifications() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-8 h-8 rounded-full bg-input flex items-center justify-center text-muted hover:text-foreground transition"
      >
        <Bell size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 z-50 bg-white dark:bg-card rounded-xl shadow-lg border border-border p-4 text-center">
            <p className="text-sm text-muted">No notifications for now</p>
          </div>
        </>
      )}
    </div>
  );
}
