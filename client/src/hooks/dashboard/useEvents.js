import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

const TYPE_COLOR_MAP = {
  general: "blue",
  event: "teal",
  workshop: "amber",
  webinar: "indigo",
};

function getTypeColor(type) {
  return TYPE_COLOR_MAP[type] || "blue";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function mapActivity(activity, form) {
  const start = form?.startDate;
  const end = form?.endDate;
  const startFmt = formatEventDate(start);
  const endFmt = formatEventDate(end);
  const dateRange = startFmt && endFmt
    ? (startFmt === endFmt ? startFmt : `${startFmt} – ${endFmt}`)
    : startFmt || endFmt || formatDate(activity.createdAt);

  return {
    id: activity._id,
    title: activity.title,
    type: activity.type,
    typeColor: getTypeColor(activity.type),
    content: activity.content,
    location: activity.location,
    speakers: activity.speakers || [],
    date: dateRange,
    status: activity.registrationEnabled !== false ? "Active" : "Completed",
    registrationEnabled: activity.registrationEnabled !== false,
    attendees: 0,
    maxAttendees: form?.maxSubmissions || 0,
    formId: form?._id || null,
    form: form || null,
  };
}

function buildFormData(payload) {
  const fd = new FormData();
  fd.append("title", payload.title || "");
  fd.append("content", payload.content || "");
  fd.append("type", payload.type || "event");
  fd.append("location", payload.location || "");
  fd.append("registrationEnabled", String(payload.registrationEnabled ?? true));
  if (payload.startDate) fd.append("startDate", payload.startDate);
  if (payload.endDate) fd.append("endDate", payload.endDate);
  if (payload.maxSubmissions !== "" && payload.maxSubmissions != null) {
    fd.append("maxSubmissions", String(payload.maxSubmissions));
  }

  // Strip non-serializable fields before sending speakers as JSON
  const speakers = (payload.speakers || []).map((s) => ({
    name: s.name || "",
    title: s.title || "",
    bio: s.bio || "",
    image: s.image || "",
  }));
  fd.append("speakers", JSON.stringify(speakers));

  // Append image files separately, matched by index
  (payload.speakers || []).forEach((s) => {
    if (s.imageFile) {
      fd.append("speakerImages", s.imageFile);
    }
  });

  return fd;
}

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [filter, setFilter] = useState("All");
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
      const forms = Array.isArray(formsRes.data) ? formsRes.data : formsRes.data?.forms || [];

      const formMap = {};
      forms.forEach((f) => {
        if (f.activityID) formMap[f.activityID] = f;
      });

      const mapped = activities.map((a) => mapActivity(a, formMap[a._id]));
      setAllEvents(mapped);
      setEvents(mapped);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (filter === "All") {
      setEvents(allEvents);
    } else {
      setEvents(allEvents.filter((e) => e.status === filter));
    }
  }, [filter, allEvents]);

  const counts = {
    All: allEvents.length,
    Active: allEvents.filter((e) => e.status === "Active").length,
    Completed: allEvents.filter((e) => e.status === "Completed").length,
  };

  const createEvent = async (payload) => {
    const formData = buildFormData(payload);
    const res = await api.post("/activities", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchData();
    return res.data;
  };

  const updateEvent = async (id, payload) => {
    const formData = buildFormData(payload);
    const res = await api.put(`/activities/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchData();
    return res.data;
  };

  const deleteEvent = async (id) => {
    const res = await api.delete(`/activities/${id}`);
    await fetchData();
    return res.data;
  };

  const getEventById = async (id) => {
    const res = await api.get(`/activities/${id}`);
    return res.data;
  };

  return {
    events,
    filter,
    setFilter,
    counts,
    totalCount: allEvents.length,
    loading,
    error,
    refetch: fetchData,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
  };
}