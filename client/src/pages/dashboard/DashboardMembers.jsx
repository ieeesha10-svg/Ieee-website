import React, { useState, useCallback, Fragment } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Download, Inbox, Loader2, Trash2 } from 'lucide-react';
// Hooks & data
import { useAuth } from '../../context/AuthContext';
import { useMembersList } from '../../hooks/dashboard/useMembersList';
import { useSearchMembers } from '../../hooks/dashboard/useSearchMembers';
import { useExportUsers } from '../../hooks/dashboard/useExportUsers';
import { useUpdateRole } from '../../hooks/dashboard/useUpdateRole';
import { useCommitteeRequests } from '../../hooks/dashboard/useCommitteeRequests';
import { useChangeCommittee } from '../../hooks/dashboard/useChangeCommittee';
import { useDeleteMember } from '../../hooks/auth/useDeleteMember';
import { committees } from '../../data/committeesData';
// Components
import Button from '../../components/Button';
import AdvancedSearch from '../../components/AdvancedSearch';
import MemberFilters from '../../components/dashboard/MemberFilters';
import DeleteUserModal from '../../components/dashboard/DeleteUserModal';

export default function DashboardMembers() {
	const { user } = useAuth();
  
  const {
    members,
    setMembers,
    totalCount,
    collegeFilters,
    yearFilters,
    roleFilters,
    activeColleges,
    toggleCollege,
    activeYears,
    toggleYear,
    activeRoles,
    toggleRole,
    activePosition,
    togglePosition,
    page,
    setPage,
    totalPages,
    loading: membersLoading,
    resetFilters,
    hasActiveFilters,
  } = useMembersList();

  const [selectedIds, setSelectedIds] = useState([]);
  const [memberRoles, setMemberRoles] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
	const [memberCommittees, setMemberCommittees] = useState({});
  
  const { keyword, setKeyword, results, setResults, isLoading: searchLoading } = useSearchMembers();
  const isSearching = keyword.trim().length >= 2;
  const displayMembers = isSearching
    ? results.filter((m) => !activePosition || m.position === activePosition)
    : members;
  const loading = isSearching ? searchLoading : membersLoading;

	const { updatingRole, updateRole } = useUpdateRole();
  
	const { updatingCommittee, updateCommittee } = useChangeCommittee();
  
  const {
    requests,
    loading: requestsLoading,
    totalCount: pendingCount,
    processRequest,
    processingId,
  } = useCommitteeRequests();
	const { deleteMember, deleting } = useDeleteMember();
  
  const { exporting, exportUsers } = useExportUsers();

  const canDelete = (member) =>
    user?.role === "xcom" || member.id === user?._id;

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const deletedId = await deleteMember(deleteTarget);
    if (!deletedId) return;
    setMembers((prev) => prev.filter((m) => m.id !== deletedId));
    setResults((prev) => prev.filter((m) => m.id !== deletedId));
    if (deletedId === user?._id) {
      window.location.href = "/login";
      return;
    }
    setDeleteTarget(null);
  }, [deleteTarget, user, deleteMember, setMembers, setResults]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleRoleChange = useCallback(
    (memberId, newRole) => {
      const previousRole =
        memberRoles[memberId] ?? displayMembers.find((m) => m.id === memberId)?.role;
      updateRole(memberId, newRole, previousRole, setMemberRoles);
    },
    [memberRoles, displayMembers, updateRole],
  );

  const handleCommitteeChange = useCallback(
    (memberId, newCommittee) => {
      const member = displayMembers.find((m) => m.id === memberId);
      const previousCommittee = memberCommittees[memberId] ?? member?.committee;
      updateCommittee(
        memberId,
        member?.name,
        newCommittee,
        previousCommittee,
        setMemberCommittees,
      );
    },
    [memberCommittees, displayMembers, updateCommittee],
  );

  return (
    <div className="min-h-screen bg-main p-4 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap bg-card-alt rounded-xl shadow-sm p-4 mb-4">
        <MemberFilters
          collegeFilters={collegeFilters}
          yearFilters={yearFilters}
          roleFilters={roleFilters}
          activeColleges={activeColleges}
          toggleCollege={toggleCollege}
          activeYears={activeYears}
          toggleYear={toggleYear}
          activeRoles={activeRoles}
          toggleRole={toggleRole}
        />

        <Button
          variant='outline'
          onClick={resetFilters}
          disabled={!hasActiveFilters}
          className={`text-muted bg-card-alt text-sm border border-border rounded-lg shrink-0 transition-colors hidden md:inline-flex
            ${hasActiveFilters ?
              "hover:text-white dark:hover:text-foreground hover:border-primary/30" :
              "hover:bg-main dark:hover:bg-card-alt hover:text-foreground opacity-80 cursor-not-allowed"}`}
        >
          Reset Filters
        </Button>
      </div>

      <div className="bg-card-alt rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-center gap-5">
          <div className="flex-1 flex flex-col md:flex-row gap-5 w-full">
            <AdvancedSearch
              value={keyword}
              onChange={setKeyword}
              isLoading={searchLoading}
              placeholder="Search members by name or email..."
              className="w-full md:max-w-xs"
            />

            <div className="flex items-center gap-1 self-start md:self-center bg-card-alt border border-border rounded-lg p-1">
              {[
                { value: "", label: "All" },
                { value: "student", label: "Students" },
                { value: "professional", label: "Professionals" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => togglePosition(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                    activePosition === opt.value
                      ? "bg-primary text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 lg:gap-2">
            <button
              onClick={() => exportUsers(selectedIds)}
              disabled={exporting || selectedIds.length === 0}
              title={selectedIds.length === 0 ? "Select members to export" : ""}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm shrink-0 w-full lg:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Export as Excel ({selectedIds.length})
						</button>
						
            <Button
              variant='outline'
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className={`text-muted bg-card-alt text-sm border border-border rounded-lg shrink-0 transition-colors md:hidden
                ${hasActiveFilters ?
                  "hover:text-foreground hover:border-primary/30" :
                  "hover:bg-bg-card-alt opacity-80 cursor-not-allowed"}`}
            >
              Reset Filters
            </Button>
            
          </div>
        </div>
      </div>

      <div className="bg-card-alt rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] dark:bg-[#202636]">
              <tr className="*:text-left *:text-xs *:font-semibold *:text-muted *:uppercase *:tracking-wide *:py-3">
                <th className="px-2 w-10">
                  <input
                    type="checkbox"
                    checked={
                      displayMembers.length > 0 &&
                      displayMembers.every((m) => selectedIds.includes(m.id))
                    }
                    onChange={() =>
                      displayMembers.every((m) => selectedIds.includes(m.id))
                        ? setSelectedIds((prev) =>
                            prev.filter(
                              (id) => !displayMembers.some((m) => m.id === id),
                            ),
                          )
                        : setSelectedIds((prev) => [
                            ...new Set([...prev, ...displayMembers.map((m) => m.id)]),
                          ])
                    }
                    className="ml-3 w-4 h-4 accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-6 w-[30%]">MEMBER</th>
                <th className="px-4 w-[15%]">COLLEGE/ORG</th>
                <th className="px-4 w-[10%]">ROLE</th>
                <th className="px-4 w-[15%]">YEAR/EXP</th>
                <th className="px-4 w-[20%]">COMMITTEE</th>
                <th className="px-4 w-[10%]">STATUS</th>
                <th className="px-4 w-[5%]">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-sm text-muted py-16 text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      {isSearching ? "Searching..." : "Loading members..."}
                    </div>
                  </td>
                </tr>
              ) : displayMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-sm text-muted py-16 text-center"
                  >
                    {isSearching
                      ? `No results found for "${keyword}"`
                      : "No members match your filters."}
                  </td>
                </tr>
              ) : (
                displayMembers.map((member) => (
                  <Fragment key={member.id}>
                  <tr
                    className="last:border-0 hover:bg-muted/5 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(member.id)}
                        onChange={() => toggleSelect(member.id)}
                        className="ml-3 w-4 h-4 accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${member.avatarColor}`}
                        >
                          {member.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground">
                            {member.name}
                            {member.id === user?._id && (
                              <span className="ml-1.5 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                            {member.position === "professional" ? (
                              <span className="ml-1.5 text-[10px] font-semibold text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-500/10 px-1.5 py-0.5 rounded-full">
                                Professional
                              </span>
                            ) : member.position === "student" ? (
                              <span className="ml-1.5 text-[10px] font-semibold text-teal-700 bg-teal-50 dark:text-teal-300 dark:bg-teal-500/10 px-1.5 py-0.5 rounded-full">
                                Student
                              </span>
                            ) : null}
                          </span>
                        </div>
                        {member.position === "professional" && (
                          <button
                            onClick={() =>
                              setExpandedId(
                                expandedId === member.id ? null : member.id,
                              )
                            }
                            className="shrink-0 p-1 text-muted hover:text-primary rounded-lg transition-colors"
                            title={
                              expandedId === member.id
                                ? "Hide details"
                                : "Show details"
                            }
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${
                                expandedId === member.id ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">
                      {member.position === "professional"
                        ? member.organization || "N/A"
                        : member.college}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={memberRoles[member.id] ?? member.role}
                        onChange={(e) =>
                          handleRoleChange(member.id, e.target.value)
                        }
                        disabled={updatingRole === member.id}
                        className="text-xs font-medium bg-card-alt border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {roleFilters.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">
                      {member.position === "professional"
                        ? member.yearsOfExperience != null
                          ? `${member.yearsOfExperience} yr`
                          : "N/A"
                        : member.year}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={memberCommittees[member.id] ?? member.committee}
                        onChange={(e) =>
                          handleCommitteeChange(member.id, e.target.value)
                        }
                        disabled={updatingCommittee === member.id}
                        className="text-xs font-medium bg-card-alt border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">None</option>
                        {committees.map((c) => (
                          <option key={c.id} value={c.label}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      {member.status === "Verified" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {canDelete(member) && (
                        <button
                          onClick={() => setDeleteTarget(member)}
                          title="Delete user"
                          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === member.id && member.position === "professional" && (
                    <tr className="bg-muted/5 border-b border-border/60">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: "Organization", value: member.organization },
                            { label: "Role in Organization", value: member.roleInOrganization },
                            {
                              label: "Years of Experience",
                              value: member.yearsOfExperience != null ? String(member.yearsOfExperience) : "",
                            },
                            { label: "Reason for Registration", value: member.reasonForRegistration },
                          ].map((item) => (
                            <div key={item.label}>
                              <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">
                                {item.label}
                              </p>
                              <p className="text-sm text-foreground">{item.value || "—"}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isSearching && (
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-muted">
              Showing {members.length} of {totalCount} members
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1 || totalPages === 0}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg hover:bg-muted/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-1 px-4 py-2 text-sm bg-primary text-white border border-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
			</div>

			<div className="bg-card-alt rounded-xl shadow-sm p-4 mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Inbox size={18} className="text-muted" />
          <h2 className="text-base font-semibold text-foreground">Committee Requests</h2>
          {pendingCount > 0 && (
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>

        {requestsLoading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted py-8">
            <Loader2 size={18} className="animate-spin" />
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">No pending requests</p>
        ) : (
          <ul>
            {requests.map((request) => (
              <li
                key={request.id}
                className="flex flex-col md:flex-row md:items-center gap-3 py-3 border-t border-border/60 first:border-t-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {request.user.name}
                  </p>
                  <p className="text-xs text-muted truncate">{request.user.email}</p>
                </div>
                <span className="inline-flex w-fit items-center text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {request.committee}
                </span>
                <span className="text-xs text-muted w-fit md:w-28">
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => processRequest(request.id, "approved")}
                    disabled={processingId === request.id}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => processRequest(request.id, "rejected")}
                    disabled={processingId === request.id}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
			</div>
      
			<DeleteUserModal
        key={deleteTarget?.id ?? "closed"}
        open={!!deleteTarget}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
		</div>
  );
}
