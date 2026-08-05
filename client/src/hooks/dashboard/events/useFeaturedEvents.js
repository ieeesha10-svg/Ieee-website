import { useState, useEffect, useCallback } from "react";
import api from "../../../utils/api";

function formatEventDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
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
        : `From ${startFmt} To ${endFmt}`
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
    description: activity.description,
    location: activity.location,
    speakers: activity.speakers || [],
    image: activity.coverImage || "",
    date: dateRange,
    dateTime: { day: dateRange, time: timeRange },
    status: isPast ? "Completed" : isActive ? "Active" : "Completed",
    attendees: 0,
    maxAttendees: form?.maxSubmissions || 0,
    formId: form?._id || null,
    form: form || null,
  };
}

export function useFeaturedEvents() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [featuredRes, formsRes] = await Promise.all([
        api.get("/activities/featured"),
        api.get("/form").catch(() => ({ data: [] })),
      ]);

      const activities = featuredRes.data.activities || [];
      const forms = Array.isArray(formsRes.data)
        ? formsRes.data
        : formsRes.data?.forms || [];

      const formMap = {};
      forms.forEach((f) => {
        if (f.activityID) formMap[f.activityID] = f;
      });

      setFeatured(activities.map((a) => mapActivity(a, formMap[a._id])));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load featured events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { featured, loading, error, refetch: fetchData };
}

export function useAddFeatured(refetch) {
  const addFeatured = async (activityId) => {
    const res = await api.post(`/activities/${activityId}/add-featured`);
    if (refetch) await refetch();
    return res.data;
  };

  return { addFeatured };
}

export function useRemoveFeatured(refetch) {
  const removeFeatured = async (activityId) => {
    const res = await api.delete(`/activities/${activityId}/remove-featured`);
    if (refetch) await refetch();
    return res.data;
  };

  return { removeFeatured };
}

export function useSwapFeatured(refetch) {
  const swapFeatured = async () => {
    const res = await api.post("/activities/swap-featured");
    if (refetch) await refetch();
    return res.data;
  };

  return { swapFeatured };
}
