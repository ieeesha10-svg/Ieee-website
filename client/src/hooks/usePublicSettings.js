// usePublicSettings: the site-wide switches a visitor needs to know about.
//
// The sign-up page reads `registrationOpen` and the committees page reads
// `committeeApplicationsOpen`, so both come from one request against a single
// public endpoint. The server enforces both regardless of what this returns —
// this only decides what the page tells the visitor up front.
import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

export function usePublicSettings() {
  // null until the answer arrives, so a page can wait rather than show the
  // wrong state and then correct itself.
  const [settings, setSettings] = useState({
    registrationOpen: null,
    committeeApplicationsOpen: null,
  });
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/settings/public");
      setSettings({
        registrationOpen: data?.registrationOpen !== false,
        committeeApplicationsOpen: data?.committeeApplicationsOpen !== false,
      });
    } catch {
      // If the status cannot be read, leave everything as it was rather than
      // inventing a state. The server still refuses a closed request, so the
      // worst case is the visitor finding out after submitting.
      setSettings({
        registrationOpen: true,
        committeeApplicationsOpen: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(refetch, 0);

    return () => clearTimeout(timeoutId);
  }, [refetch]);

  return {
    registrationOpen: settings.registrationOpen,
    committeeApplicationsOpen: settings.committeeApplicationsOpen,
    loading,
    refetch,
  };
}
