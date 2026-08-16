import React, { useState, useEffect, useMemo } from "react";
import { Link } from 'react-router-dom'
import api from "../../../utils/api";
// Icons
import {
  Star, Trash2, Edit, X, Loader2, Plus, Calendar, MapPin, Image, Check, Eye, ArrowLeft, ArrowLeftRight,
} from "lucide-react";
import toast from "react-hot-toast";
// components
import EventCard from "../../../components/guest/events/HomeEventCard";
import Pagination from "../../../components/ui/Pagination";
import Button from "../../../components/ui/Button";
// Hooks
import { useFeaturedEvents, useAddFeatured, useRemoveFeatured, useSwapFeatured } from "../../../hooks/dashboard/events/useFeaturedEvents";
import { useEvents } from "../../../hooks/dashboard/events/useEvents";
import { useUpdateEvent } from "../../../hooks/dashboard/events/useUpdateEvent";
import { useGetEvent } from "../../../hooks/dashboard/events/useGetEvent";
import { toLocalDatetimeString } from "../../../utils/dateUtils";
// Modals
import Modal from "../../../components/ui/Modal";
import EventEditModal from "../../../components/dashboard/EventEditModal";
import EventViewModal from "../../../components/dashboard/EventViewModal";

function EventPicker({ featuredIds, onSelect, onClose }) {
  const { paginatedEvents: events, loading, page, setPage, pagination } = useEvents();

  return (
    <Modal open onClose={onClose} title="Select an Event" maxWidth="max-w-2xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-muted text-center py-8">No events available.</p>
      ) : (
        <>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {events.map((event) => {
              const isFeatured = featuredIds.has(event.id);
              const Tag = isFeatured ? "div" : "button";
              return (
                <Tag
                  key={event.id}
                  {...(!isFeatured && { onClick: () => { onSelect(event.id); onClose(); } })}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl border text-left ${
                    isFeatured
                      ? "border-green-200 dark:border-green-700/40 bg-green-50/50 dark:bg-green-900/10 opacity-60 cursor-default"
                      : "border-gray-100 dark:border-[#222936] hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                  }`}
                >
                  {event.coverImage ? (
                    <img src={event.coverImage} alt={event.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <Image size={20} className="text-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{event.title}</h3>
                    {event.description && (
                      <p className="text-xs text-muted line-clamp-2 mt-0.5">{event.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                      {event.date && (
                        <span className="flex items-center gap-1"><Calendar size={11} />{event.date}</span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1"><MapPin size={11} />{event.location}</span>
                      )}
                    </div>
                  </div>
                  {isFeatured ? (
                    <Check size={18} className="text-green-500 shrink-0" />
                  ) : (
                    <Plus size={18} className="text-primary shrink-0" />
                  )}
                </Tag>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </Modal>
  );
}

export default function FeaturedEvents() {
  const { featured, loading, refetch } = useFeaturedEvents();
  const { addFeatured } = useAddFeatured(refetch);
  const { removeFeatured } = useRemoveFeatured(refetch);
  const { swapFeatured } = useSwapFeatured(refetch);
  const { getEventById } = useGetEvent();
  const { updateEvent } = useUpdateEvent(refetch);

  const [showPicker, setShowPicker] = useState(false);
  const [adding, setAdding] = useState(false);

  const featuredIds = useMemo(() => new Set(featured.map((e) => e.id)), [featured]);

  const [editEvent, setEventEditModal] = useState(null);
  const [editFullActivity, setEditFullActivity] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [viewEventId, setViewEventId] = useState(null);

  useEffect(() => {
    if (!editEvent) { setEditFullActivity(null); return; }
    setEditLoading(true);
    api.get(`/activities/${editEvent.id}`)
      .then((res) => setEditFullActivity(res.data.activity || null))
      .catch(() => setEditFullActivity(null))
      .finally(() => setEditLoading(false));
  }, [editEvent]);

  const handleAdd = async (activityId) => {
    setAdding(true);
    try {
      await addFeatured(activityId);
      toast.success("Event added to featured");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add featured event");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (activityId) => {
    try {
      await removeFeatured(activityId);
      toast.success("Event removed from featured");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove featured event");
    }
  };

  const handleSwap = async () => {
    try {
      await swapFeatured();
      toast.success("Events swapped");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to swap events");
    }
  };

  const handleEdit = async (form, coverImageFile, coverImageRemoved) => {
    setSaving(true);
    try {
      if (editEvent.formId && form.formStatus !== (editEvent.form?.status || "Active")) {
        await api.put(`/form/${editEvent.formId}/toggle`);
      }
      await updateEvent(editEvent.id, { ...form, formId: editEvent.formId }, coverImageFile, coverImageRemoved);
      toast.success("Event updated successfully!");
      setEventEditModal(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update event";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between flex-col md:flex-row">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            aria-label="Go back"
            className="p-2 text-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Flagship Events</h1>
            <p className="text-sm text-muted mt-1">Manage the events shown on the homepage (max 2)</p>
          </div>
				</div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto mt-4 md:mt-0">
          <button
            onClick={() => setShowPicker(true)}
            disabled={adding || featured.length >= 2}
            title={featured.length >= 2 ? "Max 2 events" : undefined}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-3"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
            Add Flagship Event
          </button>
          <div className="flex items-center gap-2 order-2 sm:order-none w-full sm:w-auto">
            <button
              onClick={() => setShowPreview(true)}
              disabled={featured.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground border border-gray-200 dark:border-[#222936] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-auto"
            >
              <Eye size={16} /> Preview
            </button>
            {featured.length === 2 && (
              <button
                onClick={handleSwap}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground border border-gray-200 dark:border-[#222936] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-1 sm:flex-auto"
              >
                <ArrowLeftRight size={16} /> Swap
              </button>
            )}
          </div>
        </div>
      </div>

      {featured.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936]">
          <Star size={32} className="text-muted mb-3" />
          <h2 className="text-foreground font-semibold mb-1">No flaghip events</h2>
          <p className="text-muted text-sm">Click "Add Flaghip Event" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featured.map((event, idx) => (
            <div key={event.id} className="flex flex-col bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] overflow-hidden">
              <div className="relative">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-90 object-cover" />
                ) : (
                  <div className="w-full h-56 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Image size={32} className="text-muted" />
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                  #{idx + 1}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h2 className="font-bold text-foreground">{event.title}</h2>
                  {event.description && (
                    <p className="text-sm text-muted line-clamp-2 mt-1">{event.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted">
                  {event.date && <span className="flex items-center gap-1"><Calendar size={12} />{event.date}</span>}
                  {event.location && <span className="flex items-center gap-1"><MapPin size={12} />{event.location}</span>}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-[#222936]">
                  <button
                    onClick={() => setViewEventId(event.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground border border-gray-200 dark:border-[#222936] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Eye size={13} /> View
                  </button>
                  <button
                    onClick={() => setEventEditModal(event)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Edit size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(event)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 border border-red-200 dark:border-red-700/40 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={13} /> Remove
									</button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPicker && <EventPicker featuredIds={featuredIds} onSelect={handleAdd} onClose={() => setShowPicker(false)} />}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove From Flagship Events">
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Remove <span className="font-semibold text-foreground">{deleteTarget.title}</span> from flagship events?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-foreground border border-gray-200 dark:border-[#222936] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemove(deleteTarget.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!editEvent} onClose={() => setEventEditModal(null)} title="Edit Event" maxWidth="max-w-2xl">
        {editEvent && (
          editLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
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
              onSubmit={handleEdit}
              submitLabel={saving ? "Saving..." : "Save Changes"}
              loading={saving}
              coverImageUrl={editEvent.coverImage || ""}
              formId={editEvent.formId}
            />
          )
        )}
      </Modal>

      <EventViewModal open={!!viewEventId} onClose={() => setViewEventId(null)} eventId={viewEventId} getEventById={getEventById} />

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={() => setShowPreview(false)} />
          <div className="relative w-full min-h-full bg-main shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#222936] bg-white dark:bg-[#1a1f2e] sticky top-0 z-10">
							<div className="flex gap-2 items-center">
								<h2 className="font-bold text-foreground mr-2">Homepage Preview</h2>
								<Link to='/'>
									<Button variant="link" aria-label="Go to Homepage">Go to Homepage</Button>
								</Link>
							</div>
              <button onClick={() => setShowPreview(false)} aria-label="Close" className="p-1.5 text-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
            <section className="w-full py-12 lg:py-20 px-4 lg:px-6 bg-main transition-colors duration-300">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center mb-12 lg:mb-20">
                  <h2 className="text-3xl md:text-4xl lg:text-[72px] font-black uppercase text-center leading-tight">
                    <span className="text-foreground transition-colors duration-300">FLAGSHIP </span>
                    <span className="text-primary-dark">EVENTS</span>
                  </h2>
                  <div className="mt-3 lg:mt-4 rounded-full w-[100px] lg:w-[128px] h-[4px] lg:h-[6px] bg-linear-to-r from-primary-dark to-primary-light" />
                </div>
                <div className="flex flex-col lg:flex-row items-start justify-center gap-10 lg:gap-8">
                  {featured.map((event) => (
                    <EventCard
                      key={event.id}
                      badge={event.badge}
                      title={event.title}
                      image={event.image}
                      description={event.description}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
