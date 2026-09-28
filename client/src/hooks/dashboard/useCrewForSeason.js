import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

const blankMember = () => ({
  name: "",
  position: "",
  image: "",
  bio: "",
  socials: {
    linkedin: "",
    facebook: "",
    collabratec: "",
    email: "",
    website: "",
  },
});

/**
 * The dashboard's view of one season's members.
 *
 * The member list comes from /seasons/:id rather than /crew?season=, because the
 * dashboard needs the members already split into the Excom and the Board to
 * render them under their own headings, and the season endpoint does that
 * grouping on the server. A single `refresh` after every write keeps the two
 * sections in step with each other instead of letting one half of the page go
 * stale.
 *
 * Loading is derived from which season's members are currently in state rather
 * than stored as a boolean. Switching seasons therefore shows a spinner on the
 * first render of the new season, with no state write needed to get there, and a
 * refresh of the season you are already on does not blank the list.
 */
export function useCrewForSeason(seasonId) {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({
    seasonId: null,
    excom: [],
    board: [],
    failed: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!seasonId) return;

    let ignore = false;

    const load = async () => {
      try {
        const response = await api.get(`/seasons/${seasonId}`);
        if (ignore) return;
        setState({
          seasonId,
          excom: response.data?.data?.excom || [],
          board: response.data?.data?.board || [],
          failed: false,
        });
      } catch {
        if (ignore) return;
        setState({ seasonId, excom: [], board: [], failed: true });
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [seasonId, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const runWrite = async (write) => {
    setIsSaving(true);
    try {
      await write();
    } finally {
      setIsSaving(false);
      // Reloaded after the write whether it succeeded or not: on failure the
      // list is unchanged, so this is a no-op, and on success it is what pulls
      // the new member in.
      refresh();
    }
  };

  /** @param {"excom" | "board"} section which half of the season this member joins */
  const addMember = (member, section) =>
    runWrite(() => api.post("/crew", { ...member, season: seasonId, section }));

  const updateMember = (id, member, section) =>
    // The section travels with the update so a member can be moved from the
    // Board to the Excom without being deleted and re-entered.
    runWrite(() => api.put(`/crew/${id}`, { ...member, season: seasonId, section }));

  const removeMember = (id) => runWrite(() => api.delete(`/crew/${id}`));

  return {
    excom: state.seasonId === seasonId ? state.excom : [],
    board: state.seasonId === seasonId ? state.board : [],
    isLoading: !!seasonId && state.seasonId !== seasonId,
    isSaving,
    error: state.failed,
    refresh,
    addMember,
    updateMember,
    removeMember,
    blankMember,
  };
}
