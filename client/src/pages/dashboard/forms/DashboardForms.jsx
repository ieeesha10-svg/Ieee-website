import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, Clipboard, Calendar, UserPlus, ClipboardList, MessageSquare, Eye, Plus, Trash2, Check, ChevronDown, Pencil, ExternalLink } from "lucide-react";
// Hooks & data
import { useForms } from "../../../hooks/dashboard/forms/useForms";
import { useDeleteForm } from "../../../hooks/dashboard/forms/useDeleteForm";
import { useToggleForm } from "../../../hooks/dashboard/forms/useToggleForm";
import { useUpdateForm } from "../../../hooks/dashboard/forms/useUpdateForm";
import { SURVEY_COLOR, FEEDBACK_COLOR, CUSTOM_COLOR } from "../../../data/formTypes";
// Components
import DeleteModal from "../../../components/DeleteModal";
import RequiredAsterisk from "../../../components/RequiredAsterisk";
import DashFormsSkeleton from "../../../components/skeletons/DashFormsSkeleton";
import Modal from "../../../components/Modal";
import Pagination from "../../../components/events/Pagination";

/*Toggle Switch */
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

/* Fields Modal */
function FieldsModal({ form, onClose }) {
  const fieldTypeLabel = (type) => {
    const map = { TextInput: "Short Text", TextArea: "Paragraph", Dropdown: "Dropdown", Checkbox: "Checkbox" };
    return map[type] || type;
  };
  return (
    <Modal open={!!form} onClose={onClose} title={form?.title || ""}>
			{form && !form.activityID && (
				<>
					<h3 className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Form Details</h3>
					<div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-[#222936] text-xs">
						{form.description && (
              <div className="col-span-2">
                <span className="font-bold text-muted">Description:</span>
                <p className="text-foreground mt-0.5">{form.description}</p>
              </div>
            )}
            <div>
              <span className="font-bold text-muted">Type:</span>
              <p className="text-foreground capitalize">{form.formType || "custom"}</p>
            </div>
            <div>
              <span className="font-bold text-muted">Max Submissions:</span>
              <p className="text-foreground">{form.maxSubmissions ? String(form.maxSubmissions) : "Unlimited"}</p>
            </div>
            <div>
              <span className="font-bold text-muted">Max Submissions:</span>
              <p className="text-foreground">{form.maxSubmissions ? String(form.maxSubmissions) : "Unlimited"}</p>
            </div>
          </div>

          <h3 className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Activity</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-[#222936] text-xs">
            <div>
              <span className="font-bold text-muted">Created:</span>
              <p className="text-foreground">{form.createdAt}</p>
            </div>
            {form.updatedAt && (
              <div>
                <span className="font-bold text-muted">Last Update:</span>
                <p className="text-foreground">{form.updatedAt && form.createdAtRaw && new Date(form.updatedAt).getTime() === new Date(form.createdAtRaw).getTime() ? "Never updated" : new Date(form.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
              </div>
            )}
          </div>

          {(form.startDate || form.endDate) && (
            <>
              <h3 className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Schedule</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-[#222936] text-xs">
                {form.startDate && (
                  <div>
                    <span className="font-bold text-muted">Start Date:</span>
                    <p className="text-foreground">{new Date(form.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                )}
                {form.endDate && (
                  <div>
                    <span className="font-bold text-muted">End Date:</span>
                    <p className="text-foreground">{new Date(form.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                )}
              </div>
            </>
          )}
				</>
      )}

      <h3 className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Form Fields</h3>
      {form?.fields && form.fields.length > 0 ? (
        form.fields.map((field, i) => (
          <div key={field._id || i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-[#222936]">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[11px] font-bold text-primary">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">{field.label || "Untitled"}</h4>
                {field.required && <RequiredAsterisk />}
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
    </Modal>
  );
}

/*Single Form Row */
function FormRow({ form, onToggle, onDelete, onViewFields, onEdit }) {
  const dateExpired = form.endDate && new Date(form.endDate) < new Date();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-5 py-4 border-b border-gray-100 dark:border-[#222936] last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
      {/* Icon + Info */}
      <button type="button" onClick={() => onViewFields(form)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${form.activityID ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
          style={form.activityID ? {} : {
            backgroundColor: form.formType === "survey" ? `${SURVEY_COLOR}33` : form.formType === "feedback" ? `${FEEDBACK_COLOR}33` : form.formType === "registration" ? "#0096ff33" : `${CUSTOM_COLOR}33`
          }}>
          {form.activityID ? (
            <Calendar size={16} className="text-blue-500 dark:text-blue-400" />
          ) : form.formType === "registration" ? (
            <UserPlus size={16} style={{ color: "#0096ff" }} />
          ) : form.formType === "survey" ? (
            <ClipboardList size={16} style={{ color: SURVEY_COLOR }} />
          ) : form.formType === "feedback" ? (
            <MessageSquare size={16} style={{ color: FEEDBACK_COLOR }} />
          ) : (
            <Clipboard size={16} style={{ color: CUSTOM_COLOR }} />
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
          <div className="relative group">
						<Toggle
							checked={form.isOpen}
							onChange={dateExpired ? undefined : () => onToggle(form.id, form.title, !form.isOpen)}
						/>
            {dateExpired && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium text-white bg-gray-800 dark:bg-gray-700 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                This form reached its endDate and cannot be opened
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-700 rotate-45" />
              </div>
            )}
          </div>
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
        <button
          type="button"
          onClick={() => onEdit(form)}
          aria-label={`Edit dates for ${form.title}`}
          className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <Pencil size={15} />
        </button>
      </div>
    </div>
  );
}

/* Main Component */
export default function DashboardForms() {
  const {
    forms,
    setForms,
    filteredForms,
    paginatedForms,
    filter,
    setFilter,
    isLoading,
    openCount,
    closedCount,
    eventCount,
    page,
    setPage,
    totalPages,
    refetch,
  } = useForms();
  const { deleteForm } = useDeleteForm(refetch);
  const { toggleFormStatus } = useToggleForm();
  const { updateForm } = useUpdateForm(refetch);
  const [deletingId, setDeletingId] = useState(null);
  const [fieldsModalForm, setFieldsModalForm] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editMaxSubmissions, setEditMaxSubmissions] = useState("");
  const [savingDates, setSavingDates] = useState(false);

  if (isLoading) return <DashFormsSkeleton />;

  const formToDelete = forms.find((f) => f.id === deletingId);

  const handleToggle = (id, title, becomingOpen) => {
    setForms((prev) => prev.map((f) => (f.id === id ? { ...f, isOpen: becomingOpen } : f)));
    toggleFormStatus(id, title, becomingOpen);
  };

  const handleOpenEdit = (form) => {
    setEditingForm(form);
    setEditStartDate(form.startDate ? form.startDate.split("T")[0] : "");
    setEditEndDate(form.endDate ? form.endDate.split("T")[0] : "");
    setEditMaxSubmissions(form.maxSubmissions ?? "");
  };

  const handleSaveDates = async () => {
    if (!editingForm) return;
    setSavingDates(true);
    try {
      await updateForm(editingForm.id, {
        startDate: new Date(editStartDate + "T00:00:00.000Z").toISOString(),
        endDate: new Date(editEndDate + "T23:59:59.999Z").toISOString(),
        maxSubmissions: editMaxSubmissions === "" ? undefined : Number(editMaxSubmissions),
      });
      toast.success("Form updated successfully");
      setEditingForm(null);
    } catch {
      // error handled by useUpdateForm
    } finally {
      setSavingDates(false);
    }
  };

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
          {pill("events", "Event Forms", "bg-blue-500", eventCount)}
        </div>

				{/* Action Button */}
				
        <div className="flex items-center gap-2">
          <a href="/applications" rel="noopener noreferrer">
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors shadow-sm w-full sm:w-auto">
            <ExternalLink size={16} /> View on Site
            </button>
          </a>
          <Link to={'/dashboard/forms/create-form'}>
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm w-full sm:w-auto">
              <Plus size={16} />
              New Form
            </button>
          </Link>
        </div>
      </div>

      {/* Forms List */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm">
        {filteredForms.length > 0 ? (
          paginatedForms.map((form) => (
            <FormRow
              key={form.id}
              form={form}
              onToggle={handleToggle}
              onDelete={setDeletingId}
              onViewFields={setFieldsModalForm}
              onEdit={handleOpenEdit}
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

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <FieldsModal
        form={fieldsModalForm}
        onClose={() => setFieldsModalForm(null)}
      />

      {/* Edit Dates Modal */}
      <Modal open={!!editingForm} onClose={() => !savingDates && setEditingForm(null)} title="Edit Form">
        <div className="space-y-4">
          <p className="text-muted truncate">{editingForm?.title}</p>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Start Date</label>
            <input
              type="date"
              value={editStartDate}
              onChange={(e) => setEditStartDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">End Date</label>
            <input
              type="date"
              value={editEndDate}
              onChange={(e) => setEditEndDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Max Submissions</label>
            <input
              type="number"
              min="0"
              value={editMaxSubmissions}
              onChange={(e) => setEditMaxSubmissions(e.target.value)}
              placeholder="Leave empty for unlimited"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>
          {editStartDate && editEndDate && new Date(editStartDate) > new Date(editEndDate) && (
            <p className="text-xs text-red-500 font-medium">Start date cannot be after end date.</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setEditingForm(null)}
              disabled={savingDates}
              className="px-3 py-2 text-sm font-medium text-foreground bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-[#222936] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDates}
              disabled={savingDates || !editStartDate || !editEndDate || new Date(editStartDate) > new Date(editEndDate)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingDates ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <DeleteModal
        isOpen={!!deletingId}
        title="Delete form"
        description={
          formToDelete
            ? `Are you sure you want to delete "${formToDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this form? This action cannot be undone."
        }
        onConfirm={() => {
          if (deletingId) deleteForm(deletingId, formToDelete?.title);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
