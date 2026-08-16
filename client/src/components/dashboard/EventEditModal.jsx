import React, { useState } from "react";
import { X, Loader2, CheckCircle2, Upload } from "lucide-react";
import { EVENT_TYPES, EVENT_TYPE_LABELS } from "../../data/eventTypes";
import { useUpdateForm } from "../../hooks/dashboard/forms/useUpdateForm";
import { isHtmlContentEmpty } from "../../utils/eventUtils";
// Components
import Tooltip from "../ui/Tooltip";
import RichTextEditor from "./RichTextEditor";
import SpeakerManager from "./SpeakerManager";

export default function EditEvent({ initial, onSubmit, loading, formId, coverImageUrl }) {
  const [form, setForm] = useState(initial);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(coverImageUrl || null);
  const [coverImageRemoved, setCoverImageRemoved] = useState(false);
  const [formStatus, setFormStatus] = useState(initial.formStatus || "Active");

  const { updateForm } = useUpdateForm();

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const coverImageInputRef = React.useRef(null);

  const handleCoverImageSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
    setCoverImageRemoved(false);
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
    setCoverImageRemoved(true);
  };

  const datesInvalid = form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate);
  const endDatePassed = form.endDate && new Date(form.endDate) < new Date();
  const effectiveFormStatus = endDatePassed ? "Closed" : formStatus;
  const effectiveRegistrationEnabled = endDatePassed ? false : form.registrationEnabled;

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
        <input
          value={form.description || ""}
          onChange={(e) => set("description", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
          placeholder="Short text summary that will be shown on the event card"
        />
			</div>

      <div>
        <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Content</label>
        <RichTextEditor
          value={form.content}
          onChange={(html) => set("content", html)}
          placeholder="Event content"
        />
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
	        <label className="block text-[11px] font-bold text-muted uppercase tracking-wide">Form Status</label>
	        <Tooltip text={endDatePassed ? "End date is behind — Cannot accept submissions" : ""}>
	          <button
	            type="button"
	            disabled={endDatePassed}
							onClick={() => {
	            const newStatus = formStatus === "Active" ? "Closed" : "Active";
	            setFormStatus(newStatus);
	          }}
	            className={`mt-1 w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${endDatePassed ? "bg-red-100 dark:bg-red-800/30 border-red-300 dark:border-red-500 text-muted cursor-not-allowed opacity-60" : formStatus === "Active" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/40 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-800/30 border-red-300 dark:border-red-500 text-muted"}`}
	          >
	            {endDatePassed || formStatus !== "Active" ? "Not Accepting" : "Accepting Submissions"}
	          </button>
	        </Tooltip>
        </div>
      </div>

			<div>
    		      <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1.5">Section</label>
          <div className="flex rounded-lg border border-gray-200 dark:border-[#222936] overflow-hidden">
            <button
              type="button"
              disabled={endDatePassed}
              onClick={() => set("registrationEnabled", true)}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                endDatePassed
                  ? "bg-gray-100 dark:bg-gray-800 text-muted cursor-not-allowed opacity-60"
                  : effectiveRegistrationEnabled
                    ? "bg-primary/10 text-primary"
                    : "bg-white dark:bg-[#111827] text-muted hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Upcoming Events
            </button>
            <div className="w-px bg-gray-200 dark:border-[#222936]" />
            <button
              type="button"
              disabled={endDatePassed}
              onClick={() => set("registrationEnabled", false)}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                endDatePassed
                  ? "bg-primary/10 text-primary cursor-not-allowed opacity-60"
                  : effectiveRegistrationEnabled
                    ? "bg-white dark:bg-[#111827] text-muted hover:bg-gray-50 dark:hover:bg-gray-800"
                    : "bg-primary/10 text-primary"
              }`}
            >
              Previous Events
            </button>
          </div>
          </div>

      <div>
        <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Speakers</label>
        <SpeakerManager speakers={form.speakers} onChange={(s) => set("speakers", s)} />
      </div>

      <div>
        <button type="button" onClick={async () => {
          if (formId) {
            const formChanged =
              form.startDate !== initial.startDate ||
              form.endDate !== initial.endDate ||
              String(form.maxSubmissions) !== String(initial.maxSubmissions);
            if (formChanged) {
              await updateForm(formId, {
                startDate: new Date(form.startDate).toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                maxSubmissions: form.maxSubmissions,
              });
            }
          }
          onSubmit({ ...form, formStatus: effectiveFormStatus }, coverImageFile, coverImageRemoved);
        }} disabled={loading || !form.title || !form.location || isHtmlContentEmpty(form.content) || datesInvalid} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
