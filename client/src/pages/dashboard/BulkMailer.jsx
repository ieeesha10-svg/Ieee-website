import React, { useState, useRef } from "react";
import {
  Send,
  Clock,
  Mail,
  Paperclip,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  Users,
  FileSpreadsheet,
  UploadCloud,
  CheckSquare,
  Square,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../utils/api";
import { emailHistoryData } from "../../data/emailData";
import { useBulkMembers } from "../../hooks/dashboard/useBulkMembers";

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
      <span
        className={`text-[11px] font-bold mt-1 inline-block ${
          color === "bg-primary" ? "text-primary" : "text-primary"
        }`}
      >
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
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success'|'error'|'info', text: '' }
  const [sendResults, setSendResults] = useState([]); // streamed chunk results
  const fileInputRef = useRef(null);

  // ── Recipients State ──
  const [recipientMode, setRecipientMode] = useState("api"); // 'api' | 'excel'
  const [selectedEmails, setSelectedEmails] = useState(new Set());

  // Excel Mode
  const [recipientExcel, setRecipientExcel] = useState(null);
  const recipientExcelInputRef = useRef(null);

  // Use Custom Hook for Members
  const {
    members,
    loadingMembers,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    filterCollege,
    setFilterCollege,
    uniqueColleges,
  } = useBulkMembers();

  // Handlers for selection
  const handleSelectAll = () => {
    if (
      members.length > 0 &&
      members.every((m) => selectedEmails.has(m.email))
    ) {
      // Deselect all filtered
      const newSet = new Set(selectedEmails);
      members.forEach((m) => newSet.delete(m.email));
      setSelectedEmails(newSet);
    } else {
      // Select all filtered
      const newSet = new Set(selectedEmails);
      members.forEach((m) => {
        if (m.email) newSet.add(m.email);
      });
      setSelectedEmails(newSet);
    }
  };

  const handleSelectMember = (email) => {
    if (!email) return;
    const newSet = new Set(selectedEmails);
    if (newSet.has(email)) newSet.delete(email);
    else newSet.add(email);
    setSelectedEmails(newSet);
  };

  /* ── Attachment handlers (Email Attachments) ─────────────────── */
  const handleAttachmentChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...filesArray].slice(0, 5));
    }
    e.target.value = "";
  };
  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Recipient Excel Handler ─────────────────────────────────── */
  const handleRecipientExcelChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setRecipientExcel(e.target.files[0]);
    }
    e.target.value = "";
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

    let excelFile;

    if (recipientMode === "api") {
      if (selectedEmails.size === 0) {
        setStatusMsg({
          type: "error",
          text: "Please select at least one recipient.",
        });
        return;
      }
      setStatusMsg({ type: "info", text: "Generating recipient list..." });
      const excelBlob = buildExcelBlob(Array.from(selectedEmails));
      excelFile = new File([excelBlob], "recipients.xlsx", {
        type: excelBlob.type,
      });
    } else {
      if (!recipientExcel) {
        setStatusMsg({
          type: "error",
          text: "Please upload an Excel file containing recipients.",
        });
        return;
      }
      excelFile = recipientExcel;
    }

    setIsSending(true);
    setSendResults([]);
    setStatusMsg({ type: "info", text: "Sending broadcast..." });

    try {
      // Assemble FormData exactly as the API expects
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("email", body);
      formData.append("excelFile", excelFile);

      // Email Attachments
      attachments.forEach((file) => {
        formData.append("emailAttachments", file);
      });

      // Send the request
      const response = await api.post("/emails/bulk-send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // Timeout based on an estimated number of emails if known, else large
        timeout: Math.max(selectedEmails.size * 2000, 30000),
      });

      // Parse the chunked response
      const rawText =
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data);

      const lines = rawText
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      setSendResults(lines);

      // Check for the completion message
      const completed = lines.find((l) => l.message === "Process Completed");
      const doneCount = lines.filter((l) => l.status === "Done").length;
      const failCount = lines.filter(
        (l) => l.status === "Rejected" || l.status === "Not email",
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
        setSelectedEmails(new Set());
        setRecipientExcel(null);
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
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm p-5 md:p-6">
            <h2 className="text-base font-bold text-foreground mb-5">
              New Broadcast
            </h2>

            <div className="space-y-6">
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

              {/* Message Body */}
              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
                  Message Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your broadcast message here... (HTML tags like <b>, <h3> are supported)"
                  rows={6}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-muted">
                    You can use plain text or HTML tags. Footer is added
                    automatically.
                  </p>
                  <span className="text-[11px] text-muted shrink-0 ml-2">
                    {body.length} chars
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recipients Section */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                Recipients
              </h3>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setRecipientMode("api")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    recipientMode === "api"
                      ? "bg-white dark:bg-[#1a1f2e] text-primary shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Users size={14} /> From Members
                </button>
                <button
                  onClick={() => setRecipientMode("excel")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    recipientMode === "excel"
                      ? "bg-white dark:bg-[#1a1f2e] text-primary shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <FileSpreadsheet size={14} /> Upload Excel
                </button>
              </div>
            </div>

            {recipientMode === "api" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] focus-within:border-primary transition-colors">
                    <Search size={14} className="text-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="Search name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted/60"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-2 py-2 text-xs rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="all">All Roles</option>
                      <option value="member">Member</option>
                      <option value="scanner">Scanner</option>
                      <option value="xcom">XCom</option>
                      <option value="board">Board</option>
                    </select>
                    <select
                      value={filterCollege}
                      onChange={(e) => setFilterCollege(e.target.value)}
                      className="px-2 py-2 text-xs rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-foreground focus:outline-none focus:border-primary max-w-30"
                    >
                      <option value="all">All Colleges</option>
                      {uniqueColleges.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* List */}
                <div className="border border-gray-200 dark:border-[#222936] rounded-lg overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-[#202636] border-b border-gray-200 dark:border-[#222936]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSelectAll}
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        {members.length > 0 &&
                        members.every((m) => selectedEmails.has(m.email)) ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} className="text-muted" />
                        )}
                      </button>
                      <span className="text-xs font-semibold text-foreground">
                        Select All Filtered
                      </span>
                    </div>
                    <span className="text-xs text-muted font-medium">
                      {selectedEmails.size} Selected
                    </span>
                  </div>

                  <div className="max-h-62.5 overflow-y-auto p-1 bg-white dark:bg-[#1a1f2e]">
                    {loadingMembers ? (
                      <div className="flex justify-center py-8">
                        <Loader2
                          size={20}
                          className="animate-spin text-muted"
                        />
                      </div>
                    ) : members.length === 0 ? (
                      <div className="text-center py-8 text-xs text-muted">
                        No members found matching filters.
                      </div>
                    ) : (
                      members.map((m) => (
                        <label
                          key={m._id || m.email}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md cursor-pointer transition-colors"
                        >
                          <div
                            className={`flex items-center justify-center w-4 h-4 rounded-[4px] border transition-colors ${
                              selectedEmails.has(m.email)
                                ? "bg-primary border-primary text-white"
                                : "border-gray-300 dark:border-gray-600 bg-transparent"
                            }`}
                          >
                            {selectedEmails.has(m.email) && (
                              <CheckSquare size={14} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground truncate mr-2">
                              {m.name || m.email}
                            </span>
                            <div className="flex gap-2 shrink-0">
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-muted font-medium uppercase">
                                {m.role || "Member"}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {recipientMode === "excel" && (
              <div className="animate-in fade-in duration-300">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  ref={recipientExcelInputRef}
                  onChange={handleRecipientExcelChange}
                />
                <div
                  onClick={() => recipientExcelInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    recipientExcel
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  {recipientExcel ? (
                    <div className="flex flex-col items-center">
                      <FileSpreadsheet
                        size={32}
                        className="text-primary mb-3"
                      />
                      <p className="text-sm font-semibold text-foreground mb-1">
                        {recipientExcel.name}
                      </p>
                      <p className="text-xs text-muted">
                        {(recipientExcel.size / 1024).toFixed(0)} KB
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRecipientExcel(null);
                        }}
                        className="mt-3 text-xs text-red-500 hover:text-red-600 font-medium"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud size={32} className="text-muted mb-3" />
                      <p className="text-sm font-semibold text-foreground mb-1">
                        Upload Excel File
                      </p>
                      <p className="text-xs text-muted max-w-xs mx-auto">
                        Column A of the first sheet must contain the emails. No
                        headers.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm p-5 md:p-6">
            {/* Attachments chips */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
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
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {isSending ? "Sending…" : "Send Broadcast"}
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground border border-gray-200 dark:border-[#222936] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Clock size={14} />
                Schedule
              </button>

              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleAttachmentChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Paperclip size={14} />
                Attach Files
              </button>
            </div>

            {/* Status message */}
            {statusMsg && (
              <div
                className={`flex items-center gap-2 text-xs font-medium px-4 py-3 rounded-lg mt-4 ${
                  statusMsg.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : statusMsg.type === "error"
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle size={16} />
                ) : statusMsg.type === "error" ? (
                  <AlertCircle size={16} />
                ) : (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {statusMsg.text}
              </div>
            )}
          </div>
        </div>

        {/* ─── Right: Send History ────────────────────────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm overflow-hidden h-fit">
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
