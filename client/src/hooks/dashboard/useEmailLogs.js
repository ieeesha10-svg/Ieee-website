import { useState, useEffect } from "react";
import api from "../../utils/api";

export function useEmailLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // States للـ Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    limit: 10,
  });
  // Email Logs - Status Counts Feature
// Store the total number of emails for each status.
// Initial values are 0 until the API returns the actual counts.
const [statusCounts, setStatusCounts] = useState({
  all: 0,
  delivered: 0,
  failed: 0,
  pending: 0,
});

// Controls when email logs need to be fetched again.
const [refreshKey, setRefreshKey] = useState(0);

  // لما الفلتر أو البحث يتغير، بنرجع للصفحة الأولى
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const fetchEmailLogs = async () => {
      setLoading(true);
      try {
        let url = `/emails/logs?page=${page}&limit=${pagination.limit}`;

        if (search) {
          url += `&search=${search}`;
        }

        if (statusFilter !== "all") {
          const backendStatus =
            statusFilter === "delivered"
              ? "Done"
              : statusFilter === "failed"
                ? "(Rejected|Not email)"
                : statusFilter;
          url += `&status=${backendStatus}`;
        }

        const response = await api.get(url);

        // عمل Map للداتا عشان تناسب الفرونت إند
        const mappedLogs = response.data.data.map((log) => {
          let uiStatus = "pending";
          if (log.status === "Done" || log.status === "delivered")
            uiStatus = "delivered";
          else if (log.status === "Failed" || log.status === "failed" || log.status === "Rejected" || log.status === "Not email")
            uiStatus = "failed";

          return {
            id: log._id,
            recipientEmail: log.email,
            subject: log.subject,
            messageBody: log.messageBody,
            date: new Date(log.sentAt).toLocaleDateString(),
            time: new Date(log.sentAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: uiStatus,
          };
        });

        setLogs(mappedLogs);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.pagination.totalItems || 0,
          totalPages: response.data.pagination.totalPages || 1,
        }));
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchEmailLogs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [page, search, statusFilter, refreshKey]);

// Email Logs - Fetch Status Counts
// Fetch the total count for each email status from the backend.
// Counts are updated whenever a refresh is triggered.
// 
  useEffect(() => {
  const fetchStatusCounts = async () => {
    try {
      const statuses = {
        all: null,
        delivered: "Done",
        failed: "(Rejected|Not email)",
        pending: "pending",
      };

      const results = await Promise.all(
        Object.entries(statuses).map(async ([key, value]) => {
          const params = new URLSearchParams({
            page: "1",
            limit: "1",
          });

          if (value) {
            params.set("status", value);
          }

      
          const response = await api.get(
            `/emails/logs?${params.toString()}`
          );

          return [
            key,
            response.data.pagination.totalItems ?? 0,
          ];
        })
      );

      setStatusCounts(Object.fromEntries(results));
    } catch (error) {
      console.error("Failed to fetch status counts:", error);
    }
  };

  fetchStatusCounts();
}, [refreshKey]);
// Refresh email logs and status counts.
const refreshLogs = () => {
  setRefreshKey((prev) => prev + 1);
};
 return {
  logs,
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  page,
  setPage,
  pagination,
  statusCounts,
  refreshLogs,
};
}
