import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../utils/api";
import { formatAcademicYear } from "../../utils/formatAcademicYear";
import { pickColor } from "../../data/avatarColors";
import { ALL_ROLES } from "../../data/roles";

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
    status: u.isVerified ? "Verified" : "Unverified",
    role: u.role || "member",
    committee: u.committee || "",
    avatarColor: pickColor(u._id),
  };
}

export function useMembersList({ pageSize = 12, initialRole, initialRoles } = {}) {
  const [members, setMembers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [activeColleges, setActiveColleges] = useState([]);
  const [activeYears, setActiveYears] = useState([]);
  const [roles, setRoles] = useState(() => {
    if (initialRoles) return initialRoles;
    if (initialRole) return [initialRole];
    return [];
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [collegeFilters, setCollegeFilters] = useState([]);
  const [yearFilters, setYearFilters] = useState([]);
  const [roleFilters] = useState(ALL_ROLES);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const fetchMembers = useCallback(async (searchTerm, colleges, years, selectedRoles, pageNum) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(pageSize));
      params.set("page", String(pageNum));
      if (searchTerm) params.set("search", searchTerm);
      const yearMap = { "Prep": 0, "1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4, "5th Year": 5 };
      if (selectedRoles.length > 0) params.set("role", selectedRoles.join(","));
      if (colleges.length > 0) params.set("college", colleges.join(","));
      if (years.length > 0) params.set("yearOfStudy", years.map((y) => yearMap[y] ?? y).join(","));

      const res = await api.get(`/users/all?${params.toString()}`, {
        signal: controller.signal,
      });

      const data = res.data;
      setMembers((data.users || []).map(mapUser));
      setTotalCount(data.allUsersCount || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        console.error("Error fetching members:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/all?limit=1000");
        const users = res.data.users || [];

        const colleges = [...new Set(
          users.map((u) => u.college ? u.college.charAt(0).toUpperCase() + u.college.slice(1) : "N/A")
        )].filter((c) => c !== "N/A").sort();
        setCollegeFilters(colleges);

        const yearOrder = { Prep: 0, "1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4 };
        const years = [...new Set(users.map((u) => formatAcademicYear(u.yearOfStudy)))].filter((y) => y !== "N/A").sort(
          (a, b) => (yearOrder[a] ?? 99) - (yearOrder[b] ?? 99)
        );
        setYearFilters(years);

        setMembers(users.slice(0, pageSize).map(mapUser));
        setTotalCount(res.data.allUsersCount || users.length);
        setTotalPages(res.data.pages || Math.ceil(users.length / pageSize));
      } catch (err) {
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [pageSize]);

  useEffect(() => {
    if (collegeFilters.length === 0 && yearFilters.length === 0) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMembers(search, activeColleges, activeYears, roles, page);
    }, search ? 300 : 0);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, activeColleges, activeYears, roles, page, collegeFilters, yearFilters, fetchMembers]);

  const toggleCollege = (college) => {
    setPage(1);
    setActiveColleges((prev) =>
      prev.includes(college) ? prev.filter((c) => c !== college) : [...prev, college]
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
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const resetFilters = useCallback(() => {
    setActiveColleges([]);
    setActiveYears([]);
    setRoles(initialRoles || []);
    setPage(1);
  }, [initialRoles]);

  const hasActiveFilters = activeColleges.length > 0 || activeYears.length > 0 || roles.length > 0;

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
    activeRoles: roles,
    toggleRole,
    page,
    setPage,
    loading,
    resetFilters,
    hasActiveFilters,
  };
}
