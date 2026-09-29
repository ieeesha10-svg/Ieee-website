// usePendingCommitteeRequestCount: The single number the sidebar needs to decide
// whether to show its notification dot - how many committee requests are waiting
// on a decision. Deliberately separate from useReviewCommitteeRequests, which
// loads a whole page of rows for the review screen itself.
//
// Fetches on mount, again whenever the route changes, and whenever something
// dispatches PENDING_COUNT_EVENT after deciding a request, so the dot goes out
// the moment the last one is handled. The slow poll is only there to catch a
// decision made by a *different* admin, who would not fire that event.
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../../utils/api";

export const PENDING_COUNT_EVENT = "committee-requests:pending-changed";

const POLL_MS = 60_000;

export function usePendingCommitteeRequestCount() {
  const [count, setCount] = useState(0);
  const { pathname } = useLocation();

  const refresh = useCallback(async () => {
    try {
      // limit=1 - the rows are not used, only pagination.totalItems is.
      const res = await api.get("/committee-requests?status=pending&page=1&limit=1");
      setCount(res.data?.pagination?.totalItems || 0);
    } catch {
      // The dot is decoration. A failed count must not blank the nav or throw a
      // toast on every page - the review screen still surfaces the real error.
      setCount(0);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refresh();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [refresh, pathname]);

  useEffect(() => {
    const onChanged = () => refresh();
    window.addEventListener(PENDING_COUNT_EVENT, onChanged);
    return () => window.removeEventListener(PENDING_COUNT_EVENT, onChanged);
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { count, refresh };
}
