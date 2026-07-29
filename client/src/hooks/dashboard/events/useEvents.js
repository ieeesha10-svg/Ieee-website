import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../../utils/api";
import { mapActivity } from "../../../utils/eventUtils";

export function useEvents() {
  const [allEvents, setAllEvents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 9;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [activitiesRes, formsRes] = await Promise.all([
        api.get("/activities", { params: { page: 1, limit: 1000 } }),
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
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEvents = useMemo(
    () => (filter === "All" ? allEvents : allEvents.filter((e) => e.status === filter)),
    [allEvents, filter]
  );

  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const safePage = Math.min(page, totalPages);

  const events = useMemo(
    () => filteredEvents.slice((safePage - 1) * limit, safePage * limit),
    [filteredEvents, safePage, limit]
  );

  const counts = useMemo(
    () => ({
      All: allEvents.length,
      Active: allEvents.filter((e) => e.status === "Active").length,
      Completed: allEvents.filter((e) => e.status === "Completed").length,
    }),
    [allEvents]
  );

  return {
    allEvents,
    paginatedEvents: events,
    statusFilter: filter,
    setFilter: (f) => { setFilter(f); setPage(1); },
    counts,
    loading,
    error,
    page: safePage,
    setPage: (p) => setPage(p),
    pagination: {
      totalItems,
      totalPages,
      currentPage: safePage,
      itemsPerPage: limit,
    },
    refetch: fetchData,
  };
}
