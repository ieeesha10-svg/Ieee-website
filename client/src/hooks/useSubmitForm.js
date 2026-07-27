import { useState, useCallback } from "react";

/**
 * useSubmitForm
 *
 * Handles submitting a response to a specific form via POST /api/submissions.
 *
 * Backend behavior this hook is built around:
 * - Body: { formId, answers }
 * - On success (201): returns { message, ticketCode }
 * - On failure (400) if already submitted: { status: "error", message: "You already submitted this form" }
 * - Other 400s (e.g. deadline passed, maxSubmissions reached) return a generic message too —
 *   surfaced via `error` for the UI to display.
 *
 * Usage:
 *   const { submit, loading, error, alreadySubmitted, ticketCode, reset } = useSubmitForm();
 *
 *   const handleSubmit = async () => {
 *     const result = await submit(formId, answers, files);
 *     if (result) {
 *       // result.ticketCode is available here too, in addition to hook state
 *     }
 *   };
 */
export function useSubmitForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [ticketCode, setTicketCode] = useState(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setAlreadySubmitted(false);
    setTicketCode(null);
  }, []);

  const submit = useCallback(async (formId, answers, files = {}) => {
    setLoading(true);
    setError(null);
    setAlreadySubmitted(false);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const formData = new FormData();
      formData.append("formId", formId);
      formData.append("answers", JSON.stringify(answers));
      Object.entries(files).forEach(([fieldId, file]) => {
        formData.append(fieldId, file);
      });

      const response = await fetch(`${apiUrl}/submissions`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Fragile: relies on exact string match of the backend's message.
        // If the backend team adds a structured error code later, replace this
        // check with e.g. data.code === "DUPLICATE_SUBMISSION".
        if (data?.message === "You already submitted this form") {
          setAlreadySubmitted(true);
        } else {
          setError(data?.message || "Something went wrong while submitting the form.");
        }
        setLoading(false);
        return null;
      }

      setTicketCode(data.ticketCode);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || "Network error while submitting the form.");
      setLoading(false);
      return null;
    }
  }, []);

  return {
    submit,
    loading,
    error,
    alreadySubmitted,
    ticketCode,
    reset,
    setAlreadySubmitted,
  };
}
