import { useState, useMemo } from 'react';
import * as mock from '../../data/membersData';

export function useMembers() {
  // TODO: replace members with: GET /api/members
  const allMembers = mock.members;

  const [search, setSearch] = useState('');
  const [activeColleges, setActiveColleges] = useState([]);
  const [activeYears, setActiveYears] = useState([]);
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
      return matchesSearch && matchesCollege && matchesYear;
    });
  }, [allMembers, search, activeColleges, activeYears]);

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

  return {
    members: paginated,
    totalCount: filtered.length,
    collegeFilters: mock.collegeFilters,
    yearFilters: mock.yearFilters,
    search,
    setSearch,
    activeColleges,
    toggleCollege,
    activeYears,
    toggleYear,
    page,
    setPage,
    totalPages,
    pageSize,
  };
}
