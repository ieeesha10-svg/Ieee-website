// useSiteSettings: the site-wide switches an admin controls from the settings
// page. Closing either one only stops new activity — sign-in and the review of
// work already submitted are never affected.
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

// Each switch is stored under a different name than its endpoint, so the pair
// is kept together here rather than derived at the call site.
const SWITCHES = {
  registrationOpen: { endpoint: "/settings/registration" },
  committeeApplicationsOpen: { endpoint: "/settings/committee-applications" },
};

export function useSiteSettings() {
  const [settings, setSettings] = useState({
    registrationOpen: true,
    committeeApplicationsOpen: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/settings");
      setSettings({
        registrationOpen: data?.settings?.registrationOpen !== false,
        committeeApplicationsOpen:
          data?.settings?.committeeApplicationsOpen !== false,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load site settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(refetch, 0);

    return () => clearTimeout(timeoutId);
  }, [refetch]);

  // One writer for both switches, so the optimistic flip and the rollback
  // behave identically whichever one was clicked.
  const applySwitch = useCallback(
    async (field, value, openMessage, closedMessage) => {
      setSaving(field);
      // Flipped straight away so the switch reacts to the click, and put back
      // if the server disagrees.
      const previous = settings;
      setSettings((current) => ({ ...current, [field]: value }));

      try {
        const { data } = await api.put(SWITCHES[field].endpoint, {
          [field]: value,
        });
        setSettings((current) => ({
          ...current,
          ...(data?.settings
            ? {
                registrationOpen: data.settings.registrationOpen,
                committeeApplicationsOpen: data.settings.committeeApplicationsOpen,
              }
            : {}),
        }));
        toast.success(value ? openMessage : closedMessage);

        return true;
      } catch (err) {
        setSettings(previous);
        toast.error(err.response?.data?.message || "Failed to update settings.");

        return false;
      } finally {
        setSaving(null);
      }
    },
    [settings],
  );

  const setRegistration = useCallback(
    (open) =>
      applySwitch(
        "registrationOpen",
        open,
        "Registration is now open — visitors can sign up again.",
        "Registration is now closed. Existing members can still sign in.",
      ),
    [applySwitch],
  );

  const setCommitteeApplications = useCallback(
    (open) =>
      applySwitch(
        "committeeApplicationsOpen",
        open,
        "Committee applications are now open.",
        "Committee applications are now closed. Existing requests can still be reviewed.",
      ),
    [applySwitch],
  );

  return {
    registrationOpen: settings.registrationOpen,
    committeeApplicationsOpen: settings.committeeApplicationsOpen,
    loading,
    // Which switch is mid-flight, so each row can disable only itself.
    saving,
    setRegistration,
    setCommitteeApplications,
    refetch,
  };
}
