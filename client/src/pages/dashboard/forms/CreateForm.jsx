import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { X, GripVertical, Check, Trash2, Loader2, ArrowLeft, Lock, Sparkles, Eye } from "lucide-react";
import { useCreateForm } from "../../../hooks/dashboard/forms/useCreateForm";
import { FIELD_TYPE_OPTIONS } from "../../../data/fieldTypes";
import { FORM_TYPE_OPTIONS } from "../../../data/formTypes";
import { templatesForCategory, fillSubject } from "../../../data/emailTemplates";
import SectionCard from "../../../components/ui/SectionCard";
import RequiredAsterisk from "../../../components/ui/RequiredAsterisk";
import ToggleSwitch from "../../../components/ui/ToggleSwitch";
import Modal from "../../../components/ui/Modal";
import EmailPreviewModal from "../../../components/dashboard/EmailPreviewModal";
import { isIdentityField } from "../../../utils/formIdentity";

const EMAIL_BODY_MAX = 5000;

// The db-submissions[...] values that are not tied to one of the form's own
// fields, so there is nothing to derive them from a chip list. Mirrors
// RECOMMENDED_SUBMISSION_FIELDS in server/utils/sendEmail.js.
const RECOMMENDED_SUBMISSION_TOKENS = [
  "name",
  "email",
  "formTitle",
  "formType",
  "ticketCode",
  "submittedAt",
];

