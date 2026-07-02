import React, { useState, useRef } from "react";
import { Send, Clock, ChevronDown, Mail } from "lucide-react";
import {
  emailHistoryData,
  recipientGroups,
} from "../../data/emailData";

/* ─── Progress Bar ─────────────────────────────────────────────── */
function ProgressStat({ label, value, color = "bg-primary" }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted font-medium">{label}</span>
      </div>
      <div className="h-[5px] w-full rounded-full bg-gray-100 dark:bg-gray-700/50 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-[11px] font-bold mt-1 inline-block ${
        color === "bg-primary" ? "text-primary" : "text-primary"
      }`}>
        {value}%
      </span>
    </div>
  );
}

/* ─── History Card ─────────────────────────────────────────────── */
function HistoryCard({ email }) {
  return (
    <div className="px-5 py-4 border-b border-gray-100 dark:border-[#222936] last:border-b-0">
      <h4 className="text-sm font-semibold text-foreground mb-0.5">
        {email.title}
      </h4>
      <p className="text-[11px] text-muted mb-3">
        {email.date} · {email.recipients} recipients
      </p>
      <div className="flex items-start gap-6">
        <ProgressStat label="Delivered" value={email.delivered} />
        <ProgressStat label="Opened" value={email.opened} />
      </div>
    </div>
  );
}

/* ─── Recipient Select ─────────────────────────────────────────── */
function RecipientSelect({ value, onChange, groups }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = groups.find((g) => g.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground hover:border-primary transition-colors"
      >
        <span>{selected?.label || "Select recipients..."}</span>
        <ChevronDown
          size={14}
          className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-[#222936] rounded-lg shadow-lg overflow-hidden">
            {groups.map((group) => (
              <button
                key={group.value}
                type="button"
                onClick={() => {
                  onChange(group.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors ${
                  value === group.value
                    ? "text-primary font-semibold"
                    : "text-foreground"
                }`}
              >
                <span>{group.label}</span>
                <span className="text-xs text-muted">{group.count}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────── */
export default function BulkMailer() {
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("all");
  const [body, setBody] = useState("");

  const selectedGroup = recipientGroups.find((g) => g.value === recipient);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ─── Left: Compose Form ─────────────────────────────── */}
        <div className="lg:col-span-3 bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm p-5 md:p-6">
          <h2 className="text-base font-bold text-foreground mb-5">
            New Broadcast
          </h2>

          <div className="space-y-5">
            {/* Subject */}
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>

            {/* Recipients */}
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
                Recipients
              </label>
              <RecipientSelect
                value={recipient}
                onChange={setRecipient}
                groups={recipientGroups}
              />
              <p className="text-xs text-muted mt-1.5">
                Estimated reach:{" "}
                <span className="text-primary font-bold">
                  {selectedGroup?.count || 0} members
                </span>
              </p>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
                Message Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your broadcast message here..."
                rows={8}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-muted">
                  You can use plain text or include links. All emails will
                  include the IEEE SB footer automatically.
                </p>
                <span className="text-[11px] text-muted shrink-0 ml-2">
                  {body.length} chars
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-[#222936]">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
              <Send size={14} />
              Send Broadcast
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground border border-gray-200 dark:border-[#222936] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <Clock size={14} />
              Schedule
            </button>
          </div>
        </div>

        {/* ─── Right: Send History ────────────────────────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#222936]">
            <h2 className="text-base font-bold text-foreground">
              Send History
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {emailHistoryData.length} emails dispatched
            </p>
          </div>

          <div className="max-h-[600px] overflow-y-auto scrollable-content">
            {emailHistoryData.length > 0 ? (
              emailHistoryData.map((email) => (
                <HistoryCard key={email.id} email={email} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4">
                  <Mail size={24} className="text-muted" />
                </div>
                <h3 className="text-foreground font-semibold text-base mb-1">
                  No emails sent yet
                </h3>
                <p className="text-muted text-sm max-w-[240px] text-center">
                  Compose and send your first broadcast to members.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
