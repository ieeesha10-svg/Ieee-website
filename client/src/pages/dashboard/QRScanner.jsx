import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ScanLine,
  Users,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Info,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../../utils/api";

/* ════════════════════════════════════════════════════════════════
   Helper — human-readable relative time
   ════════════════════════════════════════════════════════════════ */
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 10) return "Now";
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

/* ════════════════════════════════════════════════════════════════
   Result Modal
   ════════════════════════════════════════════════════════════════ */
function ResultModal({ result, onDismiss, onNext }) {
  if (!result) return null;

  const config = {
    success: {
      icon: <CheckCircle size={48} className="text-green-500" />,
      title: result.registrant || "Member",
      subtitle: "Member",
      badge: "Attendance Recorded Successfully",
      badgeColor:
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      iconBg: "bg-green-50 dark:bg-green-900/20",
      nextLabel: "Next Scan",
    },
    duplicate: {
      icon: <AlertTriangle size={48} className="text-amber-500" />,
      title: "QR Already Scanned",
      subtitle:
        "This student's attendance has already been recorded.",
      badge: "Duplicate Scan Detected",
      badgeColor:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      nextLabel: "Try Again",
    },
    invalid: {
      icon: <XCircle size={48} className="text-red-500" />,
      title: "Invalid Member",
      subtitle: "The scanned QR code does not match any registered member.",
      badge: "Member Not Recognized",
      badgeColor: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      iconBg: "bg-red-50 dark:bg-red-900/20",
      nextLabel: "Try Again",
    },
  };

  const c = config[result.type] || config.invalid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 relative animate-in">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-muted hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">{c.icon}</div>
          <h3 className="text-lg font-bold text-foreground mb-1">{c.title}</h3>
          <p className="text-sm text-muted mb-4">{c.subtitle}</p>

          {/* Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold mb-4 ${c.badgeColor}`}
          >
            {result.type === "success" ? (
              <CheckCircle size={14} />
            ) : result.type === "duplicate" ? (
              <AlertTriangle size={14} />
            ) : (
              <XCircle size={14} />
            )}
            {c.badge}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full mt-2">
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-2 text-sm font-medium text-foreground border border-gray-200 dark:border-[#222936] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={onNext}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              {c.nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Recent Scan Row
   ════════════════════════════════════════════════════════════════ */
function RecentScanRow({ scan }) {
  const colors = {
    success: "bg-green-500",
    duplicate: "bg-amber-500",
    invalid: "bg-red-500",
  };

  const labels = {
    success: "New",
    duplicate: "Already",
    invalid: "Invalid",
  };

  const labelColors = {
    success:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    duplicate:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    invalid: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#222936] last:border-b-0">
      {/* Avatar dot */}
      <div
        className={`w-8 h-8 rounded-full ${colors[scan.type]} flex items-center justify-center text-white text-xs font-bold shrink-0`}
      >
        {scan.name
          ? scan.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : "??"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {scan.name || "Unknown"}
        </p>
        <p className="text-[11px] text-muted truncate">{scan.subtitle || ""}</p>
      </div>

      {/* Badge + Time */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            labelColors[scan.type]
          }`}
        >
          {labels[scan.type]}
        </span>
        <span className="text-[10px] text-muted">{timeAgo(scan.time)}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════════════════════ */
export default function QRScanner() {
  // State
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [modalResult, setModalResult] = useState(null);
  const [totalScanned, setTotalScanned] = useState(0);

  const scannerRef = useRef(null); // Html5Qrcode instance
  const scannerDivId = "qr-reader";
  const isProcessingRef = useRef(false); // prevent rapid double-scans

  // Handle a scanned code
  const handleScan = useCallback(async (code) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const { data } = await api.post("/submissions/scan", { code });

      // Success
      setTotalScanned((prev) => prev + 1);
      const newScan = {
        id: Date.now(),
        name: data.registrant || "Member",
        subtitle: "",
        type: "success",
        time: new Date(),
      };
      setRecentScans((prev) => [newScan, ...prev].slice(0, 20));
      setModalResult({ type: "success", registrant: data.registrant });
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message || "";

      if (status === 400 || message.toLowerCase().includes("already")) {
        // Already scanned
        const newScan = {
          id: Date.now(),
          name: message,
          subtitle: "",
          type: "duplicate",
          time: new Date(),
        };
        setRecentScans((prev) => [newScan, ...prev].slice(0, 20));
        setModalResult({ type: "duplicate" });
      } else {
        // Invalid / not found / other error
        const newScan = {
          id: Date.now(),
          name: "Invalid QR",
          subtitle: code.slice(0, 20),
          type: "invalid",
          time: new Date(),
        };
        setRecentScans((prev) => [newScan, ...prev].slice(0, 20));
        setModalResult({ type: "invalid" });
      }
    } finally {
      // Small delay before allowing next scan
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1500);
    }
  }, []);

  // Start / Stop scanner
  const startScanner = useCallback(async () => {
    if (scannerRef.current) return;

    try {
      const html5Qr = new Html5Qrcode(scannerDivId);
      scannerRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {
          // Ignore scan errors (no QR in frame)
        },
      );

      setIsScanning(true);
    } catch {
      alert(
        "Could not access camera. Please allow camera permissions and try again.",
      );
    }
  }, [handleScan]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        /* ignore scanner stop errors */
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  // Modal handlers
  const dismissModal = () => setModalResult(null);
  const nextScan = () => {
    setModalResult(null);
    if (!isScanning) startScanner();
  };

  // Render
  const lastScans = recentScans.slice(0, 5);

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">QR Attendance</h1>
          <p className="text-sm text-muted">
            Scan student QR codes to log attendance in real time
          </p>
        </div>

        {/* Scanning indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isScanning ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          <span
            className={`text-xs font-medium ${
              isScanning ? "text-green-600 dark:text-green-400" : "text-muted"
            }`}
          >
            {isScanning ? "Scanner Active" : "Scanner Idle"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Scanner */}
        <div className="lg:col-span-3 space-y-5">
          {/* Scanner area */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm p-5">
            <div className="relative mx-auto max-w-sm">
              {/* Scanner container */}
              <div
                className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                  isScanning
                    ? "border-primary/50"
                    : "border-dashed border-gray-300 dark:border-gray-600"
                }`}
                style={{ minHeight: 300 }}
              >
                {/* QR reader element — html5-qrcode renders video here */}
                <div
                  id={scannerDivId}
                  className="w-full"
                  style={{ minHeight: 300 }}
                />

                {/* Paused overlay (only when NOT scanning) */}
                {!isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#111827]">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4">
                      <ScanLine size={28} className="text-muted" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Scanner Paused
                    </p>
                    <p className="text-xs text-muted text-center max-w-[200px]">
                      Press Start Scanning to activate the camera
                    </p>
                  </div>
                )}
              </div>

              {/* Scanned counter badge */}
              {totalScanned > 0 && (
                <div className="absolute bottom-3 right-3 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <CheckCircle size={12} />
                  {totalScanned} scanned
                </div>
              )}
            </div>

            {/* Instructions */}
            <p className="text-xs text-muted text-center mt-4 max-w-xs mx-auto">
              Align a student QR code within the frame to log attendance.
            </p>

            {/* Start / Stop button */}
            <div className="flex justify-center mt-5">
              {!isScanning ? (
                <button
                  onClick={startScanner}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                >
                  <ScanLine size={16} />
                  Start Scanning
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                >
                  <X size={16} />
                  Stop Scanning
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Session Panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Session Stats */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm p-5">
            <h2 className="text-sm font-bold text-foreground mb-4">
              Session Stats
            </h2>

            <div className="space-y-4">
              {/* Total scanned */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <Users
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wide">
                    Total Scanned
                  </p>
                  <p className="text-lg font-bold text-foreground leading-tight">
                    {totalScanned}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isScanning
                      ? "bg-green-50 dark:bg-green-900/20"
                      : "bg-gray-100 dark:bg-gray-700/50"
                  }`}
                >
                  <Activity
                    size={16}
                    className={
                      isScanning
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted"
                    }
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wide">
                    Status
                  </p>
                  <p
                    className={`text-sm font-semibold leading-tight ${
                      isScanning
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted"
                    }`}
                  >
                    {isScanning ? "Live" : "Idle"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Scans */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#222936]">
              <h2 className="text-sm font-bold text-foreground">
                Recent Scans
              </h2>
              {lastScans.length > 0 && (
                <span className="text-[10px] font-bold text-muted">
                  Last {lastScans.length}
                </span>
              )}
            </div>

            <div className="max-h-[320px] overflow-y-auto scrollable-content">
              {lastScans.length > 0 ? (
                lastScans.map((scan) => (
                  <RecentScanRow key={scan.id} scan={scan} />
                ))
              ) : (
                <div className="py-10 text-center">
                  <Clock size={20} className="text-muted mx-auto mb-2" />
                  <p className="text-sm text-muted">No scans yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Pro Tip */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 p-4">
            <div className="flex items-start gap-2.5">
              <Info
                size={16}
                className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
                  Pro Tip
                </p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                  Students can show their QR codes from the IEEE SB app or their
                  registration confirmation email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <ResultModal
        result={modalResult}
        onDismiss={dismissModal}
        onNext={nextScan}
      />
    </div>
  );
}
