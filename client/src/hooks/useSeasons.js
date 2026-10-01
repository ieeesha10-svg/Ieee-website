import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

/**
 * Read a season's Excom, Counselor and Board.
 *
 * With no `seasonId` this reads the season published on the home page, which is
 * what both the home page and /crew want by default: a visitor who lands on
 * /crew should see the current committee, not whichever season happens to sort
 * first. Passing an id is what the archive's season labels do.
 *
 * The two public season endpoints return the same `{ season, excom, counselor,
 * board }` shape, so this one hook covers the home page, /crew and
 * /crew/season/:id without any of them having to know which URL it came from.
 */
export function useSeason(seasonId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // A response for a season the visitor has already navigated away from must
    // not overwrite the one on screen.
    let ignore = false;

    const load = async () => {
      try {
        const response = await api.get(
          seasonId ? `/seasons/${seasonId}` : "/seasons/home"
        );
        if (ignore) return;
        // `data: null` is the documented "no season has been published yet"
        // answer from /seasons/home. It is a real state, not an error, and the
        // pages render their empty copy for it.
        setData(response.data?.data ?? null);
        setError(null);
      } catch (err) {
        if (ignore) return;
        setData(null);
        setError(err.response?.data?.message || "Failed to load this season");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [seasonId]);

  return {
    season: data?.season ?? null,
    excom: data?.excom ?? [],
    counselor: data?.counselor ?? [],
    board: data?.board ?? [],
    // True when the request succeeded but no season is published, which the
    // pages show differently from a failed request.
    isEmpty: !isLoading && !error && data === null,
    isLoading,
    error,
  };
}

/**
 * Every season, newest first, with a headcount.
 *
 * Used by /crew to build the previous-season labels and by the dashboard's
 * season picker. `refresh` is returned because the dashboard changes this list
 * whenever a season is created, renamed, published or deleted. It bumps a
 * counter rather than exposing the fetch itself, so the reload goes through the
 * same effect as the first load and a burst of writes cannot interleave two
 * responses into one list.
 */
export function useSeasons() {
  const [reloadKey, setReloadKey] = useState(0);
  const [seasons, setSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const response = await api.get("/seasons");
        if (ignore) return;
        setSeasons(response.data?.data || []);
        setError(null);
      } catch (err) {
        if (ignore) return;
        setError(err.response?.data?.message || "Failed to load seasons");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  return {
    seasons,
    isLoading,
    error,
    refresh: useCallback(() => setReloadKey((key) => key + 1), []),
  };
}
