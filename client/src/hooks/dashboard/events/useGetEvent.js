import api from "../../../utils/api";

/**
 * Fetches one activity by id.
 *
 * `includeHidden` exists because the dashboard's edit modal has to open a draft,
 * while the public EventDetails and EventRegistration pages - which call
 * `/activities/:id` directly rather than through this hook - must not. Without
 * the distinction, hiding an event and then opening it in the dashboard would
 * 404, and there would be no way back.
 */
export function useGetEvent({ includeHidden = false } = {}) {
  const getEventById = async (id) => {
    const res = await api.get(`/activities/${id}`, {
      params: includeHidden ? { includeHidden: true } : undefined,
    });
    return res.data;
  };

  return { getEventById };
}
