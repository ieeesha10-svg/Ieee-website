import { useState, useMemo, useEffect } from 'react';
import api from '../../utils/api';

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

export function useMembers() {
  const [allMembers, setAllMembers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [activeColleges, setActiveColleges] = useState([]);
  const [activeYears, setActiveYears] = useState([]);
  const [activeRoles, setActiveRoles] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    api
      .get("/users/members")
      .then((res) => {
        setTotalCount(res.data.dataLength);
        const mapped = (res.data.data || []).map((u) => ({
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
          attendance: 0,
          maxAttendance: 1,
          status: "Active",
          role: u.role || "Member",
          avatarColor: pickColor(u._id),
        }));
        setAllMembers(mapped);
      })
      .catch(console.error);
  }, []);

  const collegeFilters = useMemo(
    () => [...new Set(allMembers.map((m) => m.college))].sort(),
    [allMembers],
  );

  const yearFilters = useMemo(
    () => [...new Set(allMembers.map((m) => m.year))].sort((a, b) => {
      const order = { Prep: 0, "1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4 };
      return (order[a] ?? 99) - (order[b] ?? 99);
    }),
    [allMembers],
  );

  const roleFilters = useMemo(
    () => [...new Set(allMembers.map((m) => m.role))].sort(),
    [allMembers],
  );

  const filtered = useMemo(() => {
    return allMembers.filter((m) => {
      const matchesSearch =
        search === "" ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.college.toLowerCase().includes(search.toLowerCase());
      const matchesCollege =
        activeColleges.length === 0 || activeColleges.includes(m.college);
      const matchesYear =
        activeYears.length === 0 || activeYears.includes(m.year);
      const matchesRole =
        activeRoles.length === 0 || activeRoles.includes(m.role);
      return matchesSearch && matchesCollege && matchesYear && matchesRole;
    });
  }, [allMembers, search, activeColleges, activeYears, activeRoles]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleCollege = (college) => {
    setPage(1);
    setActiveColleges((prev) =>
      prev.includes(college)
        ? prev.filter((c) => c !== college)
        : [...prev, college],
    );
  };

  const toggleYear = (year) => {
    setPage(1);
    setActiveYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  };

  const toggleRole = (role) => {
    setPage(1);
    setActiveRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  return {
    members: paginated,
    totalCount,
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
    totalPages,
    pageSize,
  };
}
