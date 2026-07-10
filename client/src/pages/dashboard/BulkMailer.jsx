import React, { useState, useRef } from "react";
import {
  Send,
  Clock,
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
  Bold,
  Italic,
  Link,
  Image as ImageIcon,
  Filter,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../utils/api";
import { useSearchMembers } from "../../hooks/dashboard/useSearchMembers";

/* ────────────────────────────────────────────────────────────────
   Helper: Build an .xlsx Blob from selected rows (API or Excel).
   The backend now reads headers. We ensure "Email" is explicit.
   ──────────────────────────────────────────────────────────────── */
function buildFinalExcelBlob(selectedRows, emailColName) {
  if (!selectedRows || selectedRows.length === 0) return null;

  // Collect all unique keys across all rows, excluding the email column and our internal ID
  const allKeys = new Set();
  selectedRows.forEach((row) => {
    Object.keys(row).forEach((k) => {
      if (
        k !== "_excelRowId" &&
        String(k).trim() !== String(emailColName).trim()
      ) {
        allKeys.add(k);
      }
    });
  });

  const headers = ["Email", ...Array.from(allKeys)];
  const wsData = [headers];

  selectedRows.forEach((row) => {
    const rowData = [row[emailColName] || ""];
    Array.from(allKeys).forEach((k) => {
      rowData.push(row[k] || "");
    });
    wsData.push(rowData);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Recipients");
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
  const bodyRef = useRef(null);

  const insertAtCursor = (prefix, suffix = "") => {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = body;
    const selectedText = current.substring(start, end);
    const textToInsert = prefix + selectedText + suffix;

    setBody(
      current.substring(0, start) + textToInsert + current.substring(end),
    );
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length + selectedText.length,
        start + prefix.length + selectedText.length,
      );
    }, 0);
  };

  // ── Recipients State ──
  const [recipientMode, setRecipientMode] = useState("api"); // 'api' | 'excel'
  const [selectedEmails, setSelectedEmails] = useState(new Set());

  // Excel Mode
  const [recipientExcel, setRecipientExcel] = useState(null);
  const recipientExcelInputRef = useRef(null);
  const [excelMembers, setExcelMembers] = useState([]);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [emailColumn, setEmailColumn] = useState("");

  // Use Custom Hook for Members (Detailed Search)
  const {
    members,
    loading: loadingMembers,
    search,
    setSearch,
    collegeFilters,
    yearFilters,
    roleFilters,
    activeColleges,
    toggleCollege,
    activeYears,
    toggleYear,
    activeRoles,
    toggleRole,
  } = useSearchMembers({ pageSize: 2000 });

  // Derived state for what to show in the list
  const activeMembersToDisplay = React.useMemo(() => {
    if (recipientMode === "api") return members;

    let filtered = excelMembers;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((m) =>
        Object.values(m).some((val) => String(val).toLowerCase().includes(s)),
      );
    }

    // Dynamic Role filter for Excel if a 'Role' column exists
    const roleHeader = excelHeaders.find(
      (h) => String(h).toLowerCase() === "role",
    );
    if (roleHeader && activeRoles.length > 0) {
      filtered = filtered.filter((m) => activeRoles.includes(m[roleHeader]));
    }

    return filtered;
  }, [recipientMode, members, excelMembers, search, activeRoles, excelHeaders]);

  const getEmailVal = (m) =>
    recipientMode === "api" ? m.email : m[emailColumn];

  // Handlers for selection
  const handleSelectAll = () => {
    const currentList = activeMembersToDisplay;
    const allSelected =
      currentList.length > 0 &&
      currentList.every((m) => selectedEmails.has(getEmailVal(m)));

    const newSet = new Set(selectedEmails);
    if (allSelected) {
      currentList.forEach((m) => newSet.delete(getEmailVal(m)));
    } else {
      currentList.forEach((m) => {
        const e = getEmailVal(m);
        if (e) newSet.add(e);
      });
    }
    setSelectedEmails(newSet);
  };

  const handleSelectMember = (m) => {
    const email = getEmailVal(m);
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
      const file = e.target.files[0];
      setRecipientExcel(file);

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];

          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
          if (data.length > 0) {
            const headers = data[0].map((h) => String(h).trim());
            setExcelHeaders(headers);

            const guessedEmail =
              headers.find((h) => h.toLowerCase().includes("mail")) ||
              headers[0];
            setEmailColumn(guessedEmail);

            const rows = XLSX.utils.sheet_to_json(ws);
            const mappedRows = rows.map((r, i) => ({ ...r, _excelRowId: i }));
            setExcelMembers(mappedRows);
          }
        } catch (error) {
          console.error("Error parsing excel", error);
          setStatusMsg({ type: "error", text: "Failed to parse Excel file." });
        }
      };
      reader.readAsBinaryString(file);
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

    if (selectedEmails.size === 0) {
      setStatusMsg({
        type: "error",
        text: "Please select at least one recipient.",
      });
      return;
    }

    setStatusMsg({ type: "info", text: "Generating recipient list..." });

    let selectedRows = [];
    if (recipientMode === "api") {
      selectedRows = members.filter((m) => selectedEmails.has(m.email));
      const excelBlob = buildFinalExcelBlob(selectedRows, "email");
      excelFile = new File([excelBlob], "recipients.xlsx", {
        type: excelBlob.type,
      });
    } else {
      if (!recipientExcel || excelMembers.length === 0) {
        setStatusMsg({
          type: "error",
          text: "Please upload an Excel file containing recipients.",
        });
        return;
      }
      selectedRows = excelMembers.filter((m) =>
        selectedEmails.has(m[emailColumn]),
      );
      const excelBlob = buildFinalExcelBlob(selectedRows, emailColumn);
      excelFile = new File([excelBlob], "recipients.xlsx", {
        type: excelBlob.type,
      });
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
      <div className="max-w-4xl mx-auto space-y-5">
        {/* ─── Compose Form ─────────────────────────────── */}
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wide">
                  Message Body
                </label>
              </div>
              <div className="border border-gray-200 dark:border-[#222936] rounded-lg overflow-hidden bg-white dark:bg-[#111827] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-colors">
                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-[#222936] bg-gray-50 dark:bg-[#1a1f2e]">
                  <button
                    type="button"
                    onClick={() => insertAtCursor("<b>", "</b>")}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor("<i>", "</i>")}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertAtCursor('<a href="URL_HERE">', "</a>")
                    }
                    className="p-1.5 text-muted hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Insert Link"
                  >
                    <Link size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertAtCursor('<img src="IMAGE_URL_HERE" alt="Image" />')
                    }
                    className="p-1.5 text-muted hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Insert Image"
                  >
                    <ImageIcon size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Attach File"
                  >
                    <Paperclip size={14} />
                  </button>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  {(recipientMode === "api" 
                    ? ["Name", "Email", "Role"] 
                    : excelHeaders
                  ).map((header) => (
                    <button
                      key={header}
                      type="button"
                      onClick={() => insertAtCursor(`[${header}]`)}
                      className="px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 rounded transition-colors"
                    >
                      Insert [{header}]
                    </button>
                  ))}
                </div>
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your broadcast message here..."
                  rows={6}
                  className="w-full px-3 py-2.5 bg-transparent text-sm text-foreground placeholder:text-muted/60 outline-none resize-y min-h-[120px]"
                />
              </div>
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

          {recipientMode === "excel" && !recipientExcel && (
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
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
              >
                <div className="flex flex-col items-center">
                  <UploadCloud size={32} className="text-muted mb-3" />
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Upload Excel File
                  </p>
                  <p className="text-xs text-muted max-w-xs mx-auto">
                    The first row must contain column headers. We'll extract
                    variables based on them.
                  </p>
                </div>
              </div>
            </div>
          )}

          {(recipientMode === "api" ||
            (recipientMode === "excel" && recipientExcel)) && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {recipientMode === "excel" && excelHeaders.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">
                      Primary Email Column
                    </span>
                    <span className="text-[10px] text-muted">
                      Select the column containing recipient emails.
                    </span>
                  </div>
                  <select
                    value={emailColumn}
                    onChange={(e) => setEmailColumn(e.target.value)}
                    className="ml-auto bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#222936] text-xs font-medium rounded-md px-3 py-1.5 focus:outline-none focus:border-primary"
                  >
                    {excelHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecipientExcel(null);
                      setExcelMembers([]);
                      setExcelHeaders([]);
                      setSelectedEmails(new Set());
                    }}
                    className="ml-2 text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 bg-red-50 dark:bg-red-500/10 rounded"
                  >
                    Remove File
                  </button>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] focus-within:border-primary transition-colors">
                  <Search size={14} className="text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder={
                      recipientMode === "excel"
                        ? "Search inside Excel..."
                        : "Search name or email..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted/60"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  {/* Dynamic Role Filter for Excel Mode, Standard Filters for API Mode */}
                  {recipientMode === "api" && (
                    <>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <div className="flex items-center gap-1 mr-2">
                          <Filter className="w-3.5 h-3.5 text-muted" />
                          <span className="text-[11px] text-muted font-bold uppercase tracking-wider">
                            College
                          </span>
                        </div>
                        {collegeFilters.map((college) => (
                          <button
                            key={college}
                            onClick={() => toggleCollege(college)}
                            className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                              activeColleges.includes(college)
                                ? "bg-primary text-white border-primary"
                                : "bg-gray-50 dark:bg-[#1a1f2e] text-muted border-gray-200 dark:border-[#222936] hover:border-primary hover:text-primary"
                            }`}
                          >
                            {college}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <div className="flex items-center gap-1 mr-2">
                          <Filter className="w-3.5 h-3.5 text-muted" />
                          <span className="text-[11px] text-muted font-bold uppercase tracking-wider">
                            Year
                          </span>
                        </div>
                        {yearFilters.map((year) => (
                          <button
                            key={year}
                            onClick={() => toggleYear(year)}
                            className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                              activeYears.includes(year)
                                ? "bg-primary text-white border-primary"
                                : "bg-gray-50 dark:bg-[#1a1f2e] text-muted border-gray-200 dark:border-[#222936] hover:border-primary hover:text-primary"
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Shared Role Filter (if available in Excel) */}
                  {(recipientMode === "api" ||
                    (recipientMode === "excel" &&
                      excelHeaders.find(
                        (h) => String(h).toLowerCase() === "role",
                      ))) && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <div className="flex items-center gap-1 mr-2">
                        <Filter className="w-3.5 h-3.5 text-muted" />
                        <span className="text-[11px] text-muted font-bold uppercase tracking-wider">
                          Role
                        </span>
                      </div>
                      {(recipientMode === "excel"
                        ? [
                            ...new Set(
                              excelMembers.map(
                                (m) =>
                                  m[
                                    excelHeaders.find(
                                      (h) => String(h).toLowerCase() === "role",
                                    )
                                  ],
                              ),
                            ),
                          ].filter(Boolean)
                        : roleFilters
                      ).map((role) => (
                        <button
                          key={role}
                          onClick={() => toggleRole(role)}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                            activeRoles.includes(role)
                              ? "bg-primary text-white border-primary"
                              : "bg-gray-50 dark:bg-[#1a1f2e] text-muted border-gray-200 dark:border-[#222936] hover:border-primary hover:text-primary"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
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
                      {activeMembersToDisplay.length > 0 &&
                      activeMembersToDisplay.every((m) =>
                        selectedEmails.has(getEmailVal(m)),
                      ) ? (
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
                  {loadingMembers && recipientMode === "api" ? (
                    <div className="flex justify-center py-8">
                      <Loader2 size={20} className="animate-spin text-muted" />
                    </div>
                  ) : activeMembersToDisplay.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted">
                      No members found matching filters.
                    </div>
                  ) : (
                    activeMembersToDisplay.map((m) => {
                      const email = getEmailVal(m);
                      const key =
                        recipientMode === "api" ? m.id : m._excelRowId;
                      // Try to guess a "name" column for Excel mode display, fallback to email
                      const nameHeader =
                        recipientMode === "excel"
                          ? excelHeaders.find((h) =>
                              String(h).toLowerCase().includes("name"),
                            )
                          : "name";
                      const name =
                        recipientMode === "api"
                          ? m.name
                          : m[nameHeader] || email;
                      const roleHeader =
                        recipientMode === "excel"
                          ? excelHeaders.find(
                              (h) => String(h).toLowerCase() === "role",
                            )
                          : "role";
                      const role =
                        recipientMode === "api" ? m.role : m[roleHeader];

                      return (
                        <div
                          key={key}
                          onClick={() => handleSelectMember(m)}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md cursor-pointer transition-colors"
                        >
                          <div
                            className={`flex items-center justify-center w-4 h-4 rounded-[4px] border transition-colors ${
                              selectedEmails.has(email)
                                ? "bg-primary border-primary text-white"
                                : "border-gray-300 dark:border-gray-600 bg-transparent"
                            }`}
                          >
                            {selectedEmails.has(email) && (
                              <CheckSquare size={14} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground truncate mr-2">
                              {name || email}
                            </span>
                            <div className="flex gap-2 shrink-0">
                              {role && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-muted font-medium uppercase">
                                  {role}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
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
            {/* <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Paperclip size={14} />
              Attach Files
            </button> */}
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
    </div>
  );
}
