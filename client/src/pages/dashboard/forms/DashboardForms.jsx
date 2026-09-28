import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, Clipboard, Calendar, UserPlus, ClipboardList, MessageSquare, Eye, Plus, Trash2, Check, ChevronDown, Pencil, ExternalLink, FileType, Wrench, Sparkles } from "lucide-react";
// Hooks & data
import { useForms } from "../../../hooks/dashboard/forms/useForms";
import { useDeleteForm } from "../../../hooks/dashboard/forms/useDeleteForm";
import { useToggleForm } from "../../../hooks/dashboard/forms/useToggleForm";
import { useUpdateForm } from "../../../hooks/dashboard/forms/useUpdateForm";
import { templatesForCategory, fillSubject } from "../../../data/emailTemplates";
import {
  RECRUITMENT_COLOR,
  ATTENDANCE_COLOR,
  WORKSHOP_COLOR,
  SURVEY_COLOR,
  FEEDBACK_COLOR,
  LEGACY_COLOR,
  FORM_TYPE_BADGE,
  DEFAULT_FORM_TYPE_BADGE,
} from "../../../data/formTypes";

// form.type -> icon + accent. "other" (legacy) and anything unrecognised fall back
// to the general entry, so forms saved under an older type still render.
const FORM_TYPE_ICONS = {
  recruitment: { Icon: UserPlus, color: RECRUITMENT_COLOR },
  attendance: { Icon: FileType, color: ATTENDANCE_COLOR },
  workshop: { Icon: Wrench, color: WORKSHOP_COLOR },
  survey: { Icon: ClipboardList, color: SURVEY_COLOR },
  feedback: { Icon: MessageSquare, color: FEEDBACK_COLOR },
};

function formTypeVisuals(formType) {
  return FORM_TYPE_ICONS[formType] || { Icon: Clipboard, color: LEGACY_COLOR };
}

// Components
import DeleteModal from "../../../components/ui/DeleteModal";
import RequiredAsterisk from "../../../components/ui/RequiredAsterisk";
import DashFormsSkeleton from "../../../components/skeletons/DashFormsSkeleton";
import Modal from "../../../components/ui/Modal";
import ToggleSwitch from "../../../components/ui/ToggleSwitch";
import Pagination from "../../../components/ui/Pagination";

