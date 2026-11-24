// useReviewCommitteeRequests: Loads one paginated bucket of committee requests
// (pending, approved or rejected) with the requesting user's info, and lets
// admins approve/reject a pending one via processRequest, refetching after the
// decision. The reviewedBy/reviewedAt pair rides along so the Approved and
// Rejected tabs can say who decided the request and when.
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { PENDING_COUNT_EVENT } from "./usePendingCommitteeRequestCount";

const DECIDED = new Set(["approved", "rejected"]);

export function useReviewCommitteeRequests({ status = "pending", pageSize = 10 } = {}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [processingId, setProcessingId] = useState(null);

  const isDecided = DECIDED.has(status);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/committee-requests?status=${status}&page=${page}&limit=${pageSize}`,
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
          // Null until decided, and null again if the reviewing admin's account
          // was later removed — the UI falls back to "—" for that case.
          reviewer: r.reviewedBy
            ? {
                id: r.reviewedBy._id,
                name: r.reviewedBy.name || "Unknown",
                email: r.reviewedBy.email || "",
                role: r.reviewedBy.role || "",
              }
            : null,
          reviewedAt: r.reviewedAt || null,
        })),
      );
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalCount(res.data?.pagination?.totalItems || data.length);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load committee requests");
    } finally {
      setLoading(false);
    }
  }, [status, page, pageSize]);

  // Switching bucket invalidates the current page number, so it goes back to 1.
  // This is done while rendering rather than in an effect: it is a plain state
  // adjustment off a prop change, and doing it in an effect would fetch page 3
  // of the old bucket first and then correct itself.
  const [lastStatus, setLastStatus] = useState(status);
  if (lastStatus !== status) {
    setLastStatus(status);
    setPage(1);
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRequests();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchRequests]);

  const processRequest = useCallback(
    async (requestId, newStatus) => {
      setProcessingId(requestId);
      try {
        await api.put(`/committee-requests/${requestId}/status`, { status: newStatus });
        toast.success(`Request ${newStatus} successfully`);
        await fetchRequests();
        // The sidebar's notification dot reads a separate count; tell it to
        // re-read rather than making it poll for its own answer.
        window.dispatchEvent(new Event(PENDING_COUNT_EVENT));
      } catch (err) {
        toast.error(err.response?.data?.message || `Failed to ${newStatus} request`);
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
    isDecided,
  };
}
