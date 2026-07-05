import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, GripVertical, Check, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { useCreateForm } from "../../../hooks/dashboard/useCreateForm";
import { FIELD_TYPE_OPTIONS } from "../../../data/fieldTypes";
import SectionCard from "../../../components/SectionCard";

const FORM_TYPE_OPTIONS = [
  { value: "", label: "Select a form type" },
  { value: "registration", label: "Registration" },
  { value: "survey", label: "Survey" },
  { value: "feedback", label: "Feedback" },
  { value: "custom", label: "Custom" },
];

function FieldRow({ field, index, updateFieldAt, removeFieldAt }) {
  const isDropdown = field.type === "Dropdown";

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
    <div className="border-b border-gray-200 dark:border-[#222936] last:border-b-0">
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
            className="w-full rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
          />

          {isDropdown && (
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
          aria-label={`Field type for ${field.label || `field ${index + 1}`}`}
          className="w-[130px] shrink-0 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
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
            className={`text-[11px] font-bold px-2.5 py-1.5 rounded-full border transition-colors ${
              field.required
                ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700/40"
                : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700"
            }`}
          >
            {field.required ? "Yes" : "No"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => removeFieldAt(index)}
          aria-label={`Remove ${field.label || `field ${index + 1}`}`}
          className="pt-2 text-muted hover:text-red-500 transition-colors shrink-0"
        >
          <Trash2 size={15} />
        </button>
      </div>
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
    handleSubmit,
    isSubmitting,
    errors,
  } = useCreateForm();

  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("TextInput");

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
    <div className="min-h-screen bg-main p-4 md:p-6 space-y-5">
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
          <p className="text-sm text-muted">Build a custom form for registrations or surveys</p>
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
              Form Title <span className="text-red-500">*</span>
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
              Form Type <span className="text-red-500">*</span>
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
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
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
              errors={errors}
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

        <p className="mt-2 text-xs text-muted">
          Drag rows to reorder · Click Required to toggle · Press Enter to
          confirm a new field
        </p>
      </SectionCard>

      {errors?.general && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 px-4 py-3"
        >
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.general}
          </p>
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
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Creating..." : "Create Form"}
        </button>
      </div>
    </div>
  );
}
