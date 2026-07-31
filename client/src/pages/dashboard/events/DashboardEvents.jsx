import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Calendar, MapPin, Eye, Plus, Loader2,
  Trash2, Edit, ExternalLink, Star, Info, X,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../../../utils/api";
import toast from "react-hot-toast";
// Components
import Pagination from "../../../components/events/Pagination"
import Skeleton from "../../../components/skeletons/DashEventsSkeleton"
import UpcomingEvents from "../../../sections/events/UpcomingEvents"
import PreviousEvents from "../../../sections/events/PreviousEvents"
// Hooks
import { toLocalDatetimeString } from "../../../utils/dateUtils";
import { useEvents } from "../../../hooks/dashboard/events/useEvents";
import { useUpdateEvent } from "../../../hooks/dashboard/events/useUpdateEvent";
import { useDeleteEvent } from "../../../hooks/dashboard/events/useDeleteEvent";
import { useGetEvent } from "../../../hooks/dashboard/events/useGetEvent";
import { EVENT_TYPE_LABELS } from "../../../data/eventTypes";

const EVENTS_PER_PAGE = 6;
// Modals
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

/* Main Component */
export default function DashboardEvents() {
  const { allEvents, paginatedEvents: events, statusFilter, setFilter, counts, loading, error, page, setPage, pagination, refetch } = useEvents();
  const { updateEvent } = useUpdateEvent(refetch);
  const { deleteEvent } = useDeleteEvent(refetch);
  const { getEventById } = useGetEvent();

  const navigate = useNavigate();
  const location = useLocation();
  const goToLastPage = useRef(location.state?.goToLastPage);
  const [editEvent, setEventEditModal] = useState(null);
  const [editFullActivity, setEditFullActivity] = useState(null);
  const [viewEventId, setViewEventId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showFilterInfo, setShowFilterInfo] = useState(false);
  const [previewSection, setPreviewSection] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);

  const previewEvents = useMemo(() => {
    if (!previewSection) return { events: [], totalPages: 1 };
    const filtered = allEvents.filter((e) =>
      previewSection === "upcoming"
        ? e.registrationEnabled !== false
        : e.registrationEnabled === false
    );
    const total = Math.ceil(filtered.length / EVENTS_PER_PAGE) || 1;
    const safePage = Math.min(previewPage, total);
    const start = (safePage - 1) * EVENTS_PER_PAGE;
    const mapped = filtered.slice(start, start + EVENTS_PER_PAGE).map((e) => ({
      ...e,
      image: e.coverImage,
      badge: e.type?.charAt(0).toUpperCase() + e.type?.slice(1) || "Event",
      dateTime: { day: e.date, time: "" },
    }));
    return { events: mapped, totalPages: total };
  }, [previewSection, allEvents, previewPage]);

  useEffect(() => {
    if (!loading && goToLastPage.current) {
      goToLastPage.current = false;
      setPage(pagination.totalPages);
    }
  }, [loading, pagination.totalPages, setPage]);

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
      if (editEvent.formId && form.formStatus !== (editEvent.form?.status || "Active")) {
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
      toast("Activity deleted successfully!", {
        icon: <Trash2 size={16} className="text-red-500" />,
      });
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

				{/* Events filter */}
				<div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`text-sm font-medium px-4 py-2 rounded-full border transition-all duration-200 ${statusFilter === f ? "bg-primary text-white border-primary shadow-sm" : "bg-white dark:bg-[#1a1f2e] text-muted border-gray-200 dark:border-[#222936] hover:border-primary hover:text-primary"}`}>
              {f} <span className={`ml-1 text-[10px] ${statusFilter === f ? "text-white/80" : "text-muted/60"}`}>({counts[f]})</span>
            </button>
					))}
          <button type="button" onClick={() => setShowFilterInfo(true)} className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" aria-label="Filter info">
            <Info size={18} />
          </button>
				</div>

				{/* CTA Buttons */}
				<div className="flex items-center gap-2 w-full sm:w-auto">
					
          <a href="/events" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors shadow-sm flex-1 sm:flex-auto">
            <ExternalLink size={16} /> View on Site
          </a>
          <button onClick={() => navigate("/dashboard/events/flagship")} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors shadow-sm flex-1 sm:flex-auto">
            <Star size={16} /> Flagship Events
          </button>
          <button onClick={() => navigate("/dashboard/events/create-event")} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm flex-1 sm:flex-auto">
            <Plus size={16} /> Create Event
          </button>
        </div>
      </div>

      {/* Events Cards */}
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
            {statusFilter !== "All" ? `No ${statusFilter.toLowerCase()} events at the moment.` : "Create your first event to get started."}
          </p>
        </div>
      )}
      
      {/* Pagination Component */}
      <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />

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
                formStatus: editEvent.form?.status || "Active",
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
			<EventViewModal
				open={!!viewEventId} onClose={() => setViewEventId(null)}
				eventId={viewEventId}
				getEventById={getEventById}
			/>

      {/* Delete Confirmation */}
      <DeleteModal
        isOpen={!!deleteTarget}
        title="Delete Activity"
        description="This will permanently delete the activity, its form, and all submissions. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={saving}
      />

      {/* Filter Info Modal */}
      <Modal open={showFilterInfo} onClose={() => setShowFilterInfo(false)} title="Event Filters Explained" maxWidth="max-w-md">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Active</span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Active events are shown in the <strong>Upcoming Events</strong> section of the <Link to="/events" className="underline">events page</Link>.
            </p>
            <button
              type="button"
              onClick={() => { setShowFilterInfo(false); setPreviewSection("upcoming"); }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Preview section →
            </button>
          </div>
          <div className="border-t border-gray-100 dark:border-[#222936]" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Completed</span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Completed events are shown in the <strong>Previous Events</strong> section of the <Link to="/events" className="underline">events page</Link>.
            </p>
            <button
              type="button"
              onClick={() => { setShowFilterInfo(false); setPreviewSection("previous"); }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Preview section →
            </button>
          </div>
        </div>
      </Modal>

      {/* Section Preview Overlay */}
      {previewSection && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={() => { setPreviewSection(null); setPreviewPage(1); }} />
          <div className="relative w-full min-h-full bg-main shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#222936] bg-white dark:bg-[#1a1f2e] sticky top-0 z-10">
              <h2 className="text-base font-bold text-foreground capitalize">{previewSection} Events Section Preview</h2>
              <button onClick={() => { setPreviewSection(null); setPreviewPage(1); }} className="p-1.5 text-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
            {previewSection === "upcoming" ? (
              <UpcomingEvents
                events={previewEvents.events}
                loading={loading}
                page={previewPage}
                totalPages={previewEvents.totalPages}
                onPageChange={setPreviewPage}
              />
            ) : (
              <PreviousEvents
                events={previewEvents.events}
                loading={loading}
                page={previewPage}
                totalPages={previewEvents.totalPages}
                onPageChange={setPreviewPage}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}