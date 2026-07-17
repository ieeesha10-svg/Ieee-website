import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../../../utils/api";

export function useForms() {
  const { pathname } = useLocation();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResponses, setTotalResponses] = useState(0);

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
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTotalResponses = useCallback(async () => {
    try {
      const res = await api.get("/submissions");
      setTotalResponses(res.data.totalCount ?? 0);
    } catch {
      // fallback to 0
    }
  }, []);

  useEffect(() => {
    fetchForms();
    fetchTotalResponses();
  }, [pathname, fetchForms, fetchTotalResponses]);

  const openCount = forms.filter((f) => f.isOpen).length;
  const closedCount = forms.filter((f) => !f.isOpen).length;

  return {
    forms,
    isLoading,
    openCount,
    closedCount,
    totalResponses,
    totalCount: forms.length,
    refetch: fetchForms,
  };
}
