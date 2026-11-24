import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

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
      badge:
        activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1) ||
        "Event",
      content: activity.content,
      location: activity.location,
      speakers: activity.speakers || [],
      image: activity.coverImage || "",
      date: dateRange,
      dateTime: { day: dateRange, time: timeRange },
      status: isPast ? "Completed" : isActive ? "Active" : "Completed",
      description: activity.description,
      // Carried so a consumer can filter defensively. The server is the real gate
      // (it answers `showOnSite === true` only); this is belt-and-braces.
      showOnSite: activity.showOnSite === true,
      // Raw ISO dates, because the formatted `date` above ("Oct 5 – Oct 7", or a
      // year-less "Oct 5") is for display and cannot be sorted on. Picking the
      // most recent past event needs a real comparison.
      startDateISO: start || null,
      endDateISO: end || null,
      attendees: 0,
      maxAttendees: form?.maxSubmissions || 0,
      formId: form?._id || null,
      form: form || null,
    };
  }


  export function usePublicEvents({ maxPages = null } = {}) {
    const [upcoming, setUpcoming] = useState([]);
    const [previous, setPrevious] = useState([]);
    // The one event a hero should feature, and which of the three states produced
    // it: an event still to come, the most recent one already held, or nothing
    // published at all.
    const [heroEvent, setHeroEvent] = useState(null);
    const [heroStatus, setHeroStatus] = useState("none");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [firstPageRes, formsRes] = await Promise.all([
        api.get("/activities?page=1&limit=10"),
        api.get("/form").catch(() => ({ data: [] })),
      ]);

      const { totalPages } = firstPageRes.data.pagination;
      const pagesToFetch = maxPages ? Math.min(maxPages, totalPages) : totalPages;
      let allActivities = firstPageRes.data.activities || [];

      for (let p = 2; p <= pagesToFetch; p++) {
        const res = await api.get(`/activities?page=${p}&limit=10`);
        allActivities = [...allActivities, ...(res.data.activities || [])];
      }

      const forms = Array.isArray(formsRes.data)
        ? formsRes.data
        : formsRes.data?.forms || [];

      const formMap = {};
      forms.forEach((f) => {
        if (f.activityID) formMap[f.activityID] = f;
      });

        const mapped = allActivities.map((a) => mapActivity(a, formMap[a._id]));

        // Defence in depth. The server only ever answers with published
        // activities here, and this hook never asks for the hidden ones, so in
        // practice nothing is dropped by this line - it is here so that a future
        // change to either side cannot quietly surface a draft on the public
        // events page or the home page.
        const published = mapped.filter((e) => e.showOnSite !== false);

        const active = published.filter((e) => e.status === "Active");
        const completed = published.filter((e) => e.status === "Completed");

        setUpcoming(active);
        setPrevious(completed);

        // What the hero card should show. The rule lives here rather than in each
        // page because there are two of them (/events and the home page) and they
        // used to disagree: the events page showed nothing once every event had
        // ended, while the home page fell back to previous[0] - which is the
        // *oldest* past event, not the most recent, because the server returns
        // activities in insertion order.
        //
        // Both halves are chosen by date, not by position in the array. The server
        // hands them back in insertion order, so `active[0]` was the earliest
        // event ever *created*, which is not the same as the next one due to run.
        const when = (e) => new Date(e.startDateISO || e.endDateISO || 0).getTime();
        const [nextUp] = [...active].sort((a, b) => when(a) - when(b));
        const [latestCompleted] = [...completed].sort((a, b) => when(b) - when(a));

        setHeroEvent(nextUp ?? latestCompleted ?? null);
        setHeroStatus(nextUp ? "upcoming" : latestCompleted ? "latest" : "none");

    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load events",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

    return { upcoming, previous, heroEvent, heroStatus, loading, error, refetch: fetchData };
  }

