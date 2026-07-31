import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../../../utils/api";

export function useForms() {
  const { pathname } = useLocation();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchForms = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/form");
      const data = response.data;
      const formsData = await Promise.all(
        (data.forms || []).map(async (form) => {
          let title = form.title;

          if (form.activityID) {
            try {
              const activityRes = await api.get(
                `/activities/${form.activityID}`
              );
              const activity = activityRes.data.activity;
              if (activity?.title) title = activity.title;
            } catch {
              // fallback to form.title
            }
          }

          let responses = 0;
          try {
            const subRes = await api.get(`/submissions/form/${form._id}`);
            responses = subRes.data.total ?? 0;
          } catch {
            // fallback to 0
          }

          return {
            id: form._id,
            activityID: form.activityID,
            title: form.activityID ? "'" + title + "' Event Form" : title,
            responses,
            fields: form.fields || [],
            startDate: form.startDate,
            endDate: form.endDate,
            maxSubmissions: form.maxSubmissions,
            description: form.description,
            formType: form.type,
            createdAtRaw: form.createdAt,
            updatedAt: form.updatedAt,
            createdAt: form.createdAt
              ? new Date(form.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "",
            isOpen: form.status === "Active",
          };
        })
      );
      setForms(formsData);

      // Auto-close forms whose endDate has passed
      const expired = formsData.filter(f => f.isOpen && f.endDate && new Date(f.endDate) < new Date());
      if (expired.length > 0) {
        await Promise.allSettled(
          expired.map(f =>
            api.put(`/form/${f.id}/toggle`).catch(() => {})
          )
        );
        setForms(prev => prev.map(f =>
          expired.some(e => e.id === f.id) ? { ...f, isOpen: false } : f
        ));
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [pathname, fetchForms]);

  const openCount = forms.filter((f) => f.isOpen).length;
  const closedCount = forms.filter((f) => !f.isOpen).length;

  return {
    forms,
    setForms,
    isLoading,
    openCount,
    closedCount,
    totalCount: forms.length,
    refetch: fetchForms,
  };
}
