import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

// form.type -> the short category label used by the public filter tabs and the
// card badge. Short labels, not the full builder names: "Attendance or Event
// Registration" does not fit a tab or a badge pill.
const FORM_TYPE_TO_CATEGORY = {
  recruitment: "Recruitment",
  attendance: "Attendance",
  workshop: "Workshop",
  survey: "Survey",
  feedback: "Feedback",
};

// Categories in tab order. "Other" is not a tab — it is the bucket for legacy
// `other`-typed forms and anything this build does not recognise.
export const FORM_CATEGORIES = [
  "Recruitment",
  "Attendance",
  "Workshop",
  "Survey",
  "Feedback",
];

export const OTHER_CATEGORY = "Other";

const CTA_LABEL_MAP = {
  Recruitment: "Apply Now →",
  Attendance: "Register →",
  Workshop: "Register →",
  Survey: "Take Survey →",
  Feedback: "Share Feedback →",
  Other: "Open Form →",
};

function deriveCategory(formType) {
  return FORM_TYPE_TO_CATEGORY[formType] || OTHER_CATEGORY;
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
    } catch {
      // Endpoint may require admin auth — standalone forms unavailable
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { forms, isLoading, refetch: fetchData };
}
