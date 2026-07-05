import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/api";

export function useForms() {
  const { pathname } = useLocation();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResponses, setTotalResponses] = useState(0);

  useEffect(() => {
    setIsLoading(true);

    const fetchForms = async () => {
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
                // fallback to form.title or "Untitled Form"
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
    };

    const fetchTotalResponses = async () => {
      try {
        const res = await api.get("/submissions");
        setTotalResponses(res.data.totalCount ?? 0);
      } catch {
        // fallback to 0
      }
    };

    fetchForms();
    fetchTotalResponses();
  }, [pathname]);

  const deleteForm = async (id) => {
    const form = forms.find((f) => f.id === id);
    try {
      await api.delete(`/form/${id}`);
      setForms((prev) => prev.filter((f) => f.id !== id));
      toast.success(`"${form?.title || "Form"}" form is now deleted`);
    } catch (error) {
      console.error("Error deleting form:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete form";
      toast.error(msg);
    }
  };

  const toggleFormStatus = async (id) => {
    const form = forms.find((f) => f.id === id);
    const becomingOpen = !form?.isOpen;

    setForms((prev) =>
      prev.map((form) =>
        form.id === id ? { ...form, isOpen: becomingOpen } : form
      )
    );
    try {
      await api.put(`/form/${id}/toggle`);
      toast.success(
        `"${form?.title || "Form"}" is now ${becomingOpen ? "open" : "closed"}`
      );
    } catch (error) {
      console.error("Error toggling form status:", error);
      toast.error("Failed to toggle form status");
    }
  };

  const openCount = forms.filter((f) => f.isOpen).length;
  const closedCount = forms.filter((f) => !f.isOpen).length;

  return {
    forms,
    isLoading,
    toggleFormStatus,
    deleteForm,
    openCount,
    closedCount,
    totalResponses,
    totalCount: forms.length,
  };
}
