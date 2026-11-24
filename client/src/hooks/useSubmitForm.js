import { useState, useCallback } from "react";
import api from "../utils/api";

/**
 * useSubmitForm
 *
 * Handles submitting a response to a specific form via POST /api/submissions.
 *
 * Backend behavior this hook is built around:
 * - Body: { formId, answers, otherAnswers? } (multipart, files appended by field id)
 * - On success (201): returns { message, ticketCode, data }
 * - On failure the server sends { status, message, code? }. Branch on `code`, not on
 *   the message text:
 *     - "ALREADY_SUBMITTED"  -> sets `alreadySubmitted`
 *     - "EMAIL_HAS_ACCOUNT"  -> sets `emailHasAccount` so the UI can offer a log-in link
 *     - "NAME_REQUIRED" / "EMAIL_REQUIRED" / "EMAIL_INVALID" -> shown inline
 *   Anything else falls back to `error` with the server's message.
 *
 * Usage:
 *   const { submit, loading, error, alreadySubmitted, emailHasAccount, ticketCode, reset } = useSubmitForm();
 */
export function useSubmitForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [emailHasAccount, setEmailHasAccount] = useState(false);
  const [ticketCode, setTicketCode] = useState(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setAlreadySubmitted(false);
    setEmailHasAccount(false);
    setTicketCode(null);
  }, []);

  const submit = useCallback(async (formId, answers, files = {}, otherAnswers = {}) => {
    setLoading(true);
    setError(null);
    setAlreadySubmitted(false);
    setEmailHasAccount(false);

    try {
      // Use the same base URL as the rest of the app (falls back to the local
      // backend in dev), otherwise the fetch hits the front-end origin and gets
      // an empty/HTML response instead of the API.
      const baseUrl = api.defaults.baseURL || "";
      const formData = new FormData();
      formData.append("formId", formId);
      formData.append("answers", JSON.stringify(answers));
      // The free text behind an "Other" choice, sent beside the answers rather
      // than inside them: an answer has to stay one of the field's declared
      // options, and the server rejects anything else.
      if (Object.keys(otherAnswers).length > 0) {
        formData.append("otherAnswers", JSON.stringify(otherAnswers));
      }
      Object.entries(files).forEach(([fieldId, file]) => {
        formData.append(fieldId, file);
      });

      const response = await fetch(`${baseUrl}/submissions`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      // Some error responses can be empty or non-JSON — guard against
      // "Unexpected end of JSON input" by reading text and parsing defensively.
      const text = await response.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        if (data?.code === "ALREADY_SUBMITTED") {
          setAlreadySubmitted(true);
        } else if (data?.code === "EMAIL_HAS_ACCOUNT") {
          // The email already belongs to an account — surface the server message
          // and let the page render a link to the login screen.
          setError(data?.message || "An account is already associated with this email address.");
          setEmailHasAccount(true);
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
    emailHasAccount,
    ticketCode,
    reset,
    setAlreadySubmitted,
  };
}
