import { useState } from "react";
import api from "../../../utils/api";
import { buildPayload } from "./eventUtils";

export function useUpdateEvent(refetch) {
  const [loading, setLoading] = useState(false);

  const updateEvent = async (id, payload, coverImageFile) => {
    setLoading(true);
    try {
      const body = buildPayload(payload);
      
      if (coverImageFile) {
        const formData = new FormData();
        Object.entries(body).forEach(([key, value]) => {
          if (key === "speakers" || key === "fields") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        });
        formData.append("coverImage", coverImageFile);
        const res = await api.put(`/activities/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (refetch) await refetch();
        return res.data;
      }

      const res = await api.put(`/activities/${id}`, body);
      if (refetch) await refetch();
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  return { updateEvent, loading };
}
