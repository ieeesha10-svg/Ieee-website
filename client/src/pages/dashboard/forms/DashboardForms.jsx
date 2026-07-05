import React, { useState } from "react";
import { FileText, Clipboard, Calendar, Eye, Plus, Trash2, X, Check, ChevronDown } from "lucide-react";
import { useForms } from "../../../hooks/dashboard/useGetForms";
import DeleteModal from "../../../components/DeleteModal";
import DashFormsSkeleton from "../../../components/skeletons/DashFormsSkeleton";
import { Link } from "react-router-dom";

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

/* ─── Fields Modal ─────────────────────────────────────────────── */
function FieldsModal({ form, onClose }) {
  if (!form) return null;
  const fieldTypeLabel = (type) => {
    const map = { TextInput: "Short Text", TextArea: "Paragraph", Dropdown: "Dropdown", Checkbox: "Checkbox" };
    return map[type] || type;
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#222936]">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-foreground truncate">{form.title}</h2>
            <p className="text-xs text-muted">{form.fields?.length ?? 0} field{(form.fields?.length ?? 0) !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {form.fields && form.fields.length > 0 ? (
            form.fields.map((field, i) => (
              <div key={field._id || i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-[#222936]">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-primary">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground truncate">{field.label || "Untitled"}</h4>
                    {field.required && <span className="text-[10px] font-bold text-red-500 shrink-0">*</span>}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    <span className="font-medium">{fieldTypeLabel(field.type)}</span>
                    {(field.type === "Dropdown" || field.type === "Checkbox") && field.options?.length > 0 && (
                      <span className="text-muted">
                        <span className="mx-1.5 text-border">·</span>
                        {field.options.length} option{field.options.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                  {(field.type === "Dropdown" || field.type === "Checkbox") && field.options?.length > 0 && (
                    <details className="mt-1.5 group">
                      <summary className="inline-flex items-center gap-1 text-[11px] font-medium text-primary cursor-pointer hover:underline">
                        <ChevronDown size={11} className="transition-transform group-open:rotate-180" />
                        View options
                      </summary>
                      <ul className="mt-1.5 space-y-1">
                        {field.options.map((opt, j) => (
                          <li key={j} className="flex items-center gap-1.5 text-xs text-muted">
                            {field.type === "Checkbox" ? (
                              <Check size={10} className="text-green-500 shrink-0" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-muted shrink-0" />
                            )}
                            {opt}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted text-center py-6">This form has no fields.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Single Form Row ──────────────────────────────────────────── */
function FormRow({ form, onToggle, onDelete, onViewFields }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-5 py-4 border-b border-gray-100 dark:border-[#222936] last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
      {/* Icon + Info */}
      <button type="button" onClick={() => onViewFields(form)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${form.activityID ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-100 dark:bg-gray-700/50"}`}>
          {form.activityID ? (
            <Calendar size={16} className="text-blue-500 dark:text-blue-400" />
          ) : (
            <Clipboard size={16} className="text-muted" />
          )}
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
      </button>

      {/* Status + Actions */}
      <div className="flex items-center justify-end gap-4 sm:gap-5">
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
        {form.responses > 0 ? (
          <Link
            to={`/dashboard/forms/submissions/${form.id}`}
            state={{ formTitle: form.title, fields: form.fields }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-[#222936] text-foreground rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Eye size={13} className="text-primary" />
            View Results
          </Link>
        ) : (
          <div className="relative group">
            <button
              disabled
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-[#222936] text-muted rounded-lg opacity-50 cursor-not-allowed"
            >
              <Eye size={13} />
              View Results
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium text-white bg-gray-800 dark:bg-gray-700 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              This form does not have any responders
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-700 rotate-45" />
            </div>
          </div>
        )}
        {!form.activityID && (
          <button
            type="button"
            onClick={() => onDelete(form.id)}
            aria-label={`Delete ${form.title}`}
            className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────── */
export default function DashboardForms() {
  const { forms, isLoading, toggleFormStatus, deleteForm, openCount, closedCount, totalResponses } =
    useForms();
  const [deletingId, setDeletingId] = useState(null);
  const [fieldsModalForm, setFieldsModalForm] = useState(null);
  const [filter, setFilter] = useState("all");

  if (isLoading) return <DashFormsSkeleton />;

  const filteredForms = forms.filter((f) => {
    if (filter === "open") return f.isOpen;
    if (filter === "closed") return !f.isOpen;
    if (filter === "events") return !!f.activityID;
    return true;
  });

  const formToDelete = forms.find((f) => f.id === deletingId);

  const pill = (key, label, dotColor, count) => (
    <button
      onClick={() => setFilter(filter === key ? "all" : key)}
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
        filter === key
          ? "bg-primary text-white border-primary"
          : "border-gray-200 dark:border-[#222936] bg-white dark:bg-[#1a1f2e] text-foreground"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${filter === key ? "bg-white" : dotColor}`} />
      {count} {label}
    </button>
  );

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5">
      {/* Top Bar: Stats + New Form Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Stat Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {pill("all", "All", "bg-primary", forms.length)}
          {pill("open", "Open", "bg-primary", openCount)}
          {pill("closed", "Closed", "bg-gray-400", closedCount)}
          {pill("events", "Event Forms", "bg-blue-500", forms.filter((f) => f.activityID).length)}
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#1a1f2e] opacity-70">
            <span className="text-primary font-extrabold">
              {totalResponses}
            </span>
            Total Responses
          </span>
        </div>

				{/* Action Button */}
        <Link to={'/dashboard/forms/create-form'}>
	        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm w-full sm:w-auto">
	          <Plus size={16} />
	          New Form
					</button>
        </Link>
      </div>

      {/* Forms List */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm">
        {filteredForms.length > 0 ? (
          filteredForms.map((form) => (
            <FormRow
              key={form.id}
              form={form}
              onToggle={toggleFormStatus}
              onDelete={setDeletingId}
              onViewFields={setFieldsModalForm}
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

      <FieldsModal
        form={fieldsModalForm}
        onClose={() => setFieldsModalForm(null)}
      />

      <DeleteModal
        isOpen={!!deletingId}
        title="Delete form"
        description={
          formToDelete
            ? `Are you sure you want to delete "${formToDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this form? This action cannot be undone."
        }
        onConfirm={() => {
          if (deletingId) deleteForm(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
