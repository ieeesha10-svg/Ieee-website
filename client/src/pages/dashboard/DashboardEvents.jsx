import React, { useState, useEffect } from "react";
import {
  Calendar, MapPin, Eye, Plus, X, Loader2,
  Trash2, Edit, AlertTriangle, CheckCircle2, FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEvents } from "../../hooks/dashboard/useEvents";
import DeleteModal from "../../components/DeleteModal";
import Skeleton from "../../components/skeletons/DashEventsSkeleton";

const TYPE_COLORS = {
  teal: { bg: "bg-teal-50 dark:bg-teal-900/25", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-700/40" },
  blue: { bg: "bg-blue-50 dark:bg-blue-900/25", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-700/40" },
  amber: { bg: "bg-amber-50 dark:bg-amber-900/25", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-700/40" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/25", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-700/40" },
  red: { bg: "bg-red-50 dark:bg-red-900/25", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-700/40" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-900/25", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-700/40" },
};

const STATUS_STYLES = {
  Active: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-600 dark:text-green-400", dot: "bg-green-500" },
  Completed: { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-400 dark:bg-gray-500" },
};

const FILTERS = ["All", "Active", "Completed"];
const EVENT_TYPES = ["general", "event", "workshop", "webinar"];

const EVENT_TYPE_LABELS = { general: "General", event: "Event", workshop: "Workshop", webinar: "Webinar" };

const EMPTY_FORM = { title: "", content: "", type: "event", location: "", speakers: [], startDate: "", endDate: "", maxSubmissions: "", registrationEnabled: true };

/* ─── Modal Wrapper ─────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div className={`relative bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#222936]">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1.5 text-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ─── Event Form (shared by Create + Edit) ──────────────────────── */
function EventForm({ initial, onSubmit, submitLabel, loading }) {
  const [form, setForm] = useState(initial);
  const [speakerName, setSpeakerName] = useState("");
  const [speakerTitle, setSpeakerTitle] = useState("");
  const [speakerBio, setSpeakerBio] = useState("");
  const [speakerImageFile, setSpeakerImageFile] = useState(null);
  const [speakerImagePreview, setSpeakerImagePreview] = useState(null);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const addSpeaker = () => {
    if (!speakerName.trim()) return;
    set("speakers", [...form.speakers, {
      name: speakerName.trim(),
      title: speakerTitle.trim(),
      bio: speakerBio.trim(),
      imageFile: speakerImageFile,
      imagePreview: speakerImagePreview,
      image: null,
    }]);
    setSpeakerName("");
    setSpeakerTitle("");
    setSpeakerBio("");
    setSpeakerImageFile(null);
    setSpeakerImagePreview(null);
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
          <button type="button" onClick={() => set("registrationEnabled", !form.registrationEnabled)} className={`mt-1 w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${form.registrationEnabled ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/40 text-green-700 dark:text-green-300" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-[#222936] text-muted"}`}>
            {form.registrationEnabled ? "Accepting Registrations" : "Closing Registration"}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Speakers</label>
        <div className="space-y-2 mb-2">
          <input value={speakerName} onChange={(e) => setSpeakerName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Speaker name" />
          <input value={speakerTitle} onChange={(e) => setSpeakerTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Speaker title (e.g. Senior Engineer)" />
          <textarea value={speakerBio} onChange={(e) => setSpeakerBio(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none" placeholder="Speaker bio" />

          <button type="button" onClick={addSpeaker} disabled={!speakerName.trim()} className="px-3 py-2 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Add Speaker</button>
        </div>
        {form.speakers.length > 0 && (
          <div className="space-y-1.5">
            {form.speakers.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                {s.imagePreview ? (
                  <img src={s.imagePreview} alt={s.name} className="w-7 h-7 rounded-full object-cover" />
                ) : s.image ? (
                  <img src={s.image} alt={s.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-muted">{s.name[0]}</div>
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
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={() => onSubmit(form)} disabled={loading || !form.title || !form.location || !form.content || datesInvalid} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

/* ─── View Modal ─────────────────────────────────────────────────── */
function ViewModal({ open, onClose, eventId, getEventById }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && eventId) {
      setLoading(true);
      getEventById(eventId).then((res) => setData(res)).finally(() => setLoading(false));
    }
    if (!open) setData(null);
  }, [open, eventId, getEventById]);

  const activity = data?.activity;
  const form = data?.form;

  return (
    <Modal open={open} onClose={onClose} title="Activity Details" maxWidth="max-w-xl">
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : activity ? (
        <div className="space-y-5">
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Title</span>
            <p className="text-sm text-foreground mt-1">{activity.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Type</span>
              <p className="text-sm text-foreground mt-1 capitalize">{activity.type}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Location</span>
              <p className="text-sm text-foreground mt-1">{activity.location}</p>
            </div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Description</span>
            <p className="text-sm text-foreground mt-1 whitespace-pre-line">{activity.content}</p>
          </div>
          {activity.speakers?.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Speakers</span>
              <div className="space-y-3 mt-2">
                {activity.speakers.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    {s.image ? (
                      <img src={s.image} alt={s.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {s.name?.[0] || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{s.name}</p>
                      {s.title && <p className="text-xs text-primary font-medium mt-0.5">{s.title}</p>}
                      {s.bio && <p className="text-xs text-muted mt-1 leading-relaxed">{s.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {form && (
            <div className="pt-3 border-t border-gray-100 dark:border-[#222936]">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-muted" />
                <span className="text-xs font-bold text-muted uppercase tracking-wide">Form Details</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted text-xs">Registration</span>
                  <p className={`font-medium ${activity.registrationEnabled !== false ? "text-green-600 dark:text-green-400" : "text-muted"}`}>
                    {activity.registrationEnabled !== false ? "Open" : "Closed"}
                  </p>
                </div>
                <div>
                  <span className="text-muted text-xs">Max Submissions</span>
                  <p className="text-foreground font-medium">{form.maxSubmissions ? form.maxSubmissions.toLocaleString() : "Unlimited"}</p>
                </div>
                <div>
                  <span className="text-muted text-xs">Registration Opens</span>
                  <p className="text-foreground font-medium">{form.startDate ? new Date(form.startDate).toLocaleString() : "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted text-xs">Registration Closes</span>
                  <p className="text-foreground font-medium">{form.endDate ? new Date(form.endDate).toLocaleString() : "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}

/* ─── Delete Confirmation ────────────────────────────────────────── */
/* ─── Event Card ─────────────────────────────────────────────────── */
function EventCard({ event, onView, onEdit, onDelete }) {
  const typeStyle = TYPE_COLORS[event.typeColor] || TYPE_COLORS.blue;
  const statusStyle = STATUS_STYLES[event.status] || STATUS_STYLES.Completed;
  const attendeePercent = event.maxAttendees > 0 ? Math.round((event.attendees / event.maxAttendees) * 100) : 0;

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>{EVENT_TYPE_LABELS[event.type] || event.type}</span>
          <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-md ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {event.status}
          </span>
        </div>
        <h3 className="text-foreground font-semibold text-[15px] leading-snug mb-3">{event.title}</h3>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-muted text-xs"><Calendar size={13} className="shrink-0" /><span>{event.date}</span></div>
          <div className="flex items-center gap-2 text-muted text-xs"><MapPin size={13} className="shrink-0" /><span>{event.location}</span></div>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted font-medium">Attendees</span>
            <span className="text-foreground font-semibold">{event.attendees}</span>
          </div>
          <div className="h-[5px] w-full rounded-full bg-gray-100 dark:bg-gray-700/50 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${attendeePercent}%` }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button onClick={() => onView(event.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
          <Eye size={13} /> View
        </button>
        <button onClick={() => onEdit(event)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
          <Edit size={13} /> Edit
        </button>
        <button onClick={() => onDelete(event)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function DashboardEvents() {
  const { events, filter, setFilter, counts, totalCount, loading, error, createEvent, updateEvent, deleteEvent, getEventById } = useEvents();

  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [viewEventId, setViewEventId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await createEvent(form);
      toast.success("Activity created successfully!");
      setShowCreate(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create activity";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await updateEvent(editEvent.id, form);
      toast.success("Activity updated successfully!");
      setEditEvent(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update activity";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteEvent(deleteTarget.id);
      toast.success("Activity deleted successfully!");
      setDeleteTarget(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to delete activity";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-red-200 dark:border-red-900/40 shadow-sm p-8 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          <p className="text-foreground font-semibold text-lg mb-1">Failed to load events</p>
          <p className="text-muted text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs font-medium px-4 py-2 rounded-full border transition-all duration-200 ${filter === f ? "bg-primary text-white border-primary shadow-sm" : "bg-white dark:bg-[#1a1f2e] text-muted border-gray-200 dark:border-[#222936] hover:border-primary hover:text-primary"}`}>
              {f}
            </button>
          ))}
          <span className="text-xs text-muted font-medium ml-1">{events.length} results</span>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm w-full sm:w-auto">
          <Plus size={16} /> Create New Event
        </button>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onView={setViewEventId} onEdit={setEditEvent} onDelete={setDeleteTarget} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936]">
          <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4">
            <Calendar size={24} className="text-muted" />
          </div>
          <h3 className="text-foreground font-semibold text-base mb-1">No events found</h3>
          <p className="text-muted text-sm max-w-[280px] text-center">
            {filter !== "All" ? `No ${filter.toLowerCase()} events at the moment.` : "Create your first event to get started."}
          </p>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Event">
        <EventForm initial={EMPTY_FORM} onSubmit={handleCreate} submitLabel="Create Event" loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editEvent} onClose={() => setEditEvent(null)} title="Edit Event">
        {editEvent && (
          <EventForm
            initial={{
              title: editEvent.title,
              content: editEvent.content,
              type: editEvent.type,
              location: editEvent.location,
              speakers: (editEvent.speakers || []).map((s) => ({ ...s, imageFile: null, imagePreview: null })),
              startDate: editEvent.form?.startDate ? new Date(editEvent.form.startDate).toISOString().slice(0, 16) : "",
              endDate: editEvent.form?.endDate ? new Date(editEvent.form.endDate).toISOString().slice(0, 16) : "",
              maxSubmissions: editEvent.form?.maxSubmissions || "",
              registrationEnabled: editEvent.registrationEnabled,
            }}
            onSubmit={handleEdit}
            submitLabel="Save Changes"
            loading={saving}
          />
        )}
      </Modal>

      {/* View Modal */}
      <ViewModal open={!!viewEventId} onClose={() => setViewEventId(null)} eventId={viewEventId} getEventById={getEventById} />

      {/* Delete Confirmation */}
      <DeleteModal
        isOpen={!!deleteTarget}
        title="Delete Activity"
        description="This will permanently delete the activity, its form, and all submissions. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={saving}
      />
    </div>
  );
}