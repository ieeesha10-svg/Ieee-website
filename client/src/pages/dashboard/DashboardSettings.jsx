import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Save,
  Mail,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronDown,
  Trash2,
  Plus,
  Search,
  X,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
// Hooks
import { useUserUpdate } from "../../hooks/dashboard/useUserUpdate";
import { useUpdateRole } from "../../hooks/dashboard/useUpdateRole";
import { useSearchMembers } from "../../hooks/dashboard/useSearchMembers";
import DeleteModal from "../../components/DeleteModal";
import api from "../../utils/api";
import { ADMIN_ROLES } from '../../data/roles'
// Components
import Skeleton from "../../components/skeletons/DashSettingsSkeleton";

const ORDINAL_OPTIONS = [
  { label: "Prep", value: 0 },
  { label: "1st Year", value: 1 },
  { label: "2nd Year", value: 2 },
  { label: "3rd Year", value: 3 },
  { label: "4th Year", value: 4 },
  { label: "5th Year", value: 5 },
];

const COMMITTEE_OPTIONS = [
  { label: "Public Relations", value: "Public Relations" },
  { label: "Human Resources", value: "Human Resources" },
  { label: "Logistics", value: "Logistics" },
  { label: "Marketing", value: "Marketing" },
  { label: "Branding & Media", value: "Branding & Media" },
  { label: "Technical", value: "Technical" },
  { label: "Non-Technical", value: "Non-Technical" },
  { label: "Website", value: "Website" },
];

function SectionCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm p-5 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function Field({ label, disabled, ...props }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <input
        disabled={disabled}
        {...props}
        className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors ${
          disabled
            ? "border-gray-200 dark:border-[#222936] bg-gray-100 dark:bg-gray-800/60 text-muted cursor-not-allowed"
            : "border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
        }`}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors appearance-none pr-9"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      </div>
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

const AVATAR_COLORS = [
  "bg-blue-500", "bg-teal-500", "bg-orange-500", "bg-purple-500",
  "bg-yellow-500", "bg-green-500", "bg-red-400", "bg-cyan-600",
];

function pickColor(id) {
  const hash = String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}


function RoleSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
    >
      {ADMIN_ROLES.map((r) => (
        <option key={r} value={r}>
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </option>
      ))}
    </select>
  );
}

function mapAdmin(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role || "member",
    initials: u.name
      ? u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      : "??",
    color: pickColor(u._id),
  };
}

export default function DashboardSettings() {
  const { user } = useAuth();
  const {
    userData,
    loading,
    error: fetchError,
    savingProfile,
    savingPassword,
    updateProfile,
    updatePassword,
  } = useUserUpdate(user?._id);

  const [edits, setEdits] = useState({});

  const baseProfile = useMemo(() => ({
    fullName: userData?.name || "",
    phone: userData?.phone || "",
    age: userData?.age ?? "",
    university: userData?.university || "",
    college: userData?.college || "",
    yearOfStudy: userData?.yearOfStudy ?? "",
    committee: userData?.committee || "",
    interests: userData?.interests?.join(", ") || "",
    aboutMe: userData?.optionalData?.aboutMe || "",
  }), [userData]);

  const profile = useMemo(() => ({ ...baseProfile, ...edits }), [baseProfile, edits]);

  useEffect(() => {
    setEdits({});
  }, [userData]);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  const [admins, setAdmins] = useState([]);
  const [adminRoles, setAdminRoles] = useState({});
  const [adminsLoading, setAdminsLoading] = useState(true);
  const { updatingRole, updateRole } = useUpdateRole();

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const res = await api.get(`/users/all?role=${ADMIN_ROLES.join(",")}&limit=100`);
      const users = (res.data.users || []).map(mapAdmin);
      setAdmins(users);
      const rolesMap = {};
      users.forEach((a) => { rolesMap[a.id] = a.role; });
      setAdminRoles(rolesMap);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleRoleChange = (adminId, newRole) => {
    const previousRole = adminRoles[adminId];
    updateRole(adminId, newRole, previousRole, setAdminRoles);
  };

  const removeAdmin = async (id) => {
    const previousRole = adminRoles[id];
    updateRole(id, "member", previousRole, setAdminRoles);
    setAdmins((prev) => prev.filter((a) => a.id !== id));
  };

  const updateField = (key, value) =>
    setEdits((prev) => ({ ...prev, [key]: value }));

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  const handleSaveProfile = async () => {
    const payload = {
      name: profile.fullName,
      phone: profile.phone,
      age: profile.age !== "" ? Number(profile.age) : undefined,
      university: profile.university,
      college: profile.college,
      yearOfStudy: profile.yearOfStudy !== "" ? Number(profile.yearOfStudy) : undefined,
      committee: profile.committee,
      interests: profile.interests
        ? profile.interests.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      optionalData: { aboutMe: profile.aboutMe },
    };

    await updateProfile(payload);
  };

  const handleSavePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordMessage({ type: "error", text: "Please fill in all password fields." });
      return;
    }
    if (passwords.new.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    await updatePassword({
      currentPassword: passwords.current,
      newPassword: passwords.new,
      confirmNewPassword: passwords.confirm,
    });
    setPasswords({ current: "", new: "", confirm: "" });
    setPasswordMessage({ type: "", text: "" });
  };

  if (loading) return <Skeleton />;

  if (fetchError) {
    return (
      <div className="min-h-screen p-4 md:p-6 max-w-4xl flex items-center justify-center">
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-red-200 dark:border-red-900/40 shadow-sm p-8 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          <p className="text-foreground font-semibold text-lg mb-1">Failed to load profile</p>
          <p className="text-muted text-sm">{fetchError}</p>
        </div>
    </div>
  );
}

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-4xl">

      {/* ─── Section 1: Admin Profile ──────────────────────────── */}
      <SectionCard>
        <h2 className="text-xl font-bold text-foreground mb-5">
          Admin Profile
        </h2>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-white shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {profile.fullName || "User"}
              </h3>
              <p className="flex gap-2 items-center text-xs text-muted">
                <Mail size={13} /> {userData?.email || ""}
              </p>
            </div>
          </div>
        </div>

        <MessageBanner message={profileMessage} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field
            label="Full Name"
            type="text"
            value={profile.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
          />
          <Field
            label="Phone Number"
            type="tel"
            value={profile.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
          <Field
            label="Email (read-only)"
            type="email"
            value={userData?.email || ""}
            disabled
          />
          <Field
            label="Age"
            type="number"
            min={15}
            max={99}
            value={profile.age}
            onChange={(e) => updateField("age", e.target.value)}
          />
          <Field
            label="University"
            type="text"
            value={profile.university}
            onChange={(e) => updateField("university", e.target.value)}
          />
          <Field
            label="College"
            type="text"
            value={profile.college}
            onChange={(e) => updateField("college", e.target.value)}
          />
          <SelectField
            label="Year of Study"
            value={profile.yearOfStudy}
            onChange={(e) => updateField("yearOfStudy", e.target.value)}
            options={ORDINAL_OPTIONS}
          />
          <SelectField
            label="Committee"
            value={profile.committee}
            onChange={(e) => updateField("committee", e.target.value)}
            options={COMMITTEE_OPTIONS}
          />
          <div className="sm:col-span-2">
            <Field
              label="Interests (comma-separated)"
              type="text"
              value={profile.interests}
              onChange={(e) => updateField("interests", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
              About Me
            </label>
            <textarea
              value={profile.aboutMe}
              onChange={(e) => updateField("aboutMe", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {savingProfile ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Save Profile
        </button>
      </SectionCard>

      {/* ─── Section 2: Change Password ────────────────────────── */}
      <SectionCard>
        <h2 className="text-xl font-bold text-foreground mb-5">
          Change Password
        </h2>

        <MessageBanner message={passwordMessage} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwords.current}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, current: e.target.value }))
                }
                placeholder="Enter current password"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((s) => ({
                    ...s,
                    current: !s.current,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showPasswords.current ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwords.new}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, new: e.target.value }))
                }
                placeholder="New password"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((s) => ({ ...s, new: !s.new }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showPasswords.new ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, confirm: e.target.value }))
                }
                placeholder="Confirm new password"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((s) => ({
                    ...s,
                    confirm: !s.confirm,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showPasswords.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSavePassword}
          disabled={savingPassword}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {savingPassword ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Update Password
        </button>
      </SectionCard>

      {/* ─── Section 3: User Permissions ───────────────────────── */}
            <SectionCard>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    User Permissions
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Manage admin roles and access levels
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <Plus size={14} />
                  Add Admin
                </button>
              </div>
      
              {/* Admins Table */}
              <div className="overflow-x-auto -mx-5 md:-mx-6">
                <table className="w-full min-w-[500px]">
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
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                          {admin.email}
                        </td>
                        <td className="px-4 py-3">
                          <RoleSelect
                            value={adminRoles[admin.id] || admin.role}
                            onChange={(role) => handleRoleChange(admin.id, role)}
                          />
                        </td>
                        <td className="px-5 md:px-6 py-3 text-right">
                          <button
                            onClick={() => setDeleteTarget(admin)}
                            className="p-1.5 text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
      
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm mt-5">
                <Save size={14} />
                Save Permissions
              </button>
            </SectionCard>

      {/* ─── Delete Admin Modal ──────────────────────────── */}
      <DeleteModal
        isOpen={!!deleteTarget}
        title="Remove admin"
        description={deleteTarget ? `Are you sure you want to remove "${deleteTarget.name}" from admins? They will be demoted to member.` : ""}
        onConfirm={() => { removeAdmin(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ─── Add Admin Modal ──────────────────────────── */}
      {showAddModal && <AddAdminModal
        onClose={() => setShowAddModal(false)}
        onAdded={() => { setShowAddModal(false); fetchAdmins(); }}
      />}

    </div>
  );
}

function AddAdminModal({ onClose, onAdded }) {
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState({});

  const {
    members, loading,
    search, setSearch,
    page, setPage, totalPages,
  } = useSearchMembers({ initialRoles: ["member", "user", "scanner"] });

  const nonAdminMembers = members.filter((m) => !ADMIN_ROLES.includes(m.role));
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
    console.log("Promoting users:", users);
    try {
      const results = await Promise.allSettled(
        users.map((m) => {
          console.log("Calling PATCH /users/members/" + m.id, { role: "admin" });
          return api.patch(`/users/members/${m.id}`, { role: "board" });
        })
      );
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        failed.forEach((r) => console.error("Promote user failed:", r.reason?.response?.data || r.reason));
        toast.error(`Failed to promote ${failed.length} user(s)`);
      } else {
        toast.success(`${selectedCount} user(s) promoted to admin`);
        onAdded();
      }
    } catch (err) {
      console.error("Unexpected error promoting users:", err);
      toast.error("Failed to promote some users");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#222936]">
          <h3 className="text-base font-bold text-foreground">Add Admin</h3>
          <button
            onClick={onClose}
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