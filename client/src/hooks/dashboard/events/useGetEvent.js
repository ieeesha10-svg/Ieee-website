import api from "../../../utils/api";

export function useGetEvent() {
  const getEventById = async (id) => {
    const res = await api.get(`/activities/${id}`);
    return res.data;
  };

  return { getEventById };
}
