import { useState } from "react";
import api from "../../../utils/api";

export function useDeleteEvent(refetch) {
  const [loading, setLoading] = useState(false);

  const deleteEvent = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/activities/${id}`);
      if (refetch) await refetch();
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  return { deleteEvent, loading };
}
