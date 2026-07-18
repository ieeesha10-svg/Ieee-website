import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft, X, Loader2, Check, GripVertical, Trash2, CheckCircle2, Upload } from "lucide-react";
import { useCreateEvent } from "../../../hooks/dashboard/events/useCreateEvent";
import { toLocalDatetimeString } from "../../../utils/dateUtils";
import { FIELD_TYPE_OPTIONS } from "../../../data/fieldTypes";
import { EVENT_TYPES } from "../../../data/eventsData";
import SectionCard from "../../../components/SectionCard";
import RequiredAsterisk from "../../../components/RequiredAsterisk";

const EVENT_TYPE_LABELS = { general: "General", event: "Event", workshop: "Workshop", webinar: "Webinar" };

const EMPTY_FORM = {
  title: "", content: "", type: "event", location: "", speakers: [],
  startDate: toLocalDatetimeString(new Date()),
  endDate: toLocalDatetimeString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  maxSubmissions: "", registrationEnabled: true,
  fields: [
    { id: "name", label: "Full Name", type: "TextInput", required: true },
    { id: "email", label: "Email", type: "TextInput", required: true },
  ],
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const { createEvent } = useCreateEvent();

  const [form, setForm] = useState(EMPTY_FORM);
  const [speakerName, setSpeakerName] = useState("");
  const [speakerTitle, setSpeakerTitle] = useState("");
  const [speakerBio, setSpeakerBio] = useState("");
  const [speakerImage, setSpeakerImage] = useState("");
  const [fieldsList, setFieldsList] = useState(EMPTY_FORM.fields);
  const [dragIndex, setDragIndex] = useState(null);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("TextInput");
  const [saving, setSaving] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const moveField = (from, to) => {
    setFieldsList((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  const addField = () => {
    setFieldsList((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "", type: "TextInput", required: false, options: [] },
    ]);
  };

  const updateFieldAt = (index, patch) => {
    setFieldsList((prev) => {
      const updated = [...prev];
      const field = updated[index];
      if (patch.type && (patch.type === "Dropdown" || patch.type === "Checkbox") && !field.options) {
        patch.options = [];
      }
      updated[index] = { ...field, ...patch };
      return updated;
    });
  };

  const removeFieldAt = (index) => {
    setFieldsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmAddField = () => {
    if (!newFieldLabel.trim()) return;
    const idx = fieldsList.length;
    addField();
    const patch = { label: newFieldLabel.trim(), type: newFieldType };
    if (newFieldType === "Dropdown" || newFieldType === "Checkbox") patch.options = [];
    updateFieldAt(idx, patch);
    setNewFieldLabel("");
    setNewFieldType("TextInput");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirmAddField();
    }
  };

  const coverImageInputRef = React.useRef(null);

  const handleCoverImageSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const handleCoverImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleCoverImageSelect(file);
  };

  const handleCoverImageRemove = () => {
    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    setCoverImageFile(null);
    setCoverImagePreview(null);
  };

  const addSpeaker = () => {
    if (!speakerName.trim()) return;
    set("speakers", [...form.speakers, {
      name: speakerName.trim(),
      title: speakerTitle.trim(),
      bio: speakerBio.trim(),
      image: speakerImage.trim(),
    }]);
    setSpeakerName("");
    setSpeakerTitle("");
    setSpeakerBio("");
    setSpeakerImage("");
  };

  const removeSpeaker = (idx) => {
    set("speakers", form.speakers.filter((_, i) => i !== idx));
  };

  const datesInvalid = form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createEvent({ ...form, fields: fieldsList }, coverImageFile);
      toast.success("Activity created successfully!");
      navigate("/dashboard/events");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create activity";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-main p-4 md:p-6 space-y-5 mx-auto max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard/events")}
          aria-label="Back to events"
          className="p-1.5 text-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Create New Event</h1>
      </div>

      {/* Section 1: Event Details */}
      <SectionCard>
        <h2 className="text-base font-bold text-foreground mb-5">Event Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Title <RequiredAsterisk /></label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Event title" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors appearance-none">
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Location <RequiredAsterisk /></label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Event location" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Description <RequiredAsterisk /></label>
            <textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none" placeholder="Event description" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Cover Image</label>
            {coverImagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-[#222936]">
                <img src={coverImagePreview} alt="Cover preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={handleCoverImageRemove}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  aria-label="Remove cover image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleCoverImageDrop}
                onClick={() => coverImageInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-gray-200 dark:border-[#222936] bg-gray-50 dark:bg-gray-800/30 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <Upload size={20} className="text-muted" />
                <span className="text-sm text-muted font-medium">Upload Cover Image</span>
                <span className="text-[11px] text-muted/60">Click or drag & drop (image/*)</span>
              </div>
            )}
            <input
              ref={coverImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCoverImageSelect(e.target.files[0])}
            />
          </div>
        </div>
      </SectionCard>

      {/* Section 2: Schedule & Registration */}
      <SectionCard>
        <h2 className="text-base font-bold text-foreground mb-5">Schedule & Registration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Start Date</label>
            <input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">End Date</label>
            <input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
          </div>
          {datesInvalid && (
            <p className="text-xs text-red-500 font-medium sm:col-span-2">Start date cannot be after end date.</p>
          )}
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Max Submissions</label>
            <input type="number" min="0" value={form.maxSubmissions} onChange={(e) => set("maxSubmissions", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Leave empty for unlimited" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1.5">Registration</label>
            <button
              type="button"
              onClick={() => set("registrationEnabled", !form.registrationEnabled)}
              className={`mt-1 w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${form.registrationEnabled ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/40 text-green-700 dark:text-green-300" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-[#222936] text-muted"}`}
            >
              {form.registrationEnabled ? "Accepting Registrations" : "Closing Registration"}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Section 3: Speakers */}
      <SectionCard>
        <h2 className="text-base font-bold text-foreground mb-5">Speakers</h2>
        <div className="space-y-2">
          <input value={speakerName} onChange={(e) => setSpeakerName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Speaker name" />
          <input value={speakerTitle} onChange={(e) => setSpeakerTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Speaker title (e.g. Senior Engineer)" />
          <input value={speakerImage} onChange={(e) => setSpeakerImage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Speaker image URL (optional)" />
          <textarea value={speakerBio} onChange={(e) => setSpeakerBio(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none" placeholder="Speaker bio" />
          <button type="button" onClick={addSpeaker} disabled={!speakerName.trim()} className="px-3 py-2 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Add Speaker</button>
        </div>
        {form.speakers.length > 0 && (
          <div className="space-y-1.5 mt-3">
            {form.speakers.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                {s.image ? (
                  <img src={s.image} alt={s.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-muted shrink-0">{s.name[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground font-medium">{s.name}</span>
                  {s.title && <span className="text-xs text-muted ml-2">— {s.title}</span>}
                </div>
                <button type="button" onClick={() => removeSpeaker(i)} className="text-muted hover:text-red-500 transition-colors"><X size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Section 4: Form Fields */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-base font-bold text-foreground">Form Fields</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary-dark/10 dark:border-primary-light/10">
            {fieldsList.length} {fieldsList.length === 1 ? "field" : "fields"}
          </span>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-[#222936] overflow-hidden">
          <div className="hidden sm:flex items-center gap-2 px-5 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[#222936]">
            <div className="w-6 shrink-0" />
            <div className="flex-1">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Field Label</span>
            </div>
            <div className="w-32.5 shrink-0">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Type</span>
            </div>
            <div className="w-17.5 shrink-0 text-center">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Required</span>
            </div>
            <div className="w-8 shrink-0" />
          </div>

          {fieldsList.map((field, idx) => {
            const hasOptions = field.type === "Dropdown" || field.type === "Checkbox";
            const isDragging = dragIndex === idx;
            return (
              <div
                key={field.id || idx}
                draggable
                onDragStart={() => setDragIndex(idx)}
                onDragOver={(e) => {
                  if (dragIndex === null || dragIndex === idx) return;
                  e.preventDefault();
                  moveField(dragIndex, idx);
                  setDragIndex(idx);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={`border-b border-gray-200 dark:border-[#222936] last:border-b-0 transition-opacity ${isDragging ? "opacity-40" : ""}`}
              >
                <div className="flex items-start gap-2 px-5 py-3">
                  <div className="pt-2 text-muted shrink-0 cursor-grab">
                    <GripVertical size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateFieldAt(idx, { label: e.target.value })}
                      placeholder="Field label"
                      className="w-full rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                    />

                    {hasOptions && (
                      <div className="mt-2 space-y-1.5">
                        {(field.options || []).map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...(field.options || [])];
                                updated[oi] = e.target.value;
                                updateFieldAt(idx, { options: updated });
                              }}
                              placeholder={`Option ${oi + 1}`}
                              className="flex-1 rounded-md border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = field.options.filter((_, i) => i !== oi);
                                updateFieldAt(idx, { options: updated });
                              }}
                              aria-label={`Remove option ${oi + 1}`}
                              className="text-muted hover:text-red-500 transition-colors shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => updateFieldAt(idx, { options: [...(field.options || []), ""] })}
                          className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}
                  </div>

                  <select
                    value={field.type}
                    onChange={(e) => updateFieldAt(idx, { type: e.target.value })}
                    aria-label={`Field type for ${field.label || `field ${idx + 1}`}`}
                    className="w-32.5 shrink-0 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  >
                    {FIELD_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  <div className="w-17.5 shrink-0 flex justify-center pt-0.5">
                    <button
                      type="button"
                      onClick={() => updateFieldAt(idx, { required: !field.required })}
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
                    onClick={() => removeFieldAt(idx)}
                    aria-label={`Remove ${field.label || `field ${idx + 1}`}`}
                    className="pt-2 text-muted hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}

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
              className="w-32.5 shrink-0 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            >
              {FIELD_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
          Click Required to toggle · Press Enter to confirm a new field
        </p>
      </SectionCard>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard/events")}
          className="px-4 py-2 text-sm font-medium text-foreground bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-[#222936] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !form.title || !form.location || !form.content || datesInvalid}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          {saving ? "Creating..." : "Create Event"}
        </button>
      </div>
    </div>
  );
}
