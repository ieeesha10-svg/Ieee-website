// useCommitteeApplication: lets a signed-in member apply for a committee from
// the public committees page.
//
// Applying only ever creates a pending request. The board approves it from the
// dashboard, which is the step that actually sets the member's committee — so
// this hook never claims the member has joined, it reports what the server said.
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export function useCommitteeApplication() {
  const { user, setUser } = useAuth();
  const [pending, setPending] = useState(null);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setPending(null);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get("/committee-requests/my");
      const requests = data?.data || [];
      setPending(requests.find((r) => r.request_status === "pending") || null);
    } catch {
      // A failed lookup must not block the page; the server still refuses a
      // second request, so the worst case is a duplicate-application error.
      setPending(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timeoutId = setTimeout(load, 0);

    return () => clearTimeout(timeoutId);
  }, [load]);

  const apply = useCallback(
    async (committeeLabel) => {
      setApplying(true);
      try {
        const { data } = await api.post("/committee-requests", {
          committee_position: committeeLabel,
        });

        // Board and xcom members are accepted on the spot, so their profile has
        // already changed by the time this returns.
        if (data?.data?.committee) {
          setUser({ ...user, committee: data.data.committee });
        } else {
          await load();
        }

        toast.success(
          data?.message ||
            "Your request has been sent to the board for approval.",
        );

        return true;
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to send your request.",
        );

        return false;
      } finally {
        setApplying(false);
      }
    },
    [load, setUser, user],
  );

  return { user, pending, applying, loading, apply, reload: load };
}
