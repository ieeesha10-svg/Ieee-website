import React, { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { ArrowLeft, FileText, Loader2, ChevronDown, ChevronUp, Download } from "lucide-react";
import { useFormSubmissions } from "../../../hooks/dashboard/useGetSubmissions";
import api from "../../../utils/api";
import toast from "react-hot-toast";

function SubmissionRow({ submission, index, fieldLabelMap }) {
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
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              submission.status === "attended"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : submission.status === "approved"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : submission.status === "rejected"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
            }`}
          >
            {submission.status}
          </span>
        </td>
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
          <td colSpan={5} className="px-4 py-4">
            <div className="ml-2 space-y-2">
              {submission.answers &&
                Object.entries(submission.answers).map(([key, value]) => (
                  <div key={key} className="flex gap-3 text-sm">
                    <span className="font-medium text-muted min-w-[140px]">
                      {fieldLabelMap[key] || key}
                    </span>
                    <span className="text-foreground">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </span>
                  </div>
                ))}
              {(!submission.answers ||
                Object.keys(submission.answers).length === 0) && (
                <p className="text-sm text-muted italic">No answers provided</p>
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
  const location = useLocation();
  const formTitle = location.state?.formTitle || "Form";
  const fields = location.state?.fields || [];
  const fieldLabelMap = Object.fromEntries(
    fields.map((f) => [f.id, f.label])
  );

  const { submissions, total, isLoading, error } = useFormSubmissions(formId);

  const handleExport = async () => {
    try {
      const response = await api.get(`/submissions/export/${formId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${formTitle}_responses.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export submissions");
    }
  };

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
            <p className="text-xs text-muted">
              <span className="font-semibold text-foreground">{total}</span>{" "}
              {total === 1 ? "response" : "responses"}
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm shrink-0"
        >
          <Download size={16} />
          Export as Excel
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm overflow-hidden">
        {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] dark:bg-[#202636]">
                <tr className="*:text-left *:text-xs *:font-semibold *:text-muted *:uppercase *:tracking-wide *:py-3">
                  <th className="px-4 w-12">#</th>
                  <th className="px-4">RESPONDENT</th>
                  <th className="px-4 w-28">STATUS</th>
                  <th className="px-4 w-40">SUBMITTED</th>
                  <th className="px-4 w-32 text-right">ANSWERS</th>
                </tr>
              </thead>
              {submissions.map((submission, i) => (
                <SubmissionRow
                  key={submission._id}
                  submission={submission}
                  index={i}
                  fieldLabelMap={fieldLabelMap}
                />
              ))}
            </table>
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