function FieldRow({ field, index, updateFieldAt, removeFieldAt, dragIndex, setDragIndex, moveField, error }) {
  const hasOptions = field.type === "Dropdown" || field.type === "Checkbox";
  const isDragging = dragIndex === index;
  // Full Name and Email ship with every form and cannot be removed, renamed or
  // made optional, so their controls are shown as fixed rather than simply
  // inert. useCreateForm enforces the same thing on the state.
  const locked = isIdentityField(field);

  const handleTypeChange = (newType) => {
    updateFieldAt(index, { type: newType });
  };

  const handleOptionChange = (optIndex, value) => {
    const updated = [...(field.options || [])];
    updated[optIndex] = value;
    updateFieldAt(index, { options: updated });
  };

  const addOption = () => {
    updateFieldAt(index, { options: [...(field.options || []), ""] });
  };

  const removeOption = (optIndex) => {
    const updated = field.options.filter((_, i) => i !== optIndex);
    updateFieldAt(index, { options: updated });
  };

  return (
    <div
      draggable
      onDragStart={() => setDragIndex(index)}
      onDragOver={(e) => {
        if (dragIndex === null || dragIndex === index) return;
        e.preventDefault();
        moveField(dragIndex, index);
        setDragIndex(index);
      }}
      onDragEnd={() => setDragIndex(null)}
      className={`border-b transition-opacity ${error ? "border-red-300 dark:border-red-800/60 bg-red-50/40 dark:bg-red-950/20" : "border-gray-200 dark:border-[#222936]"} last:border-b-0 ${isDragging ? "opacity-40" : ""}`}
    >
      <div className="flex items-start gap-2 px-5 py-3">
        <div className="pt-2.5 text-muted shrink-0 cursor-grab">
          <GripVertical size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateFieldAt(index, { label: e.target.value })}
            placeholder="Field label"
            readOnly={locked}
            title={
              locked
                ? "Every form collects a name and an email, so this field is always present and required"
                : undefined
            }
            className={`w-full rounded-lg border bg-white dark:bg-[#111827] px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 transition-colors ${error ? "border-red-400 dark:border-red-700 focus:border-red-500 focus:ring-red-500/30" : "border-gray-200 dark:border-[#222936] focus:border-primary focus:ring-primary/30"} ${locked ? "cursor-not-allowed bg-gray-50 dark:bg-[#0d1421] text-muted" : ""}`}
          />

          {hasOptions && (
            <div className="mt-2 space-y-1.5">
              {(field.options || []).map((opt, oi) => (
                <div key={oi} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 rounded-md border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(oi)}
                    aria-label={`Remove option ${oi + 1}`}
                    className="text-muted hover:text-red-500 transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>

        <select
          value={field.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          disabled={locked}
          title={locked ? "This field is always a text input" : undefined}
          aria-label={`Field type for ${field.label || `field ${index + 1}`}`}
          className="w-[130px] shrink-0 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-muted dark:disabled:bg-[#0d1421]"
        >
          {FIELD_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="w-[70px] shrink-0 flex justify-center pt-0.5">
          <button
            type="button"
            onClick={() => updateFieldAt(index, { required: !field.required })}
            disabled={locked}
            title={
              locked
                ? "Full Name and Email are always required"
                : "Toggle whether this field must be filled in"
            }
            className={`text-[11px] font-bold px-2.5 py-1.5 rounded-full border transition-colors disabled:cursor-not-allowed ${
              field.required
                ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700/40"
                : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700"
            }`}
          >
            {field.required ? "Yes" : "No"}
          </button>
        </div>

        {locked ? (
          // Stands in for the delete button so the row keeps its width, and says
          // why there is nothing to click.
          <span
            className="pt-2 shrink-0"
            title="Every form collects a name and an email, so this field cannot be removed"
          >
            <Lock size={15} className="text-muted/70" />
          </span>
        ) : (
          <button
            type="button"
            onClick={() => removeFieldAt(index)}
            aria-label={`Remove ${field.label || `field ${index + 1}`}`}
            className="pt-2 text-muted hover:text-red-500 transition-colors shrink-0"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {error && (
        <p className="px-5 pb-3 pl-11 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export default function CreateForm() {
  const navigate = useNavigate();
  const {
    formData,
    updateField,
    fieldsList,
    addField,
    updateFieldAt,
    removeFieldAt,
    moveField,
    handleSubmit,
    isSubmitting,
    errors,
  } = useCreateForm();

  const [dragIndex, setDragIndex] = useState(null);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("TextInput");
  // The body editor, so a template can be dropped in at the caret instead of
  // over the top of whatever the author has already written.
  const emailBodyRef = useRef(null);
  // Set when a template click needs confirming, holding what to apply once the
  // author agrees. Null means the popup is closed.
  const [pendingTemplate, setPendingTemplate] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Insert a short snippet (a token) at the caret, or at the end when the editor
  // was never focused. This is what the clickable token chips call.
  const insertAtCursor = (snippet) => {
    const current = formData.submissionEmailBody || "";
    if (current.length + snippet.length > EMAIL_BODY_MAX) {
      toast.error(`That would make the message ${current.length + snippet.length} characters, over the ${EMAIL_BODY_MAX} limit.`);
      return;
    }
    const el = emailBodyRef.current;
    const at = el && el.selectionStart !== null ? el.selectionStart : current.length;
    const next = current.slice(0, at) + snippet + current.slice(at);
    updateField("submissionEmailBody", next);
    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(at + snippet.length, at + snippet.length);
      }
    });
  };

  // Apply a ready-made template.
  //
  // Selecting a template sets BOTH the subject and the body, so the whole message
  // matches the template the author clicked on. `mode` decides what happens to
  // text that is already there:
  //   "apply" (the default) sets the subject and the body, after confirming
  //             anything already written is about to be replaced.
  //   "insert" leaves the subject alone and splices the body in at the caret,
  //             keeping every character already written.
  //
  // The confirm is an in-app popup rather than window.confirm: a native dialog
  // looks out of place next to the rest of the builder, and it cannot be styled
  // to match. It now also fires when only the subject has been written, which
  // window.confirm's body-only check used to miss.
  const applyEmailTemplate = (template, mode = "apply") => {
    const current = formData.submissionEmailBody || "";
    const hasSubject = (formData.submissionEmailSubject || "").trim();

    if (mode === "apply" && (current.trim() || hasSubject)) {
      setPendingTemplate({ template, mode });
      return;
    }

    commitEmailTemplate(template, mode);
  };

  // The part that actually writes the template, once nothing is in the way.
  const commitEmailTemplate = (template, mode) => {
    const current = formData.submissionEmailBody || "";

    const nextSubject = fillSubject(template.subject, formData.title);
    let next;
    let where;

    if (mode === "insert") {
      const el = emailBodyRef.current;
      // No caret (the field was never focused) means the natural place is the end.
      const start = el && el.selectionStart !== null ? el.selectionStart : current.length;
      const end = el && el.selectionEnd !== null ? el.selectionEnd : current.length;
      const before = current.slice(0, start);
      const after = current.slice(end);
      // Keep the pasted block on its own lines so it does not run into the
      // author's sentence above or below it.
      const openGap = before && !/\n\s*$/.test(before) ? "\n\n" : "";
      const closeGap = after && !/^\s*\n/.test(after) ? "\n\n" : "";
      next = before + openGap + template.body + closeGap + after;
      where = "inserted at your cursor";
    } else {
      next = template.body;
      where = current.trim() ? "replaced your subject and message" : "applied to your subject and message";
    }

    if (next.length > EMAIL_BODY_MAX) {
      toast.error(
        `That template would make the message ${next.length} characters. The limit is ${EMAIL_BODY_MAX}.`
      );
      return;
    }

    updateField("submissionEmailBody", next);
    // A template is a complete message, so the subject goes with it. "insert"
    // is the exception: that path is for grafting a block into a message the
    // author is still composing, so its subject is theirs to keep.
    if (mode !== "insert") {
      updateField("submissionEmailSubject", nextSubject);
    }

    toast.success(`${template.label} ${where}.`);
    if (mode === "insert") {
      // Put the caret just after the block so typing continues from there.
      const el = emailBodyRef.current;
      if (el) {
        const caret = current.indexOf(template.body) + template.body.length;
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(caret, caret);
        });
      }
    }
  };

  const handleConfirmAddField = () => {
    if (!newFieldLabel.trim()) return;
    const idx = fieldsList.length;
    addField();
    updateFieldAt(idx, { label: newFieldLabel.trim(), type: newFieldType });
    setNewFieldLabel("");
    setNewFieldType("TextInput");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirmAddField();
    }
  };

  return (
    <div className="min-h-screen bg-main p-4 md:p-6 space-y-5 mx-auto max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard/forms")}
          aria-label="Back to forms"
          className="p-1.5 text-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Create New Form</h1>
          {/* <p className="text-sm text-muted">Build a custom form for registrations or surveys</p>*/}
        </div>
      </div>

      {/* Section 1: Form Details */}
      <SectionCard>
        <h2 className="text-base font-bold text-foreground mb-5">Form Details</h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="form-title"
              className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5"
            >
              Form Title <RequiredAsterisk />
            </label>
            <input
              id="form-title"
              type="text"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g., Recruitment 2026 Registration"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
            {errors?.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="form-type"
              className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5"
            >
              Form Type <RequiredAsterisk />
            </label>
            <select
              id="form-type"
              value={formData.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            >
              {FORM_TYPE_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.value === ""}
                >
                  {opt.label}
                </option>
              ))}
            </select>
            {errors?.type && (
              <p className="mt-1 text-xs text-red-500">{errors.type}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="form-description"
              className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5"
            >
              Description
            </label>
            <textarea
              id="form-description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Add a short description for participants"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
            />
          </div>

          {/* Who is allowed to submit. Kept in Form Details because it is a
              property of the form itself, not of its schedule. */}
          <div className="rounded-lg border border-gray-200 dark:border-[#222936] bg-gray-50 dark:bg-white/[0.03] p-4">
            <ToggleSwitch
              id="form-requires-login"
              checked={Boolean(formData.requiresLogin)}
              onChange={(value) => updateField("requiresLogin", value)}
              onLabel="Login required"
              offLabel="Open to all"
              label="Require login to submit"
              description={
                formData.requiresLogin
                  ? "Only signed-in members can submit this form. Guests are asked to log in before they can continue."
                  : "Anyone can submit this form, with or without an account. Submissions are not linked to a member."
              }
            />
          </div>
        </div>
      </SectionCard>

      {/* Section 2: Schedule & Limits */}
      <SectionCard>
        <h2 className="text-base font-bold text-foreground mb-5">Schedule & Limits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="form-start-date"
              className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5"
            >
              Start Date
            </label>
            <input
              id="form-start-date"
              type="date"
              value={formData.startDate || ""}
              onChange={(e) => updateField("startDate", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
            <p className="mt-1 text-xs text-muted">
              Defaults to now if left empty
            </p>
          </div>
          <div>
            <label
              htmlFor="form-end-date"
              className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5"
            >
              End Date
            </label>
            <input
              id="form-end-date"
              type="date"
              value={formData.endDate || ""}
              onChange={(e) => updateField("endDate", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
            {errors?.endDate && (
              <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>
            )}
            <p className="mt-1 text-xs text-muted">
              Defaults to +7 days if left empty
            </p>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="form-max-submissions"
              className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5"
            >
              Max Submissions
            </label>
            <input
              id="form-max-submissions"
              type="number"
              min={1}
              value={formData.maxSubmissions || ""}
              onChange={(e) => updateField("maxSubmissions", e.target.value)}
              placeholder="e.g., 100"
              className="w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 transition-colors border-gray-200 dark:border-[#222936] focus:border-primary focus:ring-primary/30"
            />
            {errors?.maxSubmissions && (
              <p className="mt-1 text-xs text-red-500">{errors.maxSubmissions}</p>
            )}
            <p className="mt-1 text-xs text-muted">
              Leave empty for unlimited
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Section 3: Form Fields */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-base font-bold text-foreground">Form Fields</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary-dark/10 dark:border-primary-light/10">
            {fieldsList.length}{" "}
            {fieldsList.length === 1 ? "field" : "fields"}
          </span>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-[#222936] overflow-hidden">
          <div className="hidden sm:flex items-center gap-2 px-5 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[#222936]">
            <div className="w-6 shrink-0" />
            <div className="flex-1">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">
                Field Label
              </span>
            </div>
            <div className="w-[130px] shrink-0">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">
                Type
              </span>
            </div>
            <div className="w-[70px] shrink-0 text-center">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">
                Required
              </span>
            </div>
            <div className="w-8 shrink-0" />
          </div>

          {fieldsList.map((field, idx) => (
            <FieldRow
              key={field.id || idx}
              field={field}
              index={idx}
              updateFieldAt={updateFieldAt}
              removeFieldAt={removeFieldAt}
              dragIndex={dragIndex}
              setDragIndex={setDragIndex}
              moveField={moveField}
              error={errors?.fieldErrors?.[idx]}
            />
          ))}

          <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-200 dark:border-[#222936]">
            <input
              type="text"
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="New field label"
              className="flex-1 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
            <select
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value)}
              aria-label="New field type"
              className="w-[130px] shrink-0 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            >
              {FIELD_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleConfirmAddField}
              disabled={!newFieldLabel.trim()}
              aria-label="Confirm add field"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Check size={16} />
            </button>
          </div>
        </div>

        <p className="mt-1 text-xs text-muted">
          <Lock size={11} className="inline mr-1 -mt-0.5" />
          Full Name and Email are always collected, required, and cannot be
          removed or renamed.
        </p>

      </SectionCard>

      {/* Section 4: Confirmation Email */}
      <SectionCard>
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="text-base font-bold text-foreground">Confirmation Email</h2>
          {/* Only offered while the custom message is the one that will actually
              be sent, so the preview can never show a draft that is not in
              effect. */}
          {formData.sendEmailOnSubmission && (
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground border border-gray-200 dark:border-[#222936] hover:border-primary hover:text-primary transition-colors"
            >
              <Eye size={13} /> Preview
            </button>
          )}
        </div>
        <p className="text-xs text-muted mb-5">
          Sent to the address the submitter typed into the form.
        </p>

        <div className="rounded-lg border border-gray-200 dark:border-[#222936] bg-gray-50 dark:bg-white/[0.03] p-4">
          <ToggleSwitch
            id="form-send-email"
            checked={Boolean(formData.sendEmailOnSubmission)}
            onChange={(value) => updateField("sendEmailOnSubmission", value)}
            onLabel="Sent"
            offLabel="Off"
            label="Send an email after submission"
            description={
              formData.sendEmailOnSubmission
                ? "Your own message below is sent instead of the standard receipt."
                : "Off — submitters get the standard \"We received your application\" receipt."
            }
          />
        </div>

        {formData.sendEmailOnSubmission && (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-primary/25 dark:border-primary-light/20 bg-primary/5 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-foreground uppercase tracking-wide mb-2">
                <Sparkles size={13} className="text-primary" />
                Start from a template
              </p>
              <p className="text-[11px] text-muted mb-2.5 leading-relaxed">
                Picking a template sets the subject and the message together, using
                this form&apos;s own fields. If you have already written something
                it will ask before replacing it. Use{" "}
                <span className="font-semibold text-foreground">+ insert</span> to
                add a template to the message without touching the subject.
              </p>
              <div className="flex flex-col gap-1.5">
                {templatesForCategory(formData.type, fieldsList).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2.5 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => applyEmailTemplate(t)}
                      title={t.description}
                      className="flex-1 text-left group"
                    >
                      <span className="block text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {t.label}
                      </span>
                      <span className="block text-[11px] text-muted leading-snug">
                        {t.description}
                        {t.nextStep ? ` Asks them to: ${t.nextStep[0].toLowerCase()}` : ""}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyEmailTemplate(t, "insert")}
                      title="Add this template to the current message, leaving your subject and existing text alone"
                      className="shrink-0 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide text-muted border border-gray-200 dark:border-[#222936] hover:border-primary hover:text-primary transition-colors"
                    >
                      + insert
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="form-email-subject"
                className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5"
              >
                Subject{" "}
                <span className="font-normal normal-case tracking-normal text-muted/70">
                  (optional)
                </span>
              </label>
              <input
                id="form-email-subject"
                type="text"
                value={formData.submissionEmailSubject}
                onChange={(e) => updateField("submissionEmailSubject", e.target.value)}
                maxLength={200}
                placeholder={`We received your submission for ${formData.title || "this form"}`}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="form-email-body"
                className="flex items-center gap-1.5 text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5"
              >
                Message <RequiredAsterisk />
              </label>
              <textarea
                id="form-email-body"
                ref={emailBodyRef}
                value={formData.submissionEmailBody}
                onChange={(e) => updateField("submissionEmailBody", e.target.value)}
                rows={7}
                maxLength={5000}
                placeholder={
                  "<p>Thanks for applying to db-submissions[formTitle]. We'll be in touch soon.</p>"
                }
                className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 transition-colors resize-y font-mono text-[13px] leading-relaxed ${
                  errors?.submissionEmailBody
                    ? "border-red-400 dark:border-red-700 focus:border-red-500 focus:ring-red-500/30"
                    : "border-gray-200 dark:border-[#222936] focus:border-primary focus:ring-primary/30"
                }`}
              />
              {errors?.submissionEmailBody && (
                <p className="mt-1 text-xs text-red-500">{errors.submissionEmailBody}</p>
              )}

              <div className="mt-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-white/[0.02] p-2.5">
                <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
                  Click to insert into the message
                </p>

                <p className="text-[11px] text-muted leading-relaxed mb-1.5">
                  <span className="font-semibold text-foreground">db-submissions[Field]</span>{" "}
                  puts a value from this submission in the email. A blank value is
                  left as written so you can see it did not resolve.
                </p>
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {fieldsList.map((f) => (
                    <button
                      key={f.id || f.label}
                      type="button"
                      onClick={() => insertAtCursor(`db-submissions[${f.label}]`)}
                      title={`Insert db-submissions[${f.label}]`}
                      className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-mono text-[11px]"
                    >
                      db-submissions[{f.label}]
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-muted leading-relaxed mb-1.5">
                  <span className="font-semibold text-foreground">db-user[field]</span>{" "}
                  puts a field from the member&apos;s own account in the email. If the
                  submitter is not registered it is left as written, exactly as you
                  typed it.
                </p>
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {[
                    "name", "email", "phone", "university", "college",
                    "yearOfStudy", "committee", "interests", "role",
                  ].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => insertAtCursor(`db-user[${k}]`)}
                      title={`Insert db-user[${k}]`}
                      className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors font-mono text-[11px]"
                    >
                      db-user[{k}]
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-muted leading-relaxed mb-1.5">
                  Recommended submission values:
                </p>
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {RECOMMENDED_SUBMISSION_TOKENS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => insertAtCursor(`db-submissions[${t}]`)}
                      title={`Insert db-submissions[${t}]`}
                      className="px-1 py-0.5 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-mono text-[11px]"
                    >
                      db-submissions[{t}]
                    </button>
                  ))}
                  {formData.type === "attendance" && (
                    <>
                      <button
                        type="button"
                        onClick={() => insertAtCursor("db-submissions[qrCode]")}
                        title="The ticket QR image, only for attendance forms"
                        className="px-1 py-0.5 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-mono text-[11px]"
                      >
                        db-submissions[qrCode]
                      </button>
                      <button
                        type="button"
                        onClick={() => insertAtCursor("db-submissions[qrUrl]")}
                        title="The raw QR image address, only for attendance forms"
                        className="px-1 py-0.5 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-mono text-[11px]"
                      >
                        db-submissions[qrUrl]
                      </button>
                    </>
                  )}
                </div>

                <p className="text-[11px] text-muted leading-relaxed">
                  HTML is allowed. Anything that does not resolve is sent exactly as
                  you typed it, so a placeholder you can see is a placeholder that
                  needs fixing.
                </p>
              </div>

              <p className="mt-1 text-[11px] text-muted/70 text-right">
                {formData.submissionEmailBody.length}/5000
              </p>
            </div>
          </div>
        )}
      </SectionCard>

      {(errors?.general || errors?.fields) && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 px-4 py-3"
        >
          {errors.fields && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.fields}
            </p>
          )}
          {errors.general && (
            <p
              className={`text-sm text-red-600 dark:text-red-400 ${errors.fields ? "mt-1" : ""}`}
            >
              {errors.general}
            </p>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard/forms")}
          className="px-4 py-2 text-sm font-medium text-foreground bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-[#222936] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.title?.trim() || !formData.type}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Creating..." : "Create Form"}
        </button>
      </div>

      {/* Confirm before a template overwrites anything already written. An
          in-app popup rather than window.confirm so it matches the rest of the
          builder. */}
      <Modal
        open={Boolean(pendingTemplate)}
        onClose={() => setPendingTemplate(null)}
        title="Replace your message?"
      >
        {pendingTemplate && (
          <div>
            <p className="text-sm text-muted leading-relaxed">
              <span className="font-semibold text-foreground">
                {pendingTemplate.template.label}
              </span>{" "}
              sets both the subject and the message, so anything you have written
              will be replaced.
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              To keep your text and add this on top instead, cancel and use{" "}
              <span className="font-semibold text-foreground">+ insert</span> on
              the template, which only adds the body where your cursor is.
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
                  commitEmailTemplate(pendingTemplate.template, pendingTemplate.mode);
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

      <EmailPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        formTitle={formData.title}
        formType={formData.type}
        fields={fieldsList}
        subject={formData.submissionEmailSubject}
        messageBody={formData.submissionEmailBody}
      />
    </div>
  );
}
