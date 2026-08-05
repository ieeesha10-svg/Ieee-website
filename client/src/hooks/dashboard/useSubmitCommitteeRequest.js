// useSubmitCommitteeRequest: Submits a committee-change request for the current
// logged-in user (POST /committee-requests). Board/XCom users are auto-accepted
// on the server, so this returns true immediately for them.
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export function useSubmitCommitteeRequest() {
  const [submitting, setSubmitting] = useState(false);

  const submitRequest = useCallback(async (committeePosition) => {
    setSubmitting(true);
    try {
      await api.post("/committee-requests", { committee_position: committeePosition });
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit committee request.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submitting, submitRequest };
}
