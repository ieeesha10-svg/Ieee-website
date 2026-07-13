import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Clock,
  Heart,
  Loader2,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import api from "../../utils/api";

function TypeBadge({ type }) {
  // Adjusted colors to match the design badges (Technical, AI / ML, Branch Event)
  const styles = {
    Technical: "bg-[#F0F7FF] text-[#007BFF]",
    "AI / ML": "bg-[#F8F0FF] text-[#A855F7]",
    "Branch Event": "bg-[#F0FFF4] text-[#1BCC6E]",
    Default: "bg-gray-100 text-gray-600",
  };

  const badgeStyle = styles[type] || styles.Default;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold mt-2 ${badgeStyle}`}
    >
      {type}
    </span>
  );
}

function EventCard({ title, dateObj, location, time, type, colorTheme }) {
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
        <h4 className="font-bold text-[16px] text-[#111827] mb-1">{title}</h4>

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

      {/* Heart Icon */}
      <button className="self-start mt-2 mr-2">
        <Heart size={20} className="text-[#FF4757] fill-[#FF4757]" />
      </button>
    </div>
  );
}

export default function AttendedEvents() {
  const { userData } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/users/${userData._id}/events`);
        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.events || [];

        const mappedEvents = data.map((item, index) => {
          // Fallback to item.formId if the backend populates it, otherwise item.event or item
          const evt = item.formId || item.event || item;
          // Alternate colors for the date box to match the design variation
          const themes = ["blue", "purple", "green"];

          return {
            title: evt.title || evt.name || "Untitled Event",
            dateObj: evt.startDate ? new Date(evt.startDate) : (evt.date ? new Date(evt.date) : new Date(item.createdAt || new Date())),
            time: evt.time || "Time N/A",
            location: evt.location || "Location N/A",
            type: evt.type || "Technical",
            colorTheme: themes[index % themes.length],
          };
        });
        setEvents(mappedEvents);
      } catch (err) {
        console.error("Error fetching attended events:", err);
        setError("Failed to load attended events.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
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
