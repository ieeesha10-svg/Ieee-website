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
      } catch (error) {
        console.error("Error fetching email logs:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchEmailLogs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [page, search, statusFilter]);
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
  };
}
