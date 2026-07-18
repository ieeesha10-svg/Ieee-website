import React, { useState } from "react";
import { X, Loader2, Check, GripVertical, Trash2, CheckCircle2, Upload, Edit } from "lucide-react";
import { FIELD_TYPE_OPTIONS } from "../../data/fieldTypes";
import { EVENT_TYPES } from "../../data/eventsData";

const EVENT_TYPE_LABELS = { general: "General", event: "Event", workshop: "Workshop", webinar: "Webinar" };

export default function EditEvent({ initial, onSubmit, submitLabel, loading, formId, coverImageUrl }) {
  const [form, setForm] = useState(initial);
  const [speakerName, setSpeakerName] = useState("");
  const [speakerTitle, setSpeakerTitle] = useState("");
  const [speakerBio, setSpeakerBio] = useState("");
  const [speakerImage, setSpeakerImage] = useState("");
  const [fieldsList, setFieldsList] = useState(initial.fields || []);
  const [dragIndex, setDragIndex] = useState(null);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("TextInput");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(coverImageUrl || null);

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
    if (coverImagePreview && coverImagePreview.startsWith("blob:")) URL.revokeObjectURL(coverImagePreview);
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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Title</label>
        <input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Event title" />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Type</label>
        <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors appearance-none">
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Location</label>
        <input value={form.location} onChange={(e) => set("location", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Event location" />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Description</label>
        <textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none" placeholder="Event description" />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Cover Image</label>
        {coverImagePreview ? (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-[#222936]">
            <img src={coverImagePreview} alt="Cover preview" className="w-full h-40 object-cover" />
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
            className="flex flex-col items-center justify-center gap-2 py-6 rounded-lg border-2 border-dashed border-gray-200 dark:border-[#222936] bg-gray-50 dark:bg-gray-800/30 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Upload size={18} className="text-muted" />
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Start Date</label>
          <input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">End Date</label>
          <input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
        </div>
      </div>
      {datesInvalid && (
        <p className="text-xs text-red-500 font-medium -mt-2">Start date cannot be after end date.</p>
      )}

      <div className="grid grid-cols-2 gap-4">
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

      <div>
        <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Speakers</label>
        <div className="space-y-2 mb-2">
          <input value={speakerName} onChange={(e) => setSpeakerName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Speaker name" />
          <input value={speakerTitle} onChange={(e) => setSpeakerTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Speaker title (e.g. Senior Engineer)" />
          <input value={speakerImage} onChange={(e) => setSpeakerImage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Speaker image URL (optional)" />
          <textarea value={speakerBio} onChange={(e) => setSpeakerBio(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none" placeholder="Speaker bio" />

          <button type="button" onClick={addSpeaker} disabled={!speakerName.trim()} className="px-3 py-2 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Add Speaker</button>
        </div>
        {form.speakers.length > 0 && (
          <div className="space-y-1.5">
            {form.speakers.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                {s.image ? (
                  <img src={s.image} alt={s.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-muted">{s.name[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground font-medium">{s.name}</span>
                  {s.title && <span className="text-xs text-muted ml-2">— {s.title}</span>}
                </div>
                <button type="button" onClick={() => { setSpeakerName(s.name); setSpeakerTitle(s.title); setSpeakerBio(s.bio); setSpeakerImage(s.image || ""); set("speakers", form.speakers.filter((_, j) => j !== i)); }} className="text-muted hover:text-primary transition-colors"><Edit size={13} /></button>
                <button type="button" onClick={() => removeSpeaker(i)} className="text-muted hover:text-red-500 transition-colors"><X size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {!formId && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide">Form Fields</label>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary-dark/10">
              {fieldsList.length} {fieldsList.length === 1 ? "field" : "fields"}
            </span>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-[#222936] overflow-hidden">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[#222936]">
              <div className="w-5 shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wide">Field Label</span>
              </div>
              <div className="w-[120px] shrink-0">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wide">Type</span>
              </div>
              <div className="w-[60px] shrink-0 text-center">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wide">Req</span>
              </div>
              <div className="w-7 shrink-0" />
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
                  className={`border-b border-gray-100 dark:border-[#222936] last:border-b-0 transition-opacity ${isDragging ? "opacity-40" : ""}`}
                >
                  <div className="flex items-start gap-2 px-4 py-2.5">
                    <div className="pt-1.5 text-muted shrink-0 cursor-grab">
                      <GripVertical size={14} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateFieldAt(idx, { label: e.target.value })}
                        placeholder="Field label"
                        className="w-full rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                      />

                      {hasOptions && (
                        <div className="mt-1.5 space-y-1">
                          {(field.options || []).map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-1">
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...(field.options || [])];
                                  updated[oi] = e.target.value;
                                  updateFieldAt(idx, { options: updated });
                                }}
                                placeholder={`Option ${oi + 1}`}
                                className="flex-1 rounded-md border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2 py-1 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
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
                                <X size={12} />
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
                      className="w-[120px] shrink-0 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    >
                      {FIELD_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>

                    <div className="w-[60px] shrink-0 flex justify-center pt-0.5">
                      <button
                        type="button"
                        onClick={() => updateFieldAt(idx, { required: !field.required })}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${
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
                      className="pt-1.5 text-muted hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center gap-2 px-4 py-2.5 border-t border-gray-200 dark:border-[#222936]">
              <input
                type="text"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="New field label"
                className="flex-1 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
                aria-label="New field type"
                className="w-[120px] shrink-0 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
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
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Check size={14} />
              </button>
            </div>
          </div>

          <p className="mt-1.5 text-xs text-muted">Click Required to toggle · Press Enter to confirm a new field</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={() => onSubmit({ ...form, fields: fieldsList }, coverImageFile)} disabled={loading || !form.title || !form.location || !form.content || datesInvalid} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
