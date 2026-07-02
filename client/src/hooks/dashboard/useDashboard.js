import { useState, useEffect } from "react";
import api from "../../utils/api";
import * as mock from "../../data/dashboardData";

const ORDINAL = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };

const CHART_COLORS = ["#00629B", "#0EA5E9", "#6366F1", "#22D3EE", "#F59E0B", "#EF4444"];

const AVATAR_COLORS = [
  "bg-blue-500", "bg-teal-500", "bg-orange-500", "bg-purple-500",
  "bg-yellow-500", "bg-blue-400", "bg-green-500", "bg-red-400",
  "bg-purple-400", "bg-orange-400", "bg-cyan-600", "bg-blue-800",
];

function pickColor(id) {
  const hash = String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatYear(year) {
  if (year == null) return "N/A";
  const num = Number(year);
  if (num === 0) return "Prep";
  return `${ORDINAL[num] || num} Year`;
}

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

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [formCounts, setFormCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/states/dashboard"),
      api.get("/form").catch(() => null),
    ])
      .then(([statsRes, formRes]) => {
        setStats(statsRes.data);
        if (formRes) setFormCounts(formRes.data);
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || err.message || "Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  if (!stats) {
    return {
      data: {
        statsCards: mock.statsCards,
        academicBackgroundData: mock.academicBackgroundData,
        academicYearData: mock.academicYearData,
        formStatusData: mock.formStatusData,
        topMembers: mock.topMembers,
        latestSignups: mock.latestSignups,
      },
      loading,
      error,
    };
  }

  const statsCards = [
    { ...mock.statsCards[0], value: String(stats.totalMembers ?? mock.statsCards[0].value) },
    { ...mock.statsCards[1], value: String(stats.activeActivities ?? mock.statsCards[1].value) },
    { ...mock.statsCards[2], value: String(stats.newRegistrations ?? mock.statsCards[2].value) },
    { ...mock.statsCards[3], value: String(stats.emailsSent ?? mock.statsCards[3].value) },
  ];

  const academicBackgroundData = (stats.collegeSplit || [])
    .filter((c) => c.college)
    .map((c, i) => ({
      name: c.college.charAt(0).toUpperCase() + c.college.slice(1),
      value: c.count,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  const academicYearData = (stats.yearSplit || [])
    .filter((y) => y.yearOfStudy != null)
    .map((y) => ({
      year: formatYear(y.yearOfStudy),
      students: y.count,
    }));

  const latestSignups = (stats.latestSignups || []).slice(0, 5).map((u) => ({
    initials: u.name
      ? u.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "??",
    name: u.name,
    college: u.college
      ? u.college.charAt(0).toUpperCase() + u.college.slice(1)
      : "N/A",
    time: timeAgo(u.createdAt),
    avatarColor: pickColor(u._id),
  }));

  const fc = formCounts;
  const formStatusData = fc
    ? [
        { status: "Open", count: fc.activeCount, total: fc.count, colorClass: "green" },
        { status: "Closed", count: fc.closedCount, total: fc.count, colorClass: "red" },
      ]
    : mock.formStatusData;

  return {
    data: {
      statsCards,
      academicBackgroundData: academicBackgroundData.length > 0 ? academicBackgroundData : mock.academicBackgroundData,
      academicYearData: academicYearData.length > 0 ? academicYearData : mock.academicYearData,
      formStatusData,
      topMembers: stats.topActiveMembers?.length > 0 ? stats.topActiveMembers : mock.topMembers,
      latestSignups: latestSignups.length > 0 ? latestSignups : mock.latestSignups,
    },
    loading,
    error,
  };
}
