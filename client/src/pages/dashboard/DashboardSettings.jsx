import React, { useState } from "react";
import {
  Save,
  Camera,
  Plus,
  Trash2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/* ─── Toggle Switch ────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ─── Role Select ──────────────────────────────────────────────── */
function RoleSelect({ value, onChange }) {
  const roles = ["Admin", "Super Admin", "Moderator"];
  const colors = {
    Admin: "bg-primary/10 text-primary border-primary/20",
    "Super Admin": "bg-teal-50 dark:bg-teal-900/25 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700/40",
    Moderator: "bg-indigo-50 dark:bg-indigo-900/25 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/40",
  };

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none text-[11px] font-bold px-2.5 py-1 pr-6 rounded-md border cursor-pointer focus:outline-none ${colors[value] || colors.Admin}`}
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <ChevronDown
        size={10}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
      />
    </div>
  );
}

/* ─── Section Card Wrapper ─────────────────────────────────────── */
function SectionCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm p-5 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Input Field ──────────────────────────────────────────────── */
function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
      />
    </div>
  );
}

/* ─── Mock Admins Data ─────────────────────────────────────────── */
const initialAdmins = [
  {
    id: 1,
    name: "Dr. Rania Ibrahim",
    email: "r.ibrahim@ieee-sb.edu",
    role: "Admin",
    initials: "RI",
    color: "bg-primary",
  },
  {
    id: 2,
    name: "Eng. Tarek Mousa",
    email: "t.mousa@ieee-sb.edu",
    role: "Super Admin",
    initials: "TM",
    color: "bg-teal-500",
  },
  {
    id: 3,
    name: "Nour El-Din Hassan",
    email: "n.hassan@ieee-sb.edu",
    role: "Moderator",
    initials: "NH",
    color: "bg-indigo-500",
  },
];

/* ─── Main Component ───────────────────────────────────────────── */
export default function DashboardSettings() {
  const { user } = useAuth();

  /* Admin Profile state */
  const [profile, setProfile] = useState({
    fullName: user?.name || "Dr. Rania Ibrahim",
    email: user?.email || "r.ibrahim@ieee-sb.edu",
    phone: "+20 100 123 4567",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* Website Configuration state */
  const [config, setConfig] = useState({
    branchName: "IEEE Student Branch — Faculty of Engineering",
    contactEmail: "contact@ieee-sb.edu",
    websiteUrl: "https://ieee-sb.edu",
    aboutText: "",
    allowRegistration: true,
  });

  /* User Permissions state */
  const [admins, setAdmins] = useState(initialAdmins);

  const updateProfile = (key, value) =>
    setProfile((p) => ({ ...p, [key]: value }));
  const updateConfig = (key, value) =>
    setConfig((c) => ({ ...c, [key]: value }));
  const updateAdminRole = (id, role) =>
    setAdmins((a) => a.map((admin) => (admin.id === id ? { ...admin, role } : admin)));
  const removeAdmin = (id) =>
    setAdmins((a) => a.filter((admin) => admin.id !== id));

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "RI";

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-4xl">
      {/* ─── Section 1: Admin Profile ──────────────────────────── */}
      <SectionCard>
        <h2 className="text-base font-bold text-foreground mb-5">
          Admin Profile
        </h2>

        {/* Avatar Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
              {initials}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-[#222936] flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <Camera size={11} className="text-muted" />
            </button>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {profile.fullName}
            </h3>
            <p className="text-xs text-muted">
              Super Admin — IEEE Student Branch
            </p>
            <button className="text-xs text-primary font-medium hover:underline mt-0.5">
              Change photo
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field
            label="Full Name"
            type="text"
            value={profile.fullName}
            onChange={(e) => updateProfile("fullName", e.target.value)}
          />
          <Field
            label="Email Address"
            type="email"
            value={profile.email}
            onChange={(e) => updateProfile("email", e.target.value)}
          />
          <Field
            label="Phone Number"
            type="tel"
            value={profile.phone}
            onChange={(e) => updateProfile("phone", e.target.value)}
          />
          <Field
            label="Current Password"
            type="password"
            value={profile.currentPassword}
            onChange={(e) => updateProfile("currentPassword", e.target.value)}
            placeholder="••••••••"
          />
          <Field
            label="New Password"
            type="password"
            value={profile.newPassword}
            onChange={(e) => updateProfile("newPassword", e.target.value)}
            placeholder="••••••••"
          />
          <Field
            label="Confirm Password"
            type="password"
            value={profile.confirmPassword}
            onChange={(e) => updateProfile("confirmPassword", e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm mt-1">
          <Save size={14} />
          Save Profile
        </button>
      </SectionCard>

      {/* ─── Section 2: Website Configuration ──────────────────── */}
      <SectionCard>
        <h2 className="text-base font-bold text-foreground mb-5">
          Website Configuration
        </h2>

        <div className="space-y-4 mb-4">
          <Field
            label="Branch Display Name"
            type="text"
            value={config.branchName}
            onChange={(e) => updateConfig("branchName", e.target.value)}
          />
          <Field
            label="Contact Email"
            type="email"
            value={config.contactEmail}
            onChange={(e) => updateConfig("contactEmail", e.target.value)}
          />
          <Field
            label="Branch Website URL"
            type="url"
            value={config.websiteUrl}
            onChange={(e) => updateConfig("websiteUrl", e.target.value)}
          />
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
              About Text
            </label>
            <textarea
              value={config.aboutText}
              onChange={(e) => updateConfig("aboutText", e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
            />
          </div>

          {/* Registration Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide">
                Registration Status
              </label>
              <p className="text-xs text-muted mt-0.5">
                Allow new member registrations
              </p>
            </div>
            <Toggle
              checked={config.allowRegistration}
              onChange={() =>
                updateConfig("allowRegistration", !config.allowRegistration)
              }
            />
          </div>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
          <Save size={14} />
          Save Configuration
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
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
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
                      value={admin.role}
                      onChange={(role) => updateAdminRole(admin.id, role)}
                    />
                  </td>
                  <td className="px-5 md:px-6 py-3 text-right">
                    <button
                      onClick={() => removeAdmin(admin.id)}
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

      {/* ─── Section 4: Danger Zone ────────────────────────────── */}
      <SectionCard className="border-red-200 dark:border-red-900/40">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-red-500" />
          <h2 className="text-base font-bold text-red-600 dark:text-red-400">
            Danger Zone
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg px-4 py-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Reset All Member Data
            </h4>
            <p className="text-xs text-muted">
              Permanently delete all registrations. This action cannot be
              undone.
            </p>
          </div>
          <button className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline whitespace-nowrap shrink-0">
            Delete All Data
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
