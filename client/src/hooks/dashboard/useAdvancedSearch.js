import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import { formatAcademicYear } from "../../utils/formatAcademicYear";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-teal-500", "bg-orange-500", "bg-purple-500",
  "bg-yellow-500", "bg-blue-400", "bg-green-500", "bg-red-400",
  "bg-purple-400", "bg-orange-400", "bg-cyan-600", "bg-blue-800",
];

function pickColor(id) {
  const hash = String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function mapUser(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    initials: u.name
      ? u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      : "??",
    college: u.college
      ? u.college.charAt(0).toUpperCase() + u.college.slice(1)
      : "N/A",
    year: formatAcademicYear(u.yearOfStudy),
    yearOfStudy: u.yearOfStudy,
    attendance: 0,
    maxAttendance: 1,
    status: "Active",
    role: u.role || "member",
    avatarColor: pickColor(u._id),
  };
}

export function useAdvancedSearch() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!keyword || keyword.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await api.get(
          `/users/search?keyword=${encodeURIComponent(keyword.trim())}`,
          { signal: controller.signal },
        );
        setResults((res.data?.data || []).map(mapUser));
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Advanced search failed:", err);
          setError(err.response?.data?.message || err.message || "Search failed");
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword]);

  return { keyword, setKeyword, results, isLoading, error };
}
