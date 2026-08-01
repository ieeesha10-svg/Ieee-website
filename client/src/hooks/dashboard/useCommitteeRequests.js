import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export function useCommitteeRequests({ pageSize = 10 } = {}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/committee-requests?status=pending&page=${page}&limit=${pageSize}`,
      );

      const data = res.data?.data || [];
      setRequests(
        data.map((r) => ({
          id: r._id,
          user: {
            id: r.userId?._id,
            name: r.userId?.name || "Unknown",
            email: r.userId?.email || "",
            university: r.userId?.university || "",
            college: r.userId?.college || "",
          },
          committee: r.committee_position,
          status: r.request_status,
          createdAt: r.createdAt,
        })),
      );
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalCount(res.data?.pagination?.totalItems || data.length);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load committee requests");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRequests();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchRequests]);

  const processRequest = useCallback(
    async (requestId, status) => {
      setProcessingId(requestId);
      try {
        await api.put(`/committee-requests/${requestId}/status`, { status });
        toast.success(`Request ${status} successfully`);
        await fetchRequests();
      } catch (err) {
        toast.error(err.response?.data?.message || `Failed to ${status} request`);
      } finally {
        setProcessingId(null);
      }
    },
    [fetchRequests],
  );

  return {
    requests,
    loading,
    page,
    setPage,
    totalPages,
    totalCount,
    refetch: fetchRequests,
    processRequest,
    processingId,
  };
}
