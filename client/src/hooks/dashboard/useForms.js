import { useState } from "react";
import { formsData as initialForms } from "../../data/formsData";

export function useForms() {
  const [forms, setForms] = useState(initialForms);

  const toggleFormStatus = (id) => {
    setForms((prev) =>
      prev.map((form) =>
        form.id === id ? { ...form, isOpen: !form.isOpen } : form
      )
    );
  };

  const openCount = forms.filter((f) => f.isOpen).length;
  const closedCount = forms.filter((f) => !f.isOpen).length;
  const totalResponses = forms.reduce((sum, f) => sum + f.responses, 0);

  return {
    forms,
    toggleFormStatus,
    openCount,
    closedCount,
    totalResponses,
    totalCount: forms.length,
  };
}
