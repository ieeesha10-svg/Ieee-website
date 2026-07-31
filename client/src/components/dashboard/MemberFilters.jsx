import React from 'react';
import FilterGroup from "./FilterGroup";

export default function MemberFilters({
  collegeFilters,
  yearFilters,
  roleFilters,
  activeColleges,
  toggleCollege,
  activeYears,
  toggleYear,
  activeRoles,
  toggleRole,
}) {
  return (
    <div className="flex flex-col gap-4.5 md:gap-3 flex-1">
      <FilterGroup
        label="College"
        items={collegeFilters}
        activeItems={activeColleges}
        onToggle={toggleCollege}
      />
      <FilterGroup
        label="Year"
        items={yearFilters}
        activeItems={activeYears}
        onToggle={toggleYear}
      />
      <FilterGroup
        label="Role"
        items={roleFilters}
        activeItems={activeRoles}
        onToggle={toggleRole}
      />
    </div>
  );
}
