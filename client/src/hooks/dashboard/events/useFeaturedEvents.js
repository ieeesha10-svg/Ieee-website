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

  /**
   * `includeHidden` defaults to false, and that default is load-bearing.
   *
   * This hook is used by both the dashboard (FeaturedEvents page) and the public
   * home page (FlagshipEvents), which import it from the dashboard folder purely
   * because it already held the mapping logic. The server treats the request as
   * "public" unless it explicitly asks for unpublished activities, so the home
   * page gets the strict list for free - as long as nobody here starts passing
   * includeHidden: true unconditionally.
   */
  export function useFeaturedEvents({ includeHidden = false } = {}) {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const [featuredRes, formsRes] = await Promise.all([
          api.get("/activities/featured", {
            params: includeHidden ? { includeHidden: true } : undefined,
          }),
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

        // The server already filters, so this is belt-and-braces for the one case
        // the server cannot cover: a payload cached or shaped elsewhere. Skipped
        // when the caller opted into includeHidden, since that caller is the
        // dashboard and drafts are exactly what it needs to see. Lenient
        // (`!== false`) rather than `=== true`, so a response that omits the field
        // entirely does not empty the public section.
        const visible = includeHidden
          ? activities
          : activities.filter((a) => a.showOnSite !== false);

        setFeatured(visible.map((a) => mapActivity(a, formMap[a._id])));
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load featured events");
      } finally {
        setLoading(false);
      }
    }, [includeHidden]);


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
