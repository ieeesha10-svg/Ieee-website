import React, { useState } from "react";
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
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { useEmailLogs } from "../../hooks/dashboard/useEmailLogs";
import api from "../../utils/api";

// Components (StatusBadge & FilterChip)
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

// Main Component
export default function EmailLogsPage() {
  const {
    logs,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    pagination,
  } = useEmailLogs();

  const [exporting, setExporting] = useState(false);

  // Export CSV (بنفس منطق DashboardMembers)
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "1000");
      if (search) params.set("search", search);
      if (statusFilter !== "all") {
        const backendStatus =
          statusFilter === "delivered"
            ? "Done"
            : statusFilter === "failed"
              ? "(Rejected|Not email)"
              : statusFilter;
        params.set("status", backendStatus);
      }

      const res = await api.get(`/emails/logs?${params.toString()}`);
      const dataToExport = res.data.data || [];

      const headers = [
        "Log ID",
        "Recipient Email",
        "Subject",
        "Date",
        "Status",
      ];
      const rows = dataToExport.map((log) => [
        log._id || "",
        log.email || "",
        log.subject || "",
        new Date(log.sentAt).toLocaleString(),
        log.status || "pending",
      ]);

      const csv = [
        headers.join(","),
        ...rows.map((r) =>
          r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `email-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      // رسالة النجاح لليوزر
      toast.success("Email logs exported successfully!");
    } catch {
      // رسالة الخطأ لليوزر
      toast.error("Failed to export data. Please check your connection.");
    } finally {
      setExporting(false);
    }
  };

  // حساب أرقام العرض
  const startIndex = (page - 1) * pagination.limit;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1117] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              onClick={() => {
                // Refresh by triggering page change or search re-eval
                setPage(page);
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {exporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Filter size={16} />
              Status:
            </span>
            {["all", "delivered", "failed", "pending"].map((status) => (
              <FilterChip
                key={status}
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                active={statusFilter === status}
                onClick={() => setStatusFilter(status)}
              />
            ))}
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by recipient, subject, or log ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark"
            />
          </div>
        </div>

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
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Loading logs...
                      </div>
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
                      No email logs found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {logs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1}-
                {Math.min(startIndex + pagination.limit, pagination.totalItems)}{" "}
                of {pagination.totalItems} entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(pagination.totalPages, 5) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            page === pageNum
                              ? "bg-primary text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
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
