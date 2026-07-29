import { useState } from "react";
import api from "../../../utils/api";
import { buildPayload } from "../../../utils/eventUtils";

export function useCreateEvent(refetch) {
  const [loading, setLoading] = useState(false);

  const createEvent = async (payload, coverImageFile) => {
    setLoading(true);
    try {
      const body = buildPayload(payload);
      if (body.fields) body.status = "Active";
      const res = await api.post("/activities", body);
      const activityId = res.data.activity?._id || res.data.activity?.id;
      if (activityId) {
        const patches = {};
        if (body.registrationEnabled === false) patches.registrationEnabled = false;
        if (coverImageFile) {
          const formData = new FormData();
          formData.append("coverImage", coverImageFile);
          Object.entries(patches).forEach(([k, v]) => formData.append(k, v));
          await api.put(`/activities/${activityId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else if (Object.keys(patches).length) {
          await api.put(`/activities/${activityId}`, patches);
        }
      }
      if (refetch) await refetch();
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  return { createEvent, loading };
}
