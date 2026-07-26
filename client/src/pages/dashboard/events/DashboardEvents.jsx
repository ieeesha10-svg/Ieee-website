import React, { useState, useEffect } from "react";
import {
  Calendar, MapPin, Eye, Plus, Loader2,
  Trash2, Edit, Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import toast from "react-hot-toast";
import Skeleton from "../../../components/skeletons/DashEventsSkeleton"
import { toLocalDatetimeString } from "../../../utils/dateUtils";
import { useEvents } from "../../../hooks/dashboard/events/useEvents";
import { useUpdateEvent } from "../../../hooks/dashboard/events/useUpdateEvent";
import { useDeleteEvent } from "../../../hooks/dashboard/events/useDeleteEvent";
import { useGetEvent } from "../../../hooks/dashboard/events/useGetEvent";
import EventEditModal from "../../../components/dashboard/EventEditModal";
import Modal from "../../../components/Modal"
import DeleteModal from "../../../components/DeleteModal"
import EventViewModal from "../../../components/dashboard/EventViewModal"

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

const EVENT_TYPE_LABELS = { general: "General", event: "Event", workshop: "Workshop", webinar: "Webinar" };

function EventCard({ event, onView, onEdit, onDelete }) {
  const typeStyle = TYPE_COLORS[event.typeColor] || TYPE_COLORS.blue;
	const statusStyle = STATUS_STYLES[event.registrationEnabled ? "Active" : "Completed"];

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200 p-5 flex flex-col justify-between">
      <div>
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-40 object-cover rounded-lg mb-3" />
        ) : (
          <div className="w-full h-40 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-3">
            <span className="text-3xl font-bold text-primary/20">{(event.title || "E").split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()}</span>
          </div>
        )}
        <div className="flex items-start justify-between mb-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>{EVENT_TYPE_LABELS[event.type] || event.type}</span>
          <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-md ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {event.registrationEnabled ? "Active" : "Completed"}
          </span>
        </div>
        <h3 className="text-foreground font-semibold text-[15px] leading-snug mb-3">{event.title}</h3>
        <div className="space-y-1.5 pb-3 border-b border-b-border">
          {event.date && <div className="flex items-center gap-2 text-muted text-xs"><Calendar size={13} className="shrink-0" /><span>{event.date}</span></div>}
          <div className="flex items-center gap-2 text-muted text-xs"><MapPin size={13} className="shrink-0" /><span>{event.location}</span></div>
        </div>

      </div>
      <div className="flex items-center gap-2 pt-3">
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
  const { events, filter, setFilter, counts, loading, error, page, setPage, pagination, refetch } = useEvents();
  const { updateEvent } = useUpdateEvent(refetch);
  const { deleteEvent } = useDeleteEvent(refetch);
  const { getEventById } = useGetEvent();

	const navigate = useNavigate();
  const [editEvent, setEventEditModal] = useState(null);
  const [editFullActivity, setEditFullActivity] = useState(null);
  const [viewEventId, setViewEventId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!editEvent) { setEditFullActivity(null); return; }
    setEditLoading(true);
    api.get(`/activities/${editEvent.id}`)
      .then((res) => setEditFullActivity(res.data.activity || null))
      .catch(() => setEditFullActivity(null))
      .finally(() => setEditLoading(false));
  }, [editEvent]);

  // No handleCreate needed — create button navigates to /dashboard/events/create-event

  const handleEdit = async (form, coverImageFile, coverImageRemoved) => {
    setSaving(true);
    try {
      if (editEvent.formId && form.registrationEnabled !== (editFullActivity?.registrationEnabled ?? true)) {
        await api.put(`/form/${editEvent.formId}/toggle`);
      }
      await updateEvent(editEvent.id, { ...form, formId: editEvent.formId }, coverImageFile, coverImageRemoved);
      toast.success("Activity updated successfully!");
      setEventEditModal(null);
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
            <button key={f} onClick={() => setFilter(f)} className={`font-medium px-4 py-2 rounded-full border transition-all duration-200 ${filter === f ? "bg-primary text-white border-primary shadow-sm" : "bg-white dark:bg-[#1a1f2e] text-muted border-gray-200 dark:border-[#222936] hover:border-primary hover:text-primary"}`}>
              {f} <span className={`ml-1 text-[10px] ${filter === f ? "text-white/80" : "text-muted/60"}`}>({counts[f]})</span>
            </button>
          ))}
				</div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={() => navigate("/dashboard/events/flagship")} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors shadow-sm flex-1 sm:flex-auto">
            <Star size={16} /> Flagship Events
          </button>
          <button onClick={() => navigate("/dashboard/events/create-event")} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm flex-1 sm:flex-auto">
            <Plus size={16} /> Create New Event
          </button>
        </div>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onView={setViewEventId} onEdit={setEventEditModal} onDelete={setDeleteTarget} />
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

      <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-[#222936] text-muted hover:text-foreground hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 text-xs font-medium rounded-lg border transition-colors ${
                page === p
                  ? "bg-primary text-white border-primary"
                  : "border-gray-200 dark:border-[#222936] text-muted hover:text-foreground hover:border-primary"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-[#222936] text-muted hover:text-foreground hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

      {/* Edit Modal */}
      <Modal open={!!editEvent} onClose={() => setEventEditModal(null)} title="Edit Event">
        {editEvent && (
          editEvent.formId && editLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
          ) : (
            <EventEditModal
              initial={{
                title: editEvent.title,
                content: editEvent.content,
                description: editEvent.description || "",
                type: editEvent.type,
                location: editEvent.location,
                speakers: (editEvent.speakers || []).map((s) => ({ ...s })),
                startDate: editEvent.form?.startDate ? toLocalDatetimeString(editEvent.form.startDate) : "",
                endDate: editEvent.form?.endDate ? toLocalDatetimeString(editEvent.form.endDate) : "",
                maxSubmissions: editEvent.form?.maxSubmissions || "",
                registrationEnabled: editFullActivity?.registrationEnabled ?? editEvent.registrationEnabled,
                fields: editEvent.form?.fields || [],
              }}
              coverImageUrl={editEvent.coverImage || ""}
              formId={editEvent.formId}
              onSubmit={handleEdit}
              loading={saving}
            />
          )
        )}
      </Modal>

      {/* View Modal */}
      <EventViewModal open={!!viewEventId} onClose={() => setViewEventId(null)} eventId={viewEventId} getEventById={getEventById} />

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