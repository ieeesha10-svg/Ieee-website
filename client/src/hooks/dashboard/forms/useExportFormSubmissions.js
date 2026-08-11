import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../../utils/api";

export function useExportFormSubmissions() {
  const [exporting, setExporting] = useState(false);

  const exportSubmissions = useCallback(async (formId, filename) => {
    if (!formId) return;

    setExporting(true);
    try {
      const response = await api.get(`/submissions/export/${formId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename || "form"}_responses.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export submissions");
    } finally {
      setExporting(false);
    }
  }, []);

  return { exporting, exportSubmissions };
}
