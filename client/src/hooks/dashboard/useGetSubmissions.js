import { useState, useEffect } from "react";
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
        setForm(response.data.form || null);
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

  return { submissions, total, form, isLoading, error };
}
