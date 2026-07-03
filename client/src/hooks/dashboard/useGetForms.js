import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/api";

export function useForms() {
  const { pathname } = useLocation();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchForms = async () => {
      try {
        const response = await api.get("/form");
        const data = response.data;
        const formsData = (data.forms || []).map((form) => ({
          id: form._id,
          title: form.title,
          responses: form.responses ?? 0,
          createdAt: form.createdAt
            ? new Date(form.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "",
          isOpen: form.status === "Active",
        }));
        setForms(formsData);
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchForms();
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
    setForms((prev) =>
      prev.map((form) =>
        form.id === id ? { ...form, isOpen: !form.isOpen } : form
      )
    );
    try {
      await api.put(`/form/${id}/toggle`);
    } catch (error) {
      console.error("Error toggling form status:", error);
    }
  };

  const openCount = forms.filter((f) => f.isOpen).length;
  const closedCount = forms.filter((f) => !f.isOpen).length;
  const totalResponses = forms.reduce((sum, f) => sum + f.responses, 0);

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
