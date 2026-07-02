import React, { useState, useRef } from "react";
import { Send, Clock, ChevronDown, Mail, Paperclip, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../utils/api";
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

/* ────────────────────────────────────────────────────────────────
   Helper: Build an .xlsx Blob from an array of email strings.
   The backend reads column A of the first sheet, row by row.
   ──────────────────────────────────────────────────────────────── */
function buildExcelBlob(emails) {
  // Each row = [email] — column A only, no header
  const wsData = emails.map((e) => [e]);
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Recipients");
  // Write to binary array
  const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([wbOut], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/* ─── Main Component ───────────────────────────────────────────── */
export default function BulkMailer() {
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("all");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success'|'error'|'info', text: '' }
  const [sendResults, setSendResults] = useState([]); // streamed chunk results
  const fileInputRef = useRef(null);

  const selectedGroup = recipientGroups.find((g) => g.value === recipient);

  /* ── Attachment handlers ─────────────────────────────────────── */
  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...filesArray].slice(0, 5));
    }
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Send handler ────────────────────────────────────────────── */
  const handleSend = async () => {
    // ── Validation ──
    if (!subject.trim()) {
      setStatusMsg({ type: "error", text: "Subject is required." });
      return;
    }
    if (!body.trim()) {
      setStatusMsg({ type: "error", text: "Message Body is required." });
      return;
    }

    setIsSending(true);
    setSendResults([]);
    setStatusMsg({ type: "info", text: "Fetching members…" });

    try {
      // 1️⃣  Fetch members from the backend
      let emails = [];
      try {
        const res = await api.get("/users/members");
        const members = Array.isArray(res.data) ? res.data : (res.data.data || []);

        // Filter based on selected recipient group
        let filtered = members;
        if (recipient === "active") {
          filtered = members.filter((m) => m.status === "Active");
        } else if (recipient !== "all") {
          filtered = members.filter(
            (m) =>
              m.college?.toLowerCase().includes(recipient.toLowerCase()) ||
              m.role?.toLowerCase() === recipient.toLowerCase()
          );
        }
        emails = filtered.map((m) => m.email).filter(Boolean);
      } catch (fetchErr) {
        console.error("Failed to fetch members:", fetchErr);
        setStatusMsg({
          type: "error",
          text: "Could not fetch members. Make sure you are logged in.",
        });
        setIsSending(false);
        return;
      }

      if (emails.length === 0) {
        setStatusMsg({
          type: "error",
          text: "No members with valid emails found for this group.",
        });
        setIsSending(false);
        return;
      }

      setStatusMsg({
        type: "info",
        text: `Building Excel & sending to ${emails.length} recipients…`,
      });

      // 2️⃣  Build an Excel file in-memory from the emails list
      const excelBlob = buildExcelBlob(emails);
      const excelFile = new File([excelBlob], "recipients.xlsx", {
        type: excelBlob.type,
      });

      // 3️⃣  Assemble FormData exactly as the API expects
      const formData = new FormData();
      formData.append("subject", subject);       // → req.body.subject
      formData.append("email", body);             // → req.body.email  (HTML is OK)
      formData.append("excelFile", excelFile);    // → req.file

      // 4️⃣  Send the request
      //     The API uses chunked / streaming JSON responses, but axios
      //     buffers the whole response by default — that's fine for our use-case.
      const response = await api.post("/emails/bulk-send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // Longer timeout because the API sleeps 1 s between each email
        timeout: emails.length * 2000 + 30000,
      });

      // 5️⃣  Parse the chunked response (each line is a JSON object)
      const rawText = typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);

      const lines = rawText
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          try { return JSON.parse(line); } catch { return null; }
        })
        .filter(Boolean);

      setSendResults(lines);

      // Check for the completion message
      const completed = lines.find((l) => l.message === "Process Completed");
      const doneCount = lines.filter((l) => l.status === "Done").length;
      const failCount = lines.filter(
        (l) => l.status === "Rejected" || l.status === "Not email"
      ).length;

      if (completed) {
        setStatusMsg({
          type: "success",
          text: `Broadcast sent successfully! ${doneCount} delivered, ${failCount} failed.`,
        });
        // Reset form
        setSubject("");
        setBody("");
        setAttachments([]);
      } else {
        setStatusMsg({
          type: "success",
          text: `Request completed. ${doneCount} delivered, ${failCount} failed.`,
        });
      }
    } catch (error) {
      console.error("Send error:", error);
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to send broadcast.";
      setStatusMsg({ type: "error", text: msg });
    } finally {
      setIsSending(false);
    }
  };

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
                placeholder="Write your broadcast message here... (HTML tags like <b>, <h3> are supported)"
                rows={8}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-muted">
                  You can use plain text or HTML tags (e.g. &lt;b&gt;, &lt;h3&gt;).
                  All emails will include the IEEE SB footer automatically.
                </p>
                <span className="text-[11px] text-muted shrink-0 ml-2">
                  {body.length} chars
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-[#222936]">

            {/* Attachments chips */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-foreground"
                  >
                    <Paperclip size={12} className="text-muted shrink-0" />
                    <span className="truncate max-w-[140px]">{file.name}</span>
                    <span className="text-muted">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="text-muted hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Button row */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {isSending ? "Sending…" : "Send Broadcast"}
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground border border-gray-200 dark:border-[#222936] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Clock size={14} />
                Schedule
              </button>

              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Paperclip size={14} />
                Attach Files
              </button>
            </div>

            {/* Status message */}
            {statusMsg && (
              <div
                className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${
                  statusMsg.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : statusMsg.type === "error"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle size={14} />
                ) : statusMsg.type === "error" ? (
                  <AlertCircle size={14} />
                ) : (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {statusMsg.text}
              </div>
            )}
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
