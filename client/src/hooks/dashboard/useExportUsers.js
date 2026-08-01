import { useState, useCallback } from "react";
import api from "../../utils/api";

export function useExportUsers() {
  const [exporting, setExporting] = useState(false);

  const exportUsers = useCallback(async (userIds) => {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    if (ids.length === 0) return;

    setExporting(true);
    try {
      const res = await api.post(
        "/users/export-specific",
        { userIds: ids },
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      link.download =
        ids.length === 1
          ? `ieee-member-${ids[0]}-${date}.xlsx`
          : `ieee-members-${date}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, []);

  return { exporting, exportUsers };
}
