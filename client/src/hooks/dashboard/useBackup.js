// useBackup: backs up the "Backup & Restore" section of DashboardSettings.
// Downloads a full JSON snapshot of the database, and imports a previously
// downloaded one. Nothing is stored on the server — a restore always downloads
// the current data to the admin's device first.
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

// Download responses are blobs, so the usual `err.response.data.message` is
// unreadable — the JSON body has to be pulled out of the blob first.
const readBlobError = async (blob) => {
  try {
    return JSON.parse(await blob.text()).message;
  } catch {
    return null;
  }
};

const errorFrom = async (err) => {
  if (err.response?.data instanceof Blob) return await readBlobError(err.response.data);
  return err.response?.data?.message;
};

const filenameFromHeader = (disposition) =>
  disposition?.match(/filename="?([^";]+)"?/)?.[1] || null;

const saveBlob = (blob, disposition, fallbackName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filenameFromHeader(disposition) || fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
};

// The server stamps entries with the fields the history table and totals need;
// the derived display fields are added here so views stay free of formatting.
const present = (entry) =>
  entry && {
    ...entry,
    at: formatDate(entry.createdAt),
    by: entry.performedByName || entry.performedByEmail,
  };

export function useBackup() {
  const [lastBackup, setLastBackup] = useState(null);
  const [history, setHistory] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [phase, setPhase] = useState("");

  // `since` waits for an operation that began after that moment. The server
  // records a download only once the file has reached the browser, which is a
  // beat after the download resolves here, so poll briefly rather than showing
  // the previous entry.
  const fetchSummary = useCallback(async (since) => {
    // `refetch` is handed to buttons, so an event object can land in the first
    // argument — only a real timestamp is worth waiting for.
    const waited = typeof since === "string" ? Date.parse(since) : NaN;

    setLoadingInfo(true);
    try {
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const res = await api.get("/admin/backup/summary");
        const latest = res.data?.lastBackup || null;
        setLastBackup(latest);
        setHistory(res.data?.history || []);
        setTotals(res.data?.totals || null);

        const fresh =
          latest && !Number.isNaN(waited) && Date.parse(latest.createdAt) >= waited;
        if (Number.isNaN(waited) || fresh) break;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load backup history.");
    } finally {
      setLoadingInfo(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchSummary, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchSummary]);

  // Saves the database to the admin's device. Returns the name the browser was
  // told to use, which is never stored on the server.
  const getSnapshot = async () => {
    const res = await api.get("/admin/backup", { responseType: "blob" });
    const disposition = res.headers["content-disposition"];
    saveBlob(res.data, disposition, "ieee-backup.json");

    return filenameFromHeader(disposition) || "ieee-backup.json";
  };

  const downloadBackup = async () => {
    setDownloading(true);
    const startedAt = new Date().toISOString();
    try {
      await getSnapshot();
      toast.success("Backup downloaded.");
      await fetchSummary(startedAt);
    } catch (err) {
      toast.error((await errorFrom(err)) || "Failed to download backup.");
    } finally {
      setDownloading(false);
    }
  };

  // Safety backup first, then the restore — never the other way round.
  const importBackup = async (file) => {
    setImporting(true);
    try {
      setPhase("safety");
      const safetyName = await getSnapshot();

      setPhase("restore");
      const formData = new FormData();
      formData.append("backupFile", file);

      const res = await api.post("/admin/backup/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchSummary();
      return {
        ok: true,
        message: res.data?.message || "Backup imported.",
        safetyBackup: safetyName,
      };
    } catch (err) {
      // The restore was refused, so no data changed. Refresh anyway: the
      // download above still counts as a real operation.
      await fetchSummary();
      return {
        ok: false,
        message: (await errorFrom(err)) || "Failed to import backup.",
      };
    } finally {
      setImporting(false);
      setPhase("");
    }
  };

  return {
    lastBackup: present(lastBackup),
    history: history.map(present),
    totals,
    loadingInfo,
    downloading,
    importing,
    phase,
    downloadBackup,
    importBackup,
    refetch: fetchSummary,
  };
}
