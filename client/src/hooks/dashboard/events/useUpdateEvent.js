import { useState } from "react";
import api from "../../../utils/api";
import { buildPayload } from "../../../utils/eventUtils";

export function useUpdateEvent(refetch) {
  const [loading, setLoading] = useState(false);

  const updateEvent = async (id, payload, coverImageFile, coverImageRemoved) => {
    setLoading(true);
    try {
      const body = buildPayload(payload);
      if (coverImageRemoved) body.coverImage = "";
      const res = await api.put(`/activities/${id}`, body);
      if (coverImageFile) {
        const formData = new FormData();
        formData.append("coverImage", coverImageFile);
        await api.put(`/activities/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      if (refetch) await refetch();
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  return { updateEvent, loading };
}
