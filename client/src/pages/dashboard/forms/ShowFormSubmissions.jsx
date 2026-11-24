import React, { useState, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { ArrowLeft, FileText, Loader2, ChevronDown, ChevronUp, Download, ExternalLink, ArrowDownUp, Check, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { useFormSubmissions } from "../../../hooks/dashboard/useGetSubmissions";
import { useExportFormSubmissions } from "../../../hooks/dashboard/forms/useExportFormSubmissions";
import { composeOtherValue } from "../../../data/fieldTypes";

function isFileUrl(value) {
  if (typeof value !== "string") return false;
  return (
    value.startsWith("http") &&
    (value.includes("cloudinary") || /\.(pdf|jpe?g|png|gif|webp|docx?|xlsx?)$/i.test(value))
  );
}

function isImageUrl(value) {
  if (typeof value !== "string") return false;
  return /\.(jpe?g|png|gif|webp)$/i.test(value);
}

function getFileNameFromUrl(url) {
  try {
    const parts = url.split("/");
    const last = parts[parts.length - 1].split("?")[0];
    return decodeURIComponent(last) || "Download";
  } catch {
    return "Download";
  }
}

function getAttachmentUrl(url) {
  if (url.includes("/raw/upload/")) {
    return url.replace("/raw/upload/", "/raw/upload/fl_attachment/");
  }
  if (url.includes("/image/upload/")) {
    return url.replace("/image/upload/", "/image/upload/fl_attachment/");
  }
  return url;
}

function SubmissionRow({
  submission,
  index,
  fieldLabelMap,
  fieldsById,
  tracksAttendance,
  columnCount,
  onToggleAttendance,
  isUpdating,
}) {
  const [expanded, setExpanded] = useState(false);

  const name =
    submission.userId?.name ||
    submission.registrantEmail?.split("@")[0] ||
    "Anonymous";
  const email =
    submission.userId?.email || submission.registrantEmail || "—";
  const date = submission.createdAt
    ? new Date(submission.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <tbody className="divide-y divide-gray-100 dark:divide-[#222936]">
      <tr className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
        <td className="px-4 py-3 text-xs text-muted">{index + 1}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{name}</p>
              <p className="text-xs text-muted">{email}</p>
            </div>
          </div>
        </td>
        {tracksAttendance && (
          <td className="px-4 py-3">
            <button
              type="button"
              onClick={() => onToggleAttendance(submission._id, submission.attended)}
              disabled={isUpdating}
              title={
                submission.attended
                  ? "Click to mark as Not Attended"
                  : "Click to mark as Attended"
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none hover:shadow-xs active:scale-95 ${
                submission.attended
                  ? "bg-green-100 text-green-700 hover:bg-green-200/80 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200/80 dark:bg-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {isUpdating ? (
                <Loader2 size={11} className="animate-spin shrink-0" />
              ) : (
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    submission.attended ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              )}
              <span>{submission.attended ? "Attended" : "Not Attended"}</span>
            </button>
            {submission.attended && submission.attendedAt && (
              <p className="text-[10px] text-muted mt-0.5 whitespace-nowrap">
                {new Date(submission.attendedAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </td>
        )}
        <td className="px-4 py-3 text-xs text-muted">{date}</td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
          >
            {expanded ? (
              <>
                Hide Answers <ChevronUp size={14} />
              </>
            ) : (
              <>
                View Answers <ChevronDown size={14} />
              </>
            )}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50/70 dark:bg-white/[0.02]">
          <td colSpan={columnCount} className="px-8 py-4">
            <div className="ml-2 overflow-x-auto rounded-lg border border-border">
              {submission.answers &&
              Object.keys(submission.answers).length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] dark:bg-[#202636] border-b border-border">
                      <th className="text-left font-semibold text-muted uppercase tracking-wide px-4 py-2.5 border-r border-border">
                        Question
                      </th>
                      <th className="text-left font-semibold text-muted uppercase tracking-wide px-4 py-2.5">
                        Response
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Object.entries(submission.answers).map(([key, value]) => (
                      <tr key={key}>
                        <td className="px-4 py-2.5 font-medium text-muted border-r border-border align-top">
                          {fieldLabelMap[key] || key}
                        </td>
                        <td className="px-4 py-2.5 text-foreground align-top">
                          {(() => {
                            // An "Other" choice is stored as the option, with the
                            // typed detail beside it, so join the two back up
                            // before rendering. Otherwise the row would say
                            // "Other" and the answer the committee needs is gone.
                            const field = fieldsById?.[key];
                            if (field) {
                              return String(
                                composeOtherValue(field, value, submission.otherAnswers) ?? ""
                              );
                            }
                            if (Array.isArray(value)) return value.join(", ");
                            if (isFileUrl(value)) {
                              if (isImageUrl(value)) {
                                return (
                                  <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex flex-col items-start gap-1 group"
                                  >
                                    <img
                                      src={value}
                                      alt={getFileNameFromUrl(value)}
                                      className="max-h-32 rounded-md border border-border object-cover"
                                    />
                                    <span className="inline-flex items-center gap-1 text-xs text-primary group-hover:underline">
                                      <ExternalLink size={12} />
                                      {getFileNameFromUrl(value)}
                                    </span>
                                  </a>
                                );
                              }
                              return (
                                <a
                                  href={getAttachmentUrl(value)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                                >
                                  <Download size={14} className="shrink-0" />
                                  {getFileNameFromUrl(value)}
                                </a>
                              );
                            }
                            return String(value);
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-muted italic px-4 py-3">
                  No answers provided
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </tbody>
  );
}

export default function ShowFormSubmissions() {
  const { formId } = useParams();
  // Still needed for `activityID` below. The title and the field list deliberately
  // do NOT come from here any more: router state is gone on a refresh or a shared
  // link, which used to leave every answer labelled with a raw field id.
  const location = useLocation();

  const {
    submissions,
    total,
    form,
    isLoading,
    error,
    toggleAttendance,
    updatingId,
  } = useFormSubmissions(formId);
  const { exporting, exportSubmissions } = useExportFormSubmissions();

  const formTitle = form?.title || "Form";
  // Only an `attendance` form mints a ticket, so only an `attendance` form can
  // say whether somebody turned up. We also check if any submission carries
  // attended status or ticket code as a safe fallback.
  const tracksAttendance =
    form?.type === "attendance" ||
    submissions.some((s) => s.attended || s.ticketCode);

  const attendedCount = useMemo(
    () => submissions.filter((s) => s.attended).length,
    [submissions]
  );

  // Memoised so the maps below are not rebuilt on every render: `|| []` makes a
  // fresh array each time, which would give the memos a new dependency every time.
  const fields = useMemo(() => form?.fields || [], [form?.fields]);
  const fieldLabelMap = Object.fromEntries(
    fields.map((f) => [f.id, f.label])
  );
  const fieldsById = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.id, f])),
    [fields]
  );

  // The row and its header each lose a cell, so the answers panel that spans the
  // table has to shrink with them or it overhangs by one column.
  const columnCount = tracksAttendance ? 5 : 4;

  const [sortOrder, setSortOrder] = useState("oldest");
  const [orderOpen, setOrderOpen] = useState(false);
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const sortedSubmissions = useMemo(() => {
    let list = submissions;
    if (tracksAttendance && attendanceFilter === "attended") {
      list = list.filter((s) => s.attended);
    } else if (tracksAttendance && attendanceFilter === "not_attended") {
      list = list.filter((s) => !s.attended);
    }
    return [...list].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return sortOrder === "oldest" ? ta - tb : tb - ta;
    });
  }, [submissions, tracksAttendance, attendanceFilter, sortOrder]);

  const handleToggleAttendance = async (submissionId, currentStatus) => {
    const res = await toggleAttendance(submissionId, currentStatus);
    if (res.success) {
      toast.success(
        res.attended ? "Marked as attended" : "Marked as not attended"
      );
    } else {
      toast.error(res.message);
    }
  };

  const handleExport = () => exportSubmissions(formId, formTitle);

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-muted">
            <Loader2 size={18} className="animate-spin" />
            Loading submissions...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/forms"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Forms
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{formTitle}</h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
              <span>
                <span className="font-semibold text-foreground">{total}</span>{" "}
                {total === 1 ? "response" : "responses"}
              </span>
              {tracksAttendance && (
                <>
                  <span>•</span>
                  <span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {attendedCount}
                    </span>{" "}
                    attended
                  </span>
                  <span>•</span>
                  <span>
                    <span className="font-semibold text-foreground">
                      {Math.max(0, total - attendedCount)}
                    </span>{" "}
                    not attended
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
        {!location.state?.activityID && (
          <Link
            to={`/applications/${formId}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors shrink-0"
          >
            <ExternalLink size={16} />
            View on Website
          </Link>
        )}
          {tracksAttendance && (
            <div className="relative">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors shrink-0"
                title="Filter by attendance"
              >
                <Filter size={15} />
                <span>
                  {attendanceFilter === "all"
                    ? "All"
                    : attendanceFilter === "attended"
                    ? "Attended"
                    : "Not Attended"}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${filterOpen ? "rotate-180" : ""}`}
                />
              </button>
              {filterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setFilterOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 z-20 bg-white dark:bg-[#1a1f2e] border border-gray-100 dark:border-[#222936] rounded-lg shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setAttendanceFilter("all");
                        setFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors ${
                        attendanceFilter === "all"
                          ? "font-semibold text-primary"
                          : "text-foreground"
                      }`}
                    >
                      All
                      {attendanceFilter === "all" && <Check size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        setAttendanceFilter("attended");
                        setFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors ${
                        attendanceFilter === "attended"
                          ? "font-semibold text-primary"
                          : "text-foreground"
                      }`}
                    >
                      Attended
                      {attendanceFilter === "attended" && <Check size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        setAttendanceFilter("not_attended");
                        setFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors ${
                        attendanceFilter === "not_attended"
                          ? "font-semibold text-primary"
                          : "text-foreground"
                      }`}
                    >
                      Not Attended
                      {attendanceFilter === "not_attended" && <Check size={14} />}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setOrderOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors shrink-0"
            >
              <ArrowDownUp size={16} />
              {sortOrder === "oldest" ? "Oldest" : "Newest"}
              <ChevronDown
                size={14}
                className={`transition-transform ${orderOpen ? "rotate-180" : ""}`}
              />
            </button>
            {orderOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOrderOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-40 z-20 bg-white dark:bg-[#1a1f2e] border border-gray-100 dark:border-[#222936] rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setSortOrder("oldest");
                      setOrderOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors ${
                      sortOrder === "oldest"
                        ? "font-semibold text-primary"
                        : "text-foreground"
                    }`}
                  >
                    Oldest
                    {sortOrder === "oldest" && <Check size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("newest");
                      setOrderOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors ${
                      sortOrder === "newest"
                        ? "font-semibold text-primary"
                        : "text-foreground"
                    }`}
                  >
                    Newest
                    {sortOrder === "newest" && <Check size={14} />}
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Export as Excel
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm overflow-hidden">
        {sortedSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] dark:bg-[#202636]">
                <tr className="*:text-left *:text-xs *:font-semibold *:text-muted *:uppercase *:tracking-wide *:py-3">
                  <th className="px-4 w-12">#</th>
                  <th className="px-4">RESPONDENT</th>
                  {tracksAttendance && <th className="px-4 w-32">ATTENDANCE</th>}
                  <th className="px-4 w-40">SUBMITTED</th>
                  <th className="px-4 w-32 text-right">ANSWERS</th>
                </tr>
              </thead>
              {sortedSubmissions.map((submission, i) => (
                <SubmissionRow
                  key={submission._id}
                  submission={submission}
                  index={i}
                  fieldLabelMap={fieldLabelMap}
                  fieldsById={fieldsById}
                  tracksAttendance={tracksAttendance}
                  columnCount={columnCount}
                  onToggleAttendance={handleToggleAttendance}
                  isUpdating={updatingId === submission._id}
                />
              ))}
            </table>
          </div>
        ) : submissions.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-3">
              <Filter size={20} className="text-muted" />
            </div>
            <h3 className="text-foreground font-semibold text-sm mb-1">
              No matching responses
            </h3>
            <p className="text-muted text-xs max-w-[280px] text-center mb-3">
              No submissions match the &quot;{attendanceFilter === "attended" ? "Attended" : "Not Attended"}&quot; filter.
            </p>
            <button
              onClick={() => setAttendanceFilter("all")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4">
              <FileText size={24} className="text-muted" />
            </div>
            <h3 className="text-foreground font-semibold text-base mb-1">
              No responses yet
            </h3>
            <p className="text-muted text-sm max-w-[280px] text-center">
              This form hasn&apos;t received any responses yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
