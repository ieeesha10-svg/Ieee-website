import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  Search,
  X,
  Check,
  Download,
  Upload,
  Clock,
  Database,
  DatabaseBackup,
  Gauge,
  User,
  UserPlus
} from "lucide-react";
// Hooks & Data
import { useUpdateRole } from "../../hooks/dashboard/useUpdateRole";
import { useMembersList } from "../../hooks/dashboard/useMembersList";
import { useGetAdmins } from "../../hooks/dashboard/useGetAdmins";
import { useBackup } from "../../hooks/dashboard/useBackup";
import { useSiteSettings } from "../../hooks/dashboard/useSiteSettings";
import { useEmailQuota } from "../../hooks/dashboard/useEmailQuota";
import { VIEW_ROLES, ROLE_LABELS, READ_ONLY_NOTICE } from '../../data/roles'
import { canWrite } from '../../utils/roleAccess'
// Components
import DeleteModal from "../../components/ui/DeleteModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import api from "../../utils/api";

function SectionCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm p-5 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function MessageBanner({ message }) {

  if (!message.text) return null;
  return (
    <div
      className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
        message.type === "success"
          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
      }`}
    >
      {message.type === "success" ? (
        <CheckCircle2 size={18} className="shrink-0" />
      ) : (
        <AlertTriangle size={18} className="shrink-0" />
      )}
      {message.text}
    </div>
  );
}

function RoleSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Role"
      className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
    >
      {VIEW_ROLES.map((r) => (
        <option key={r} value={r}>
          {ROLE_LABELS[r] || r}
        </option>
      ))}
    </select>
  );
}

  const BACKUP_TYPE_LABELS = {

  download: { label: "Downloaded Backup", className: "text-primary bg-primary/10" },
  restore: { label: "Restore From Backup", className: "text-red-600 bg-red-500/10" },
};

function BackupTypeBadge({ type }) {
  const { label, className } =
    BACKUP_TYPE_LABELS[type] || BACKUP_TYPE_LABELS.download;
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}

export default function DashboardSettings() {
  const { user, setUser } = useAuth();

  const { updateRole } = useUpdateRole();
  const { admins, adminRoles, setAdmins, setAdminRoles, refetch: fetchAdmins } = useGetAdmins();
  const {
    registrationOpen,
    committeeApplicationsOpen,
    loading: loadingSettings,
    saving,
    setRegistration,
    setCommitteeApplications,
  } = useSiteSettings();

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { quota, isLoading: loadingQuota, error: quotaError, refetch: refetchQuota } =
    useEmailQuota();

  const {
    lastBackup,
    history,
    totals,
    loadingInfo,
    downloading,
    importing,
    phase,
    downloadBackup,
    importBackup,
  } = useBackup();
  const [backupMessage, setBackupMessage] = useState({ type: "", text: "" });
  const [pendingImport, setPendingImport] = useState(null);
  const [confirmImport, setConfirmImport] = useState(false);
  const fileInputRef = useRef(null);

  // canWrite is the real permission; board can reach this page and read it, but
  // every control below stays hidden for them.
  const canEdit = canWrite(user?.role);

  const handleRoleChange = (adminId, newRole) => {
    const previousRole = adminRoles[adminId];
    updateRole(adminId, newRole, previousRole, setAdminRoles);
  };

  const removeAdmin = async (id) => {
    const previousRole = adminRoles[id];
    updateRole(id, "member", previousRole, setAdminRoles, {
      message: "User removed from admin list",
      options: { icon: <Trash2 size={16} className="text-red-500" /> },
    });
    setAdmins((prev) => prev.filter((a) => a.id !== id));
  };

  const handlePickImportFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow the same file to be picked again
    if (file) {
      setPendingImport(file);
      setConfirmImport(true);
    }
  };

  // A restore replaces the users collection, so the account behind this session
  // may no longer exist. Check the session before reporting success, and drop
  // it so the router sends the admin to the login page instead of leaving them
  // clicking through a session that quietly fails every request.
  const sessionStillValid = async () => {
    try {
      const { data } = await api.get("/users/profile");
      setUser(data?.user || null);
      return true;
    } catch {
      setUser(null);
      return false;
    }
  };

  const handleConfirmImport = async () => {
    const result = await importBackup(pendingImport);
    setConfirmImport(false);
    setPendingImport(null);

    if (!result.ok) {
      setBackupMessage({ type: "error", text: result.message });
      return;
    }

    const signedIn = await sessionStillValid();
    setBackupMessage({
      type: signedIn ? "success" : "error",
      text: signedIn
        ? `${result.message} The current data was saved to your device as "${result.safetyBackup}" before the restore.`
        : `${result.message} Sign in again to carry on — this account was not in the backup you restored.`,
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-4xl">


      {/* Section 3: User Permissions — visible to board, editable by xcom only */}
            <SectionCard>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    User Permissions
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {canEdit
                      ? "Manage admin roles and access levels"
                      : READ_ONLY_NOTICE}
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <Plus size={14} />
                    Add Admin
                  </button>
                )}
              </div>

              {/* Admins Table */}
              <div className="overflow-x-auto -mx-5 md:-mx-6">
                <table className="w-full min-w-125">
                  <thead>
                    <tr className="text-[11px] font-bold text-muted uppercase tracking-wide border-b border-gray-100 dark:border-[#222936]">
                      <th className="text-left px-5 md:px-6 pb-3">Admin</th>
                      <th className="text-left px-4 pb-3">Email</th>
                      <th className="text-left px-4 pb-3">Role</th>
                      <th className="text-right px-5 md:px-6 pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="border-b border-gray-50 dark:border-[#222936] last:border-b-0"
                      >
                        <td className="px-5 md:px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full ${admin.color} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}
                            >
                              {admin.initials}
                            </div>
                            <span className="text-sm font-medium text-foreground whitespace-nowrap">
                              {admin.name}
                              {admin.id === user?._id && (
                                <span className="ml-1.5 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                          {admin.email}
                        </td>
                        <td className="px-4 py-3">
                          {canEdit ? (
                            <RoleSelect
                              value={adminRoles[admin.id] || admin.role}
                              onChange={(role) => handleRoleChange(admin.id, role)}
                            />
                          ) : (
                            <span className="text-xs font-medium text-foreground">
                              {ROLE_LABELS[adminRoles[admin.id] || admin.role] ||
                                admin.role}
                            </span>
                          )}
                        </td>
                        <td className="px-5 md:px-6 py-3 text-right">
                          {canEdit && (
                            <button
                              onClick={() => setDeleteTarget(admin)}
                              aria-label={`Delete ${admin.name}`}
                              className="p-1.5 text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm mt-5">
                <Save size={14} />
                Save Permissions
              </button>*/}
            </SectionCard>

      {/* Registration & Applications */}
      {canEdit && (
        <SectionCard>
          <div className="flex items-center gap-2 mb-1">
            <UserPlus size={18} className="text-muted" />
            <h2 className="text-xl font-bold text-foreground">
              Registration &amp; Applications
            </h2>
          </div>
          <p className="text-xs text-muted mb-5">
            Pause new sign-ups or new committee applications without affecting
            the people already here. Signing in always keeps working, and
            applications already submitted can still be reviewed.
          </p>

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-100 dark:border-[#222936] bg-gray-50 dark:bg-gray-800/40 p-4">
              <ToggleSwitch
                id="toggle-registration"
                checked={registrationOpen}
                disabled={loadingSettings || saving === "registrationOpen"}
                onChange={setRegistration}
                onLabel="Open"
                offLabel="Closed"
                label="Allow new accounts"
                description={
                  loadingSettings
                    ? "Checking the current status..."
                    : registrationOpen
                      ? "The registration form is open to visitors."
                      : "The registration form is closed. Sign-in is unaffected."
                }
              />
            </div>

            <div className="rounded-lg border border-gray-100 dark:border-[#222936] bg-gray-50 dark:bg-gray-800/40 p-4">
              <ToggleSwitch
                id="toggle-committee-applications"
                checked={committeeApplicationsOpen}
                disabled={
                  loadingSettings || saving === "committeeApplicationsOpen"
                }
                onChange={setCommitteeApplications}
                onLabel="Open"
                offLabel="Closed"
                label="Allow committee applications"
                description={
                  loadingSettings
                    ? "Checking the current status..."
                    : committeeApplicationsOpen
                      ? "Members can apply for a committee from the committees page."
                      : "New applications are paused. The board can still review the ones already submitted."
                }
              />
            </div>
          </div>
        </SectionCard>
      )}

      {/* Section 4: Email Quota */}
      <SectionCard>
        <div className="flex items-center gap-2 mb-1">
          <Gauge size={18} className="text-muted" />
          <h2 className="text-xl font-bold text-foreground">
            Email Allowance
          </h2>
        </div>
        <p className="text-xs text-muted mb-5">
          How much of Brevo&apos;s daily transactional sending allowance is left.
          Worth checking before a bulk send, because Brevo rejects the emails
          once the day&apos;s allowance runs out.
        </p>

        {loadingQuota ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Loader2 size={14} className="animate-spin" />
            Checking Brevo...
          </p>
        ) : !quota?.available ? (
          // Deliberately not an error banner. This is a readout in a corner of
          // the page, and a Brevo outage says nothing about whether the rest of
          // the site works. Showing zero would be a lie, so it shows nothing.
          <div className="rounded-lg border border-gray-100 dark:border-[#222936] bg-gray-50 dark:bg-gray-800/40 p-4">
            <p className="flex items-center gap-2 text-sm text-muted">
              <AlertTriangle size={14} className="shrink-0" />
              Could not read the allowance right now.
            </p>
            <p className="text-xs text-muted mt-1.5">
              {quota?.reason ||
                quotaError ||
                "Brevo did not answer. This does not affect sending."}
            </p>
            <button
              onClick={refetchQuota}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground bg-transparent border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-100 dark:border-[#222936] bg-gray-50 dark:bg-gray-800/40 p-4">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <div>
                <span className="text-2xl font-bold text-foreground">
                  {quota.remaining}
                </span>
                <span className="text-sm text-muted"> of {quota.limit} left</span>
              </div>
              <span className="text-xs text-muted capitalize">
                {quota.plan} plan
              </span>
            </div>

            {/* Filled proportionally to what is LEFT, not what is used: a full
                bar means room to send, which is the question an admin opens
                this page to answer. */}
            <div
              className="h-2 w-full rounded-full bg-gray-200 dark:bg-[#222936] overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={quota.limit}
              aria-valuenow={quota.remaining}
              aria-label="Emails remaining today"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  quota.remainingRatio <= 0.1
                    ? "bg-red-500"
                    : quota.remainingRatio <= 0.3
                      ? "bg-amber-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${Math.max(quota.remainingRatio * 100, quota.remaining > 0 ? 2 : 0)}%` }}
              />
            </div>

            <p className="text-xs text-muted mt-3">
              {quota.used} sent today. Resets daily.
            </p>

            {quota.remainingRatio <= 0.1 && (
              <p className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 mt-2">
                <AlertTriangle size={13} className="shrink-0" />
                Almost out. A bulk send over the remainder will start failing.
              </p>
            )}
          </div>
        )}
      </SectionCard>

      {/* Section 5: Backup & Restore */}
      <SectionCard>
        <div className="flex items-center gap-2 mb-1">
          <DatabaseBackup size={18} className="text-muted" />
          <h2 className="text-xl font-bold text-foreground">
            Backup &amp; Restore
          </h2>
        </div>
        <p className="text-xs text-muted mb-5">
          Download a full copy of every collection, or restore a copy you
          downloaded earlier. Nothing is stored on the server — every backup
          goes straight to your device.
        </p>

        <div className="rounded-lg border border-gray-100 dark:border-[#222936] bg-gray-50 dark:bg-gray-800/40 p-4 mb-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wide">
              Last Backup
            </p>
            {lastBackup && <BackupTypeBadge type={lastBackup.type} />}
          </div>

          {loadingInfo && !lastBackup ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Loader2 size={14} className="animate-spin" />
              Checking backup history...
            </p>
          ) : lastBackup ? (
            <div className="space-y-1.5">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock size={14} className="text-muted shrink-0" />
                {lastBackup.at}
              </p>
              <p className="flex items-center gap-2 text-xs text-muted">
                <User size={13} className="shrink-0" />
                <span className="truncate">
                  {lastBackup.by || "Unknown admin"}
                  {lastBackup.performedByEmail &&
                    lastBackup.by !== lastBackup.performedByEmail &&
                    ` · ${lastBackup.performedByEmail}`}
                </span>
              </p>
              <p className="flex items-center gap-2 text-xs text-muted">
                <Database size={13} className="shrink-0" />
                {lastBackup.collections?.length || 0} collection
                {lastBackup.collections?.length === 1 ? "" : "s"} &middot;{" "}
                {lastBackup.totalDocuments || 0} document
                {lastBackup.totalDocuments === 1 ? "" : "s"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">No backup has been taken yet.</p>
          )}

          {totals && totals.operations > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#222936] grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total operations", value: totals.operations },
                { label: "Documents handled", value: totals.documents },
                { label: "Downloads", value: totals.downloads },
                { label: "Restores", value: totals.restores },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-lg font-bold text-foreground leading-tight">
                    {Number(stat.value || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <MessageBanner message={backupMessage} />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={downloadBackup}
            disabled={downloading || importing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Download Backup
          </button>

          {/* Restoring a backup overwrites the database, so xcom only. Board
              keeps the download. */}
          {canEdit && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={downloading || importing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-transparent border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                {importing
                  ? phase === "safety"
                    ? "Saving Safety Backup..."
                    : "Restoring Data..."
                  : "Import Backup"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handlePickImportFile}
                className="hidden"
              />
            </>
          )}
        </div>

        {history.length > 0 && (
          <div className="mt-5">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-2">
              Recent Activity
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-[#222936]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/40 text-muted">
                    <th className="text-left font-semibold px-3 py-2 whitespace-nowrap">
                      When
                    </th>
                    <th className="text-left font-semibold px-3 py-2 whitespace-nowrap">
                      Operation
                    </th>
                    <th className="text-left font-semibold px-3 py-2">Admin</th>
                    <th className="text-right font-semibold px-3 py-2 whitespace-nowrap">
                      Collections
                    </th>
                    <th className="text-right font-semibold px-3 py-2 whitespace-nowrap">
                      Documents
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr
                      key={entry._id}
                      className="border-t border-gray-100 dark:border-[#222936] text-foreground"
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-muted">
                        {entry.at}
                      </td>
                      <td className="px-3 py-2">
                        <BackupTypeBadge type={entry.type} />
                      </td>
                      <td className="px-3 py-2 truncate max-w-[180px]">
                        {entry.by || "Unknown admin"}
                      </td>
                      <td className="px-3 py-2 text-right text-muted">
                        {entry.collections?.length || 0}
                      </td>
                      <td className="px-3 py-2 text-right text-muted">
                        {(entry.totalDocuments || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Delete Admin Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        title="Remove admin"
        description={deleteTarget ? `Are you sure you want to remove "${deleteTarget.name}" from admins? They will be demoted to member.` : ""}
        onConfirm={() => { removeAdmin(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Add Admin Modal */}
      {showAddModal && <AddAdminModal
        onClose={() => setShowAddModal(false)}
        onAdded={() => { setShowAddModal(false); fetchAdmins(); }}
        updateRole={updateRole}
        setAdminRoles={setAdminRoles}
      />}

      {/* Import Backup Confirmation */}
      <ConfirmModal
        isOpen={confirmImport}
        variant="danger"
        title="Restore this backup?"
        message="This will replace all current data. Are you sure? A safety backup of the current data will be downloaded to your device first, and the restore will not run until it is saved."
        confirmLabel="Download Safety Backup &amp; Restore"
        isLoading={importing}
        onConfirm={handleConfirmImport}
        onCancel={() => { setConfirmImport(false); setPendingImport(null); }}
      />

    </div>
  );
}

function AddAdminModal({ onClose, onAdded, updateRole, setAdminRoles }) {
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState({});

  const {
    members, loading,
    search, setSearch,
    // "user" was removed as a role; promote from member and scanner only.
  } = useMembersList({ initialRoles: ["member", "scanner"] });

  const nonAdminMembers = members.filter((m) => !VIEW_ROLES.includes(m.role));
  const selectedCount = Object.keys(selected).length;

  const toggleSelect = (member) => {
    setSelected((prev) => {
      if (prev[member.id]) {
        const { [member.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [member.id]: member };
    });
  };

  const addAsAdmins = async () => {
    setAdding(true);
    const users = Object.values(selected);
    for (const m of users) {
      await updateRole(m.id, "board", m.role, setAdminRoles);
    }
    setAdding(false);
    onAdded();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#222936]">
          <h3 className="text-base font-bold text-foreground">Add Admin</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-muted hover:text-foreground transition-colors rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-[#222936]">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
            <Search className="w-4 h-4 text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none border-none p-0"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-muted" />
            </div>
          ) : nonAdminMembers.length === 0 ? (
            <p className="text-sm text-muted text-center py-10">No users found.</p>
          ) : (
            nonAdminMembers.map((member) => {
              const isSelected = !!selected[member.id];
              return (
                <button
                  key={member.id}
                  onClick={() => toggleSelect(member)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                    isSelected
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : "hover:bg-muted/5"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full ${member.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                  >
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted truncate">{member.email}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-[#222936]">
          <span className="text-sm text-muted">
            {selectedCount} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={addAsAdmins}
              disabled={selectedCount === 0 || adding}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {adding && <Loader2 size={14} className="animate-spin" />}
              Add As Admins
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
