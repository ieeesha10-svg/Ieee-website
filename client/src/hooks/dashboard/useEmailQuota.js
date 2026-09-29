// useEmailQuota: how many transactional emails are left in the Brevo allowance.
//
// This is a readout, not a control. The number comes straight from Brevo, which
// is the only authority on what is left - counting our own emaillogs would miss
// anything sent outside the app (or by a test) and would look authoritative
// while being wrong.
//
// Failure is a first-class state rather than an error: a Brevo outage must not
// put a red toast on the settings page, and the bar must never render a
// fabricated number. `available: false` is shown as "could not read" instead.
import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

export function useEmailQuota() {
  const [quota, setQuota] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/emails/quota");
      setQuota(data?.data ?? null);
    } catch (err) {
      // Kept out of toast.error on purpose: this is background information in
      // a corner of the settings page, and a Brevo outage would otherwise
      // greet every admin with a scary toast on every page load.
      setError(
        err.response?.data?.message || "Could not read the Brevo allowance."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(refetch, 0);

    return () => clearTimeout(timeoutId);
  }, [refetch]);

  return { quota, isLoading, error, refetch };
}
