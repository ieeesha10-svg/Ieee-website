import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

export function useFormSubmissions(formId) {
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  // The form itself comes back on this same call: the page needs `type` to know
  // whether attendance applies, and `fields` to label the answers. Both used to
  // come from router state, which is lost on a refresh or a shared link, so a
  // reloaded page fell back to raw field ids as question labels.
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    if (!formId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/submissions/form/${formId}`);
      setSubmissions(response.data.submissions || []);
      setTotal(response.data.total ?? 0);
      setForm(response.data.form || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load submissions"
      );
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const toggleAttendance = async (submissionId, currentStatus) => {
    const nextStatus = !currentStatus;
    setUpdatingId(submissionId);
    try {
      const response = await api.patch(`/submissions/${submissionId}/attendance`, {
        attended: nextStatus,
      });
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub._id === submissionId
            ? {
                ...sub,
                attended: nextStatus,
                attendedAt: nextStatus ? (sub.attendedAt || new Date().toISOString()) : null,
              }
            : sub
        )
      );
      return { success: true, attended: nextStatus, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update attendance";
      return { success: false, message };
    } finally {
      setUpdatingId(null);
    }
  };

  return {
    submissions,
    setSubmissions,
    total,
    form,
    isLoading,
    error,
    toggleAttendance,
    updatingId,
    refetch: fetchSubmissions,
  };
}
