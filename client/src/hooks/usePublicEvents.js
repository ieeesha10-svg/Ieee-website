import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import imgAiLaptop from "../assets/images/events/ai-laptop.jpg";
import imgEventsHero from "../assets/images/events/events-hero.jpg";
import imgMeeting from "../assets/images/events/meeting.png";
import imgRegistration from "../assets/images/events/registration.jpg";
import imgTable from "../assets/images/events/table.jpg";
import imgTeam from "../assets/images/events/team.jpg";
import imgWorkplace from "../assets/images/events/workplace.jpg";

const EVENT_IMAGES = [
  imgAiLaptop,
  imgEventsHero,
  imgMeeting,
  imgRegistration,
  imgTable,
  imgTeam,
  imgWorkplace,
];

function pickImageForActivity(id) {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return EVENT_IMAGES[Math.abs(hash) % EVENT_IMAGES.length];
}

function formatEventDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function mapActivity(activity, form) {
  const start = form?.startDate;
  const end = form?.endDate;
  const startFmt = formatEventDate(start);
  const endFmt = formatEventDate(end);
  const dateRange =
    startFmt && endFmt
      ? startFmt === endFmt
        ? startFmt
        : `${startFmt} – ${endFmt}`
      : startFmt || endFmt || "";

  const startTime = formatTime(start);
  const endTime = formatTime(end);
  const timeRange =
    startTime && endTime
      ? startTime === endTime
        ? startTime
        : `${startTime} – ${endTime}`
      : startTime || "";

  const isActive = activity.registrationEnabled !== false;
  const isPast = end ? new Date(end) < new Date() : false;

  return {
    id: activity._id,
    title: activity.title,
    type: activity.type,
    badge: activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1) || "Event",
    content: activity.content,
    location: activity.location,
    speakers: activity.speakers || [],
    image: activity.image || pickImageForActivity(activity._id),
    date: dateRange,
    dateTime: { day: dateRange, time: timeRange },
    status: isPast ? "Completed" : isActive ? "Active" : "Completed",
    description: activity.content,
    attendees: 0,
    maxAttendees: form?.maxSubmissions || 0,
    formId: form?._id || null,
    form: form || null,
  };
}

export function usePublicEvents() {
  const [upcoming, setUpcoming] = useState([]);
  const [previous, setPrevious] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [activitiesRes, formsRes] = await Promise.all([
        api.get("/activities"),
        api.get("/form").catch(() => ({ data: [] })),
      ]);

      const activities = activitiesRes.data.activities || [];
      const forms = Array.isArray(formsRes.data)
        ? formsRes.data
        : formsRes.data?.forms || [];

      const formMap = {};
      forms.forEach((f) => {
        if (f.activityID) formMap[f.activityID] = f;
      });

      const mapped = activities.map((a) => mapActivity(a, formMap[a._id]));

      setUpcoming(mapped.filter((e) => e.status === "Active"));
      setPrevious(mapped.filter((e) => e.status === "Completed"));
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { upcoming, previous, loading, error, refetch: fetchData };
}
