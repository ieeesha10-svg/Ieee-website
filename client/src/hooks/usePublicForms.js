import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const FORM_TYPE_TO_CATEGORY = {
  registration: "Registration",
  survey: "Survey",
  feedback: "Feedback",
  custom: "Custom",
};

const CTA_LABEL_MAP = {
  Registration: "Apply Now →",
  Survey: "Take Surve →",
  Feedback: "Share Feedback →",
  Custom: "Open Form →",
};

function deriveCategory(formType) {
  return FORM_TYPE_TO_CATEGORY[formType] || "Custom";
}

export function usePublicForms() {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const formsRes = await api.get("/form");
      const rawForms = formsRes.data?.forms || [];

      const mapped = rawForms
        .filter((form) => form.status === "Active" && !form.activityID)
        .map((form) => {
          const category = deriveCategory(form.type);
          return {
            _id: form._id,
            activityID: null,
            title: form.title || "Untitled Form",
            description: form.description || "",
            category,
            ctaLabel: CTA_LABEL_MAP[category] || "Open Form →",
            startDate: form.startDate,
            endDate: form.endDate,
          };
        });

      setForms(mapped);
    } catch (err) {
      // Endpoint may require admin auth — standalone forms unavailable
      console.error("Error fetching forms:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { forms, isLoading, refetch: fetchData };
}
