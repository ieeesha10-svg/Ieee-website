import { useState, useEffect } from "react";
import api from "../utils/api";

export function usePublicForm(formId) {
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!formId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const fetchForm = async () => {
      try {
        const response = await api.get(`/form/${formId}`);
        setForm(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load form"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  return { form, isLoading, error };
}
