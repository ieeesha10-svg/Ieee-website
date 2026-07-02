import React from "react";
import { FileText, Eye, Plus } from "lucide-react";
import { useForms } from "../../hooks/dashboard/useForms";

/* ─── Toggle Switch ────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ─── Single Form Row ──────────────────────────────────────────── */
function FormRow({ form, onToggle }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-5 py-4 border-b border-gray-100 dark:border-[#222936] last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
      {/* Icon + Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center shrink-0">
          <FileText size={16} className="text-muted" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate">
            {form.title}
          </h4>
          <p className="text-xs text-muted">
            <span className="font-semibold">{form.responses}</span> responses
            <span className="mx-1.5 text-border">·</span>
            Created {form.createdAt}
          </p>
        </div>
      </div>

      {/* Status + Actions */}
      <div className="flex items-center gap-4 sm:gap-5 ml-12 sm:ml-0 shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-bold ${
              form.isOpen
                ? "text-green-600 dark:text-green-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {form.isOpen ? "Open" : "Closed"}
          </span>
          <Toggle checked={form.isOpen} onChange={() => onToggle(form.id)} />
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-[#222936] text-foreground rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <Eye size={13} className="text-primary" />
          View Results
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────── */
export default function DashboardForms() {
  const { forms, toggleFormStatus, openCount, closedCount, totalResponses } =
    useForms();

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5">
      {/* Top Bar: Stats + New Form Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Stat Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#1a1f2e] text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {openCount} Open
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#1a1f2e] text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            {closedCount} Closed
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#1a1f2e] text-muted">
            <span className="text-primary font-extrabold">
              {totalResponses}
            </span>
            total responses
          </span>
        </div>

        {/* Action Button */}
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm w-full sm:w-auto">
          <Plus size={16} />
          New Form
        </button>
      </div>

      {/* Forms List */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm overflow-hidden">
        {forms.length > 0 ? (
          forms.map((form) => (
            <FormRow
              key={form.id}
              form={form}
              onToggle={toggleFormStatus}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4">
              <FileText size={24} className="text-muted" />
            </div>
            <h3 className="text-foreground font-semibold text-base mb-1">
              No forms yet
            </h3>
            <p className="text-muted text-sm max-w-[280px] text-center">
              Create your first registration form to start collecting responses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
