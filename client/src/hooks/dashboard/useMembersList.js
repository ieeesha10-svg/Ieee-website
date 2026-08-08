import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../utils/api";
import { formatAcademicYear } from "../../utils/formatAcademicYear";
import { YEAR_MAP } from "../../data/ordinalMap";
import { pickColor } from "../../data/avatarColors";
import { ALL_ROLES } from "../../data/roles";

function mapUser(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone || "",
    initials: u.name
      ? u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      : "??",
    college: u.college
      ? u.college.charAt(0).toUpperCase() + u.college.slice(1)
      : "N/A",
    year: formatAcademicYear(u.yearOfStudy),
    yearOfStudy: u.yearOfStudy,
    position: u.position || "",
    organization: u.organization || "",
    roleInOrganization: u.roleInOrganization || "",
    yearsOfExperience: u.yearsOfExperience,
    reasonForRegistration: u.reasonForRegistration || "",
    attendance: 0,
    maxAttendance: 1,
    status: u.isVerified ? "Verified" : "Unverified",
    role: u.role || "member",
    committee: u.committee || "",
    avatarColor: pickColor(u._id),
  };
}

export function useMembersList({ pageSize = 12, initialRole, initialRoles, enabled = true } = {}) {
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
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(enabled);

  const [collegeFilters, setCollegeFilters] = useState([]);
  const [yearFilters, setYearFilters] = useState([]);
  const [roleFilters] = useState(ALL_ROLES);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const lastParamsRef = useRef(null);

  const fetchMembers = useCallback(async (searchTerm, colleges, years, selectedRoles, activePosition, pageNum) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(pageSize));
      params.set("page", String(pageNum));
      if (searchTerm) params.set("search", searchTerm);
      if (selectedRoles.length > 0) params.set("role", selectedRoles.join(","));
      if (colleges.length > 0) params.set("college", colleges.join(","));
      if (years.length > 0) params.set("yearOfStudy", years.map((y) => YEAR_MAP[y] ?? y).join(","));
      if (activePosition) params.set("position", activePosition);

      const res = await api.get(`/users/all?${params.toString()}`, {
        signal: controller.signal,
      });

      const data = res.data;
      setMembers((data.users || []).map(mapUser));
      setTotalCount(data.allUsersCount || 0);
      setTotalPages(data.pages || 1);
    } catch {
      /* ignore aborted requests */
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/all?limit=1000");
        const users = res.data.users || [];

        if (cancelled) return;
        setCollegeFilters([
          ...new Set(
            users.map((u) => u.college ? u.college.charAt(0).toUpperCase() + u.college.slice(1) : "N/A")
          ),
        ].filter((c) => c !== "N/A").sort());

        if (cancelled) return;
        setYearFilters([
          ...new Set(users.map((u) => formatAcademicYear(u.yearOfStudy))),
        ].filter((y) => y !== "N/A").sort(
          (a, b) => (YEAR_MAP[a] ?? 99) - (YEAR_MAP[b] ?? 99)
        ));

        if (cancelled) return;
        setMembers(users.slice(0, pageSize).map(mapUser));
        setTotalCount(res.data.allUsersCount || users.length);
        setTotalPages(Math.ceil((res.data.allUsersCount || users.length) / pageSize));
      } catch {
        /* ignore aborted requests */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [pageSize, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const current = JSON.stringify([search, activeColleges, activeYears, roles, position, page]);

    if (lastParamsRef.current === null) {
      lastParamsRef.current = current;
      return;
    }
    if (lastParamsRef.current === current) return;
    lastParamsRef.current = current;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMembers(search, activeColleges, activeYears, roles, position, page);
    }, search ? 300 : 0);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, activeColleges, activeYears, roles, position, page, fetchMembers, enabled]);

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

  const togglePosition = (pos) => {
    setPage(1);
    setPosition((prev) => (prev === pos ? "" : pos));
  };

  const resetFilters = useCallback(() => {
    setActiveColleges([]);
    setActiveYears([]);
    setRoles(initialRoles || []);
    setPosition("");
    setPage(1);
  }, [initialRoles]);

  const hasActiveFilters = activeColleges.length > 0 || activeYears.length > 0 || roles.length > 0 || position !== "";

  return {
    members,
    setMembers,
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
    activePosition: position,
    togglePosition,
    page,
    setPage,
    loading,
    resetFilters,
    hasActiveFilters,
  };
}
