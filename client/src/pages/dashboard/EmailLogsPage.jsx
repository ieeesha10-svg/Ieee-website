import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../utils/api";

// ─── Status Badge Component ────────────────────────────────────────────────
function StatusBadge({ status }) {
  const statusConfig = {
    delivered: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-400/20",
      label: "Delivered",
    },
    failed: {
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-400/20",
      label: "Failed",
    },
    pending: {
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-400/20",
      label: "Pending",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bgColor} ${config.color} ${config.borderColor}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// ─── Filter Chip Component ─────────────────────────────────────────────────
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-primary text-white shadow-md"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function EmailLogsPage() {
  // ─── State ───────────────────────────────────────────────────────────────
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const itemsPerPage = 10;

  // ─── API Call ─────────────────────────────────────────────────────────────
  const fetchEmailLogs = async (
    page = 1,
    search = searchQuery,
    status = statusFilter,
  ) => {
    setLoading(true);
    try {
      // بناء الـ URL بناءً على الفلاتر
      let url = `/emails/logs?page=${page}&limit=${itemsPerPage}`;

      if (search) {
        url += `&search=${search}`;
      }

      if (status !== "all") {
        // تحويل الـ Status للي الباك إند بيفهمه (حسب صورة البوستمان القديمة)
        const backendStatus =
          status === "delivered"
            ? "Done"
            : status === "failed"
              ? "Failed"
              : status;
        url += `&status=${backendStatus}`;
      }

      const response = await api.get(url);

      // Map API response to component structure
      const mappedLogs = response.data.data.map((log) => {
        let uiStatus = "pending";
        if (log.status === "Done" || log.status === "delivered")
          uiStatus = "delivered";
        else if (log.status === "Failed" || log.status === "failed")
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
      setPagination(response.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching email logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch on Mount & Filter Change ──────────────────────────────────────
  useEffect(() => {
    // استخدمنا setTimeout عشان نعمل Debounce للبحث (نستنى نص ثانية بعد ما اليوزر يكتب)
    const timeoutId = setTimeout(() => {
      fetchEmailLogs(1, searchQuery, statusFilter);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter]); // هيشتغل كل ما البحث أو الفلتر يتغير

  // ─── Export CSV ─────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    // TODO: Implement CSV export logic
    console.log("Exporting CSV...");
  };

  // حساب أرقام الـ Pagination للـ UI
  const startIndex = (currentPage - 1) * itemsPerPage;
  const totalItems = pagination.totalItems || 0;
  const totalPages = pagination.totalPages || 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1117] p-4 md:p-6">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Email Logs
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Full delivery log for all outbound broadcast emails
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchEmailLogs(currentPage)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* ─── Filters & Search ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6 shadow-sm">
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Filter size={16} />
              Status:
            </span>
            <FilterChip
              label="All"
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            />
            <FilterChip
              label="Delivered"
              active={statusFilter === "delivered"}
              onClick={() => setStatusFilter("delivered")}
            />
            <FilterChip
              label="Failed"
              active={statusFilter === "failed"}
              onClick={() => setStatusFilter("failed")}
            />
            <FilterChip
              label="Pending"
              active={statusFilter === "pending"}
              onClick={() => setStatusFilter("pending")}
            />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by recipient, subject, or log ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark"
            />
          </div>
        </div>

        {/* ─── Table ───────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    LOG ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    RECIPIENT EMAIL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    SUBJECT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    DATE & TIME
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {log.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {log.recipientEmail}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {log.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {log.date} · {log.time}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={log.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      No email logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ─── Pagination ─────────────────────────────────────────────────── */}
          {logs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, totalItems)} of{" "}
                {totalItems} entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchEmailLogs(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Logic to show pages around current page could be added here for large datasets
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchEmailLogs(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-primary text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() =>
                    fetchEmailLogs(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