/*Toggle Switch */
function Toggle({ checked, onChange, ariaLabel }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
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
              <p className="text-foreground">
                {(FORM_TYPE_BADGE[form.type] || DEFAULT_FORM_TYPE_BADGE).label}
              </p>
            </div>
            <div>
              <span className="font-bold text-muted">Max Submissions:</span>
              <p className="text-foreground">{form.maxSubmissions ? String(form.maxSubmissions) : "Unlimited"}</p>
            </div>
            <div>
              <span className="font-bold text-muted">Login:</span>
              <p className="text-foreground">{form.requiresLogin ? "Required" : "Open to all"}</p>
            </div>
            <div>
              <span className="font-bold text-muted">Email after submit:</span>
              <p className="text-foreground">
                {form.sendEmailOnSubmission ? "Custom message" : "Standard receipt"}
              </p>
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
  const { Icon: TypeIcon, color: typeColor } = formTypeVisuals(form.type);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-5 py-4 border-b border-gray-100 dark:border-[#222936] last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
      {/* Icon + Info */}
      <button type="button" onClick={() => onViewFields(form)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${form.activityID ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
          style={{
            backgroundColor: form.activityID ? undefined : `${typeColor}33`,
          }}>
          {form.activityID ? (
            <Calendar size={16} className="text-blue-500 dark:text-blue-400" />
          ) : (
            <TypeIcon size={16} style={{ color: typeColor }} />
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
							ariaLabel={`Toggle form "${form.title}" ${form.isOpen ? "closed" : "open"}`}
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
            state={{ formTitle: form.title, fields: form.fields, activityID: form.activityID }}
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
  const [editRequiresLogin, setEditRequiresLogin] = useState(false);
  const [editSendEmail, setEditSendEmail] = useState(false);
  const [editEmailSubject, setEditEmailSubject] = useState("");
  const [editEmailBody, setEditEmailBody] = useState("");
  // Set when a template click needs confirming, holding what to apply once the
  // author agrees. Null means the popup is closed.
  const [pendingTemplate, setPendingTemplate] = useState(null);
  const [savingDates, setSavingDates] = useState(false);

  if (isLoading) return <DashFormsSkeleton />;

  const formToDelete = forms.find((f) => f.id === deletingId);

  // Writes the chosen template into the edit form's subject and body. Called
  // directly when there is nothing to overwrite, and from the popup otherwise.
  const commitTemplate = (t) => {
    setEditEmailBody(t.body);
    setEditEmailSubject(fillSubject(t.subject, editingForm?.title));
    toast.success(`${t.label} applied to your subject and message.`);
  };

  const handleToggle = (id, title, becomingOpen) => {
    setForms((prev) => prev.map((f) => (f.id === id ? { ...f, isOpen: becomingOpen } : f)));
    toggleFormStatus(id, title, becomingOpen);
  };

  const handleOpenEdit = (form) => {
    setEditingForm(form);
    setEditStartDate(form.startDate ? form.startDate.split("T")[0] : "");
    setEditEndDate(form.endDate ? form.endDate.split("T")[0] : "");
    setEditMaxSubmissions(form.maxSubmissions ?? "");
    setEditRequiresLogin(Boolean(form.requiresLogin));
    setEditSendEmail(Boolean(form.sendEmailOnSubmission));
    setEditEmailSubject(form.submissionEmailSubject || "");
    setEditEmailBody(form.submissionEmailBody || "");
  };

  const handleSaveDates = async () => {
    if (!editingForm) return;
    // The server refuses to enable the email with an empty body, so refuse here
    // too rather than round-tripping for a 400.
    if (editSendEmail && !editEmailBody.trim()) {
      toast.error("Write the message to send, or turn the email off");
      return;
    }
    setSavingDates(true);
    try {
      await updateForm(editingForm.id, {
        startDate: new Date(editStartDate + "T00:00:00.000Z").toISOString(),
        endDate: new Date(editEndDate + "T23:59:59.999Z").toISOString(),
        maxSubmissions: editMaxSubmissions === "" ? undefined : Number(editMaxSubmissions),
        requiresLogin: editRequiresLogin,
        sendEmailOnSubmission: editSendEmail,
        // Only sent while the feature is on, so turning it off cannot leave the
        // wording attached to the form.
        ...(editSendEmail && {
          submissionEmailSubject: editEmailSubject.trim(),
          submissionEmailBody: editEmailBody.trim(),
        }),
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

          <div className="border-t border-gray-200 dark:border-[#222936] pt-4 space-y-4">
            <div className="rounded-lg border border-gray-200 dark:border-[#222936] bg-gray-50 dark:bg-white/[0.03] p-4">
              <ToggleSwitch
                id="edit-requires-login"
                checked={editRequiresLogin}
                onChange={setEditRequiresLogin}
                onLabel="Login required"
                offLabel="Open to all"
                label="Require login to submit"
                description={
                  editRequiresLogin
                    ? "Only signed-in members can submit this form."
                    : "Anyone can submit this form, with or without an account."
                }
              />
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-[#222936] bg-gray-50 dark:bg-white/[0.03] p-4">
              <ToggleSwitch
                id="edit-send-email"
                checked={editSendEmail}
                onChange={setEditSendEmail}
                onLabel="Sent"
                offLabel="Off"
                label="Send an email after submission"
                description={
                  editSendEmail
                    ? "Your message below is sent instead of the standard receipt."
                    : "Off — submitters get the standard receipt."
                }
              />
            </div>

            {editSendEmail && (
              <div className="space-y-3">
                <div className="rounded-lg border border-primary/25 dark:border-primary-light/20 bg-primary/5 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-foreground uppercase tracking-wide mb-2">
                    <Sparkles size={13} className="text-primary" />
                    Start from a template
                  </p>
                  <p className="text-[11px] text-muted mb-2.5 leading-relaxed">
                    Picking a template sets the subject and the message together,
                    using this form&apos;s own fields. It asks before replacing
                    anything you have already written.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {templatesForCategory(
                      editingForm?.type,
                      editingForm?.fields
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          // Same rule as the builder: an in-app popup, and it
                          // fires when only the subject has been written too.
                          if (editEmailBody.trim() || editEmailSubject.trim()) {
                            setPendingTemplate(t);
                            return;
                          }
                          commitTemplate(t);
                        }}
                        title={t.description}
                        className="text-left px-2.5 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] hover:border-primary transition-colors"
                      >
                        <span className="block text-xs font-semibold text-foreground">
                          {t.label}
                        </span>
                        <span className="block text-[11px] text-muted leading-snug">
                          {t.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="edit-email-subject"
                    className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5"
                  >
                    Subject{" "}
                    <span className="font-normal normal-case tracking-normal text-muted/70">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="edit-email-subject"
                    type="text"
                    value={editEmailSubject}
                    onChange={(e) => setEditEmailSubject(e.target.value)}
                    maxLength={200}
                    placeholder={`We received your submission for ${editingForm?.title || "this form"}`}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-email-body"
                    className="flex items-center gap-1.5 text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5"
                  >
                    Message <RequiredAsterisk />
                  </label>
                  <textarea
                    id="edit-email-body"
                    value={editEmailBody}
                    onChange={(e) => setEditEmailBody(e.target.value)}
                    rows={6}
                    maxLength={5000}
                    placeholder='<p>Thanks for applying to db-submissions[formTitle].</p>'
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-y font-mono text-[13px] leading-relaxed"
                  />
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    HTML is allowed. Placeholders work in the subject too.
                  </p>
                  <div className="mt-2 rounded-lg border border-gray-200 dark:border-[#222936] p-2.5">
                    <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
                      Placeholders you can use
                    </p>
                    <p className="text-[11px] text-muted leading-relaxed">
                      <span className="font-semibold text-foreground">
                        db-submissions[Field]
                      </span>{" "}
                      inserts a value from this submission, and{" "}
                      <span className="font-semibold text-foreground">
                        db-user[field]
                      </span>{" "}
                      a field from the member&apos;s own account. Anything that
                      cannot be resolved is left as written, so an unregistered
                      submitter simply keeps the db-user[...] text instead of a
                      blank.
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {(editingForm?.fields || []).map((f) => (
                        <code
                          key={f.id || f.label}
                          className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono text-[11px]"
                        >
                          db-submissions[{f.label}]
                        </code>
                      ))}
                      {["name", "email", "university", "yearOfStudy", "committee"].map(
                        (k) => (
                          <code
                            key={k}
                            className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[11px]"
                          >
                            db-user[{k}]
                          </code>
                        )
                      )}
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed mt-2 mb-1">
                      Recommended submission values:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "name",
                        "email",
                        "formTitle",
                        "formType",
                        "ticketCode",
                        "submittedAt",
                        ...(editingForm?.type === "attendance"
                          ? ["qrCode", "qrUrl"]
                          : []),
                      ].map((k) => (
                        <code
                          key={k}
                          className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 font-mono text-[11px]"
                        >
                          db-submissions[{k}]
                        </code>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-muted/70 text-right">
                    {editEmailBody.length}/5000
                  </p>
                </div>
              </div>
            )}
          </div>

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

      {/* Confirm before a template overwrites the subject or message already
          written. An in-app popup rather than window.confirm. */}
      <Modal
        open={Boolean(pendingTemplate)}
        onClose={() => setPendingTemplate(null)}
        title="Replace your message?"
      >
        {pendingTemplate && (
          <div>
            <p className="text-sm text-muted leading-relaxed">
              <span className="font-semibold text-foreground">
                {pendingTemplate.label}
              </span>{" "}
              sets both the subject and the message, so anything you have written
              will be replaced. It is not saved until you press Save.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setPendingTemplate(null)}
                className="px-4 py-2 text-sm font-medium text-foreground bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-[#222936] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Keep my text
              </button>
              <button
                type="button"
                onClick={() => {
                  commitTemplate(pendingTemplate);
                  setPendingTemplate(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
              >
                Replace it
              </button>
            </div>
          </div>
        )}
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
