import { useState, useEffect, useCallback } from "react";
import api from "../../../utils/api";
import { mapActivity } from "./eventUtils";

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 10 });
  const limit = 9;

  const fetchData = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const [activitiesRes, formsRes] = await Promise.all([
        api.get("/activities", { params: { page: pageNum, limit } }),
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
      setPagination(activitiesRes.data.pagination || { totalItems: 0, totalPages: 1, currentPage: pageNum, itemsPerPage: limit });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

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

  return {
    events,
    filter,
    setFilter,
    counts,
    totalCount: allEvents.length,
    loading,
    error,
    page,
    setPage,
    pagination,
    refetch: fetchData,
  };
}
