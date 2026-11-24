import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Clock,
  Loader2,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import api from "../../utils/api";

const TYPE_STYLES = {
  Technical: "bg-[#F0F7FF] text-[#007BFF]",
  "AI / ML": "bg-[#F8F0FF] text-[#A855F7]",
  "Branch Event": "bg-[#F0FFF4] text-[#1BCC6E]",
  event: "bg-[#F0F7FF] text-[#007BFF]",
  workshop: "bg-[#FFF7E6] text-[#FF8C00]",
  webinar: "bg-[#F8F0FF] text-[#A855F7]",
  general: "bg-gray-100 text-gray-600",
};

const TYPE_LABELS = {
  event: "Event",
  workshop: "Workshop",
  webinar: "Webinar",
  general: "General",
};

function TypeBadge({ type }) {
  const label = TYPE_LABELS[type] || type || "Event";
  const badgeStyle = TYPE_STYLES[type] || "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold mt-2 ${badgeStyle}`}
    >
      {label}
    </span>
  );
}

function StatusBadge({ attended, attendedAt, eventEndDate }) {
  let badgeClass;
  let label;

  if (attended) {
    badgeClass = "bg-[#F0FFF4] text-[#1BCC6E]";
    const attendedTime = attendedAt
      ? new Date(attendedAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "";
    label = attendedTime ? `Attended at ${attendedTime}` : "Attended";
  } else if (eventEndDate && new Date(eventEndDate) >= new Date()) {
    badgeClass = "bg-[#FFF7E6] text-[#FF8C00]";
    label = "Pending";
  } else {
    badgeClass = "bg-gray-100 text-gray-500";
    label = "No";
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold whitespace-nowrap ${badgeClass}`}
    >
      {label}
    </span>
  );
}

function EventCard({
  title,
  dateObj,
  location,
  time,
  type,
  colorTheme,
  attended,
  attendedAt,
  eventEndDate,
}) {
  // Fallback date formats if date parsing fails
  const day = dateObj ? dateObj.getDate() : "00";
  const month = dateObj
    ? dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase()
    : "MMM";

  // Different colors for the date box based on the design
  const dateBoxColors = {
    blue: "bg-[#007BFF]",
    purple: "bg-[#8A2BE2]",
    green: "bg-[#1BCC6E]",
  };

  return (
    <div className="bg-[#F7FAFF] dark:bg-[#181C25] rounded-[20px] border border-[#D8E8F8] dark:border-border shadow-sm p-4 flex items-center gap-5 transition-all hover:shadow-md">
      {/* Date Box */}
      <div
        className={`${dateBoxColors[colorTheme] || dateBoxColors.blue} text-white rounded-[16px] w-[70px] h-[75px] flex flex-col items-center justify-center shrink-0 shadow-md`}
      >
        <span className="text-[22px] font-bold leading-none">{day}</span>
        <span className="text-[12px] font-medium mt-1 tracking-wider">
          {month}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <h4 className="font-bold text-[16px] text-[#111827] dark:text-white mb-1">
          {title}
        </h4>

        <div className="flex items-center gap-4 text-[13px] text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{time}</span>
          </div>
        </div>

        <TypeBadge type={type} />
      </div>

      {/* Attendance Status */}
      <div className="self-start mt-2 mr-2">
        <StatusBadge
          attended={attended}
          attendedAt={attendedAt}
          eventEndDate={eventEndDate}
        />
      </div>
    </div>
  );
}

export default function AttendedEvents() {
  const { userData } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // StrictMode double-mounts effects in dev, so the first request is
    // aborted on cleanup to avoid firing the endpoint more than once.
    const controller = new AbortController();
    const { signal } = controller;

    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      if (!userData._id) {
        setEvents([]);
        setIsLoading(false);
        return;
      }

      try {
        let submissions = [];

        try {
          const response = await api.get(`/users/${userData._id}/events`, {
            signal,
          });
          submissions = Array.isArray(response.data?.data)
            ? response.data.data
            : response.data?.events || [];
        } catch (err) {
          // Backend returns 400 "No events found" when the member has no submissions yet
          if (err.response?.status !== 400) throw err;
        }

        if (!submissions.length) {
          setEvents([]);
          setIsLoading(false);
          return;
        }

        // The backend embeds the form (`item.formId`) and its linked activity
        // (`item.formId.activityID`) in each submission. Only fetch the activity
        // list as a fallback when some submissions arrive unpopulated.
        const needsActivityFallback = submissions.some(
          (item) => !item.formId || typeof item.formId !== "object",
        );

        const activityByForm = {};
        if (needsActivityFallback) {
          const activitiesRes = await api
            .get("/activities", {
              params: { page: 1, limit: 1000 },
              signal,
            })
            .catch(() => ({ data: { activities: [] } }));
          (activitiesRes.data?.activities || []).forEach((a) => {
            if (a.formID) activityByForm[a.formID] = a;
          });
        }

        const themes = ["blue", "purple", "green"];
        const mappedEvents = submissions
          .map((item, index) => {
            const form =
              item.formId && typeof item.formId === "object"
                ? item.formId
                : null;
            const rawFormId =
              typeof item.formId === "string" ? item.formId : null;
            const activity =
              form?.activityID ||
              (rawFormId && activityByForm[rawFormId]) ||
              null;

            const dateStr =
              activity?.startDate ||
              form?.startDate ||
              item.attendedAt ||
              item.createdAt;
            const dateObj = dateStr ? new Date(dateStr) : null;
            const endDate = activity?.endDate || form?.endDate || null;

            return {
              id: activity?._id || form?._id || item._id,
              title: activity?.title || form?.title || "Untitled Event",
              dateObj,
              time: dateObj
                ? dateObj.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Time N/A",
              location: activity?.location || "Location N/A",
              type: activity?.type || form?.type || "event",
              colorTheme: themes[index % themes.length],
              attended: !!item.attended,
              attendedAt: item.attendedAt || null,
              eventEndDate: endDate ? new Date(endDate) : null,
            };
          })
          .sort(
            (a, b) =>
              (b.dateObj?.getTime() || 0) - (a.dateObj?.getTime() || 0),
          );

        setEvents(mappedEvents);
      } catch {
        if (!signal.aborted) setError("Failed to load attended events.");
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    };

    fetchEvents();

    return () => controller.abort();
  }, [userData._id]);

  return (
    <div className="bg-white dark:bg-[#13161D] rounded-[24px] shadow-sm p-6 md:p-8">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-[50px] h-[50px] rounded-[16px] bg-[#FF9800] flex items-center justify-center text-white shrink-0 shadow-md border-[3px] border-orange-100 dark:border-border">
          <Calendar size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="font-bold text-[22px] text-[#111827] dark:text-white">
            Attended Events
          </h2>
          <p className="text-[14px] text-gray-500 font-medium">
            Events you've attended
          </p>
        </div>
      </div>

      {/* ─── States & Content ────────────────────────────────────────────── */}
      <div className="space-y-4 bg-white dark:bg-[#13161D] rounded-[20px] p-4 border border-border">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#007BFF] w-8 h-8" />
            <p className="text-gray-500 font-medium">Loading your events...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
            <AlertTriangle className="text-[#FF4757] w-12 h-12" />
            <h3 className="font-bold text-[16px] text-gray-900 dark:text-white">
              Failed to load events
            </h3>
            <p className="text-[14px] text-gray-500">{error}</p>
          </div>
        ) : events.length > 0 ? (
          <div className="flex flex-col gap-4">
            {events.map((event, i) => (
              <EventCard key={i} {...event} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-[64px] h-[64px] rounded-[18px] bg-gray-100 flex items-center justify-center mb-4">
              <CalendarDays size={28} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-[16px] text-gray-900 dark:text-white mb-2">
              No events yet
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 max-w-[300px]">
              Events you attend will appear here. Check out upcoming events to
              get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
