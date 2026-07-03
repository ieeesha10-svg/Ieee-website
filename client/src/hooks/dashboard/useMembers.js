import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../utils/api";

const ORDINAL = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };

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

function mapUser(u) {
  return {
    id: u._id,
    name: u.name,
    initials: u.name
      ? u.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "??",
    college: u.college
      ? u.college.charAt(0).toUpperCase() + u.college.slice(1)
      : "N/A",
    year: formatYear(u.yearOfStudy),
    yearOfStudy: u.yearOfStudy,
    attendance: 0,
    maxAttendance: 1,
    status: "Active",
    role: u.role || "member",
    avatarColor: pickColor(u._id),
  };
}

const PAGE_SIZE = 12;

export function useMembers() {
  const [members, setMembers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [activeColleges, setActiveColleges] = useState([]);
  const [activeYears, setActiveYears] = useState([]);
  const [activeRoles, setActiveRoles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter options derived from initial full fetch
  const [collegeFilters, setCollegeFilters] = useState([]);
  const [yearFilters, setYearFilters] = useState([]);
  const [roleFilters] = useState(["user", "member", "board", "xcom", "scanner"]);

  // Refs for debouncing
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Fetch filtered members from API
  const fetchMembers = useCallback(async (searchTerm, colleges, years, roles, pageNum) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("page", String(pageNum));

      if (searchTerm) params.set("search", searchTerm);
      if (roles.length > 0) params.set("role", roles.join(","));
      if (colleges.length === 1) params.set("college", colleges[0]);
      if (years.length === 1) {
        // Convert display year back to number for API
        const yearMap = { "Prep": 0, "1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4, "5th Year": 5 };
        params.set("yearOfStudy", String(yearMap[years[0]] ?? years[0]));
      }

      const res = await api.get(`/users/all?${params.toString()}`, {
        signal: controller.signal,
      });

      const data = res.data;
      setMembers((data.users || []).map(mapUser));
      setTotalCount(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        console.error("Error fetching members:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch to populate filter options + first page of data
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/all?limit=1000");
        const users = res.data.users || [];

        // Derive filter options from full dataset
        const colleges = [...new Set(
          users.map((u) => u.college ? u.college.charAt(0).toUpperCase() + u.college.slice(1) : "N/A")
        )].sort();
        setCollegeFilters(colleges);

        const yearOrder = { Prep: 0, "1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4 };
        const years = [...new Set(users.map((u) => formatYear(u.yearOfStudy)))].sort(
          (a, b) => (yearOrder[a] ?? 99) - (yearOrder[b] ?? 99)
        );
        setYearFilters(years);

        // Set first page of data
        setMembers(users.slice(0, PAGE_SIZE).map(mapUser));
        setTotalCount(res.data.total || users.length);
        setTotalPages(res.data.pages || Math.ceil(users.length / PAGE_SIZE));
      } catch (err) {
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Re-fetch when filters or page change (debounced for search)
  useEffect(() => {
    // Skip initial mount (handled above)
    if (collegeFilters.length === 0 && yearFilters.length === 0) return;

    // Debounce search, immediately fetch for non-search filter changes
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchMembers(search, activeColleges, activeYears, activeRoles, page);
    }, search ? 300 : 0);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, activeColleges, activeYears, activeRoles, page, collegeFilters, yearFilters, fetchMembers]);

  const toggleCollege = (college) => {
    setPage(1);
    setActiveColleges((prev) =>
      prev.includes(college)
        ? prev.filter((c) => c !== college)
        : [...prev, college]
    );
  };

  const toggleYear = (year) => {
    setPage(1);
    setActiveYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const toggleRole = (role) => {
    setPage(1);
    setActiveRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return {
    members,
    totalCount,
    totalPages,
    collegeFilters,
    yearFilters,
    roleFilters,
    search,
    setSearch,
    activeColleges,
    toggleCollege,
    activeYears,
    toggleYear,
    activeRoles,
    toggleRole,
    page,
    setPage,
    loading,
  };
}