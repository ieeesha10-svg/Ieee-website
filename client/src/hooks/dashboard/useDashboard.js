import { useState, useEffect } from "react";
import api from "../../utils/api";
import { formatAcademicYear } from "../../utils/formatAcademicYear";
import { pickColor } from "../../data/avatarColors";

const CHART_COLORS = ["#00629B", "#0EA5E9", "#6366F1", "#22D3EE", "#F59E0B", "#EF4444"];

const RANK_DISPLAY = ["🥇", "🥈", "🥉"];

function timeAgo(dateStr) {
	const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function capitalize(str) {
  if (!str) return "N/A";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/states/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || err.message || "Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  if (!stats) {
    return { data: null, loading, error };
  }

  const statsCards = [
    { id: 1, icon: "Users", label: "Total Members", value: String(stats.totalMembers ?? 0), sub: "Registered students" },
    { id: 2, icon: "Calendar", label: "Active Events", value: String(stats.activeActivities ?? 0), sub: "Currently open" },
    { id: 3, icon: "TrendingUp", label: "New Registrations", value: String(stats.newRegistrations ?? 0), sub: "Last 7 days" },
    { id: 4, icon: "Mail", label: "Emails Sent", value: String(stats.emailsSent ?? 0), sub: "Bulk dispatches total" },
  ];

  const academicBackgroundData = (stats.collegeSplit || [])
    .filter((c) => c.college)
    .map((c, i) => ({
      name: capitalize(c.college),
      value: c.count,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  const academicYearData = (stats.yearSplit || [])
    .filter((y) => y.yearOfStudy != null)
    .map((y) => ({
      year: formatAcademicYear(y.yearOfStudy),
      students: y.count,
    }));

  const topMembers = (stats.topActiveMembers || []).map((m, i) => ({
    rank: RANK_DISPLAY[i] || `#${i + 1}`,
    initials: getInitials(m.name),
    name: m.name,
    college: capitalize(m.college),
    scans: m.scans ?? m.count ?? 0,
    avatarColor: pickColor(m._id),
  }));

  const latestSignups = (stats.latestSignups || []).slice(0, 5).map((u) => ({
    initials: getInitials(u.name),
    name: u.name,
    institution: capitalize(
      u.position === "professional" ? u.organization : u.college,
    ),
    time: timeAgo(u.createdAt),
    avatarColor: pickColor(u._id),
  }));

  const activityStatusSummary = stats.activityStatusSummary || [];

  return {
    data: {
      statsCards,
      academicBackgroundData,
      academicYearData,
      activityStatusSummary,
      topMembers,
      latestSignups,
    },
    loading,
    error,
  };
}