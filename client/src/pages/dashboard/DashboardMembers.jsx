import React, { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMembers } from '../../hooks/dashboard/useMembers';

export default function DashboardMembers() {
  const {
    members, totalCount,
    collegeFilters, yearFilters, roleFilters,
    search, setSearch,
    activeColleges, toggleCollege,
    activeYears, toggleYear,
    activeRoles, toggleRole,
    page, setPage, totalPages,
  } = useMembers();

  const [memberRoles, setMemberRoles] = useState({});

  return (
    <div className="min-h-screen bg-main p-4 md:p-6">

      <div className="bg-card-alt rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="w-full md:w-[50%] flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card-alt focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
            <Search className="w-4 h-4 text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search by name or college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none border-none p-0"
            />
          </div>

          <div className="flex flex-col gap-3 md:gap-1.5">
						<div className='flex flex-wrap items-center gap-2'>
							<div className='flex items-center gap-1'>
								<Filter className="w-4 h-4 text-muted" />
								<span className="text-xs text-muted font-bold">College</span>
							</div>
							
							{collegeFilters.map((college) => (
			          <button
			            key={college}
			            onClick={() => toggleCollege(college)}
			            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
			              activeColleges.includes(college)
			                ? 'bg-primary text-white border-primary'
			                : 'bg-card-alt text-muted border border-border hover:border-primary hover:text-primary'
			            }`}
			          >
		            	{college}
			          </button>
							))}
						</div>

						<div className='flex flex-wrap items-center gap-2'>
							<div className='flex items-center gap-1'>
		            <Filter className="w-4 h-4 text-muted" />
								<span className="text-xs text-muted font-bold">Year</span>
							</div>
							
	            {yearFilters.map((year) => (
	              <button
	                key={year}
	                onClick={() => toggleYear(year)}
	                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
	                  activeYears.includes(year)
	                    ? 'bg-primary text-white border-primary'
	                    : 'bg-card-alt text-muted border border-border hover:border-primary hover:text-primary'
	                }`}
	              >
	                {year}
	              </button>
							))}
						</div>

						<div className='flex flex-wrap items-center gap-2'>
							<div className='flex items-center gap-1'>
		            <Filter className="w-4 h-4 text-muted" />
								<span className="text-xs text-muted font-bold">Role</span>
							</div>
							
	            {roleFilters.map((role) => (
	              <button
	                key={role}
	                onClick={() => toggleRole(role)}
	                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
	                  activeRoles.includes(role)
	                    ? 'bg-primary text-white border-primary'
	                    : 'bg-card-alt text-muted border border-border hover:border-primary hover:text-primary'
	                }`}
	              >
	                {role}
	              </button>
							))}
						</div>
          </div>
        </div>
      </div>

      <div className="bg-card-alt rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className='bg-[#F8FAFC] dark:bg-[#202636]'>
              <tr className="*:text-left *:text-xs *:font-semibold *:text-muted *:uppercase *:tracking-wide *:py-3">
                <th className="px-6 w-[30%]">MEMBER</th>
                <th className="px-4 w-[15%]">COLLEGE</th>
                <th className="px-4 w-[10%]">ROLE</th>
                <th className="px-4 w-[15%]">ACADEMIC YEAR</th>
                <th className="px-4 w-[20%]">ATTENDANCE</th>
                <th className="px-4 w-[10%]">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-sm text-muted py-16 text-center">
                    No members match your filters.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="last:border-0 hover:bg-muted/5 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${member.avatarColor}`}>
                          {member.initials}
                        </div>
                        <span className="text-sm font-medium text-foreground">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">{member.college}</td>
                    <td className="py-3 px-4">
                      <select
                        value={memberRoles[member.id] ?? member.role}
                        onChange={(e) => setMemberRoles((prev) => ({ ...prev, [member.id]: e.target.value }))}
                        className="text-xs font-medium bg-card-alt border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                      >
                        {roleFilters.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">{member.year}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-muted/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(member.attendance / member.maxAttendance) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground w-6 text-right">{member.attendance}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {member.status === "Active" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted bg-muted/10 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted" />
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm text-muted">
            Showing {members.length} of {totalCount} members
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg hover:bg-muted/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-primary text-white border border-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
