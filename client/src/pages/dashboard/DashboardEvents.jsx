import React from "react";
import { Calendar, MapPin, Eye, MoreHorizontal, Plus } from "lucide-react";
import { useEvents } from "../../hooks/dashboard/useEvents";

/* ─── Type badge color map ─────────────────────────────────────── */
const TYPE_COLORS = {
  teal: {
    bg: "bg-teal-50 dark:bg-teal-900/25",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-700/40",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/25",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-700/40",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/25",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-700/40",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/25",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-700/40",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/25",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-700/40",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/25",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-700/40",
  },
};

const STATUS_STYLES = {
  Active: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
    dot: "bg-green-500",
  },
  Completed: {
    bg: "bg-gray-50 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400 dark:bg-gray-500",
  },
};

const FILTERS = ["All", "Active", "Completed"];

/* ─── Skeleton loader ──────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card-alt rounded-xl p-5 space-y-4">
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Single Event Card ────────────────────────────────────────── */
function EventCard({ event }) {
  const typeStyle = TYPE_COLORS[event.typeColor] || TYPE_COLORS.blue;
  const statusStyle = STATUS_STYLES[event.status] || STATUS_STYLES.Completed;
  const attendeePercent =
    event.maxAttendees > 0
      ? Math.round((event.attendees / event.maxAttendees) * 100)
      : 0;

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200 p-5 flex flex-col justify-between">
      {/* Top: Type Badge + Status */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
          >
            {event.type}
          </span>
          <span
            className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-md ${statusStyle.bg} ${statusStyle.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {event.status}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-foreground font-semibold text-[15px] leading-snug mb-3">
          {event.title}
        </h3>

        {/* Date + Location */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-muted text-xs">
            <Calendar size={13} className="shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted text-xs">
            <MapPin size={13} className="shrink-0" />
            <span>{event.location}</span>
          </div>
        </div>

        {/* Attendees bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted font-medium">Attendees</span>
            <span className="text-foreground font-semibold">
              {event.attendees}
            </span>
          </div>
          <div className="h-[5px] w-full rounded-full bg-gray-100 dark:bg-gray-700/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${attendeePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom: Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
          <Eye size={13} />
          View
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
          <MoreHorizontal size={13} />
          Edit
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────── */
export default function DashboardEvents() {
  const { events, filter, setFilter, counts, totalCount } = useEvents();

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-4 py-2 rounded-full border transition-all duration-200 ${
                filter === f
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white dark:bg-[#1a1f2e] text-muted border-gray-200 dark:border-[#222936] hover:border-primary hover:text-primary"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="text-xs text-muted font-medium ml-1">
            {events.length} results
          </span>
        </div>

        {/* Action Button */}
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm w-full sm:w-auto">
          <Plus size={16} />
          Create New Event
        </button>
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936]">
          <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4">
            <Calendar size={24} className="text-muted" />
          </div>
          <h3 className="text-foreground font-semibold text-base mb-1">
            No events found
          </h3>
          <p className="text-muted text-sm max-w-[280px] text-center">
            {filter !== "All"
              ? `No ${filter.toLowerCase()} events at the moment.`
              : "Create your first event to get started."}
          </p>
        </div>
      )}
    </div>
  );
}
