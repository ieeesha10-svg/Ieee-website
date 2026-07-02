import { useState, useMemo } from 'react';
import * as mock from '../../data/membersData';

export function useMembers() {
  // TODO: replace members with: GET /api/members
  const allMembers = mock.members;

  const [search, setSearch] = useState('');
  const [activeColleges, setActiveColleges] = useState([]);
  const [activeYears, setActiveYears] = useState([]);
  const [activeRoles, setActiveRoles] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const filtered = useMemo(() => {
    return allMembers.filter((m) => {
      const matchesSearch =
        search === '' ||
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
    setActiveRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return {
    members: paginated,
    totalCount: filtered.length,
    collegeFilters: mock.collegeFilters,
    yearFilters: mock.yearFilters,
    roleFilters: mock.roleFilters,
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
