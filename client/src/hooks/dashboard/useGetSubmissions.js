import { useState, useEffect } from "react";
import api from "../../utils/api";

export function useFormSubmissions(formId) {
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!formId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const fetchSubmissions = async () => {
      try {
        const response = await api.get(`/submissions/form/${formId}`);
        setSubmissions(response.data.submissions || []);
        setTotal(response.data.total ?? 0);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load submissions"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [formId]);

  return { submissions, total, isLoading, error };
}
