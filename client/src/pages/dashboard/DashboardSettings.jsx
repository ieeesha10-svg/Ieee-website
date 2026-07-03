import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  Camera,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUserUpdate } from "../../hooks/dashboard/useUserUpdate";

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

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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

function Skeleton() {
  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-4xl animate-pulse">
      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] shadow-sm p-5 md:p-6 space-y-4">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-52 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
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

    const result = await updateProfile(payload);
    setProfileMessage({ type: result.success ? "success" : "error", text: result.message });
    setTimeout(() => setProfileMessage({ type: "", text: "" }), 4000);
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

    const result = await updatePassword({
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });
    setPasswordMessage({ type: result.success ? "success" : "error", text: result.message });
    if (result.success) setPasswords({ current: "", new: "", confirm: "" });
    setTimeout(() => setPasswordMessage({ type: "", text: "" }), 4000);
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
        <h2 className="text-base font-bold text-foreground mb-5">
          Admin Profile
        </h2>

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
              {profile.fullName || "User"}
            </h3>
            <p className="text-xs text-muted">
              {userData?.email || ""}
            </p>
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
        <h2 className="text-base font-bold text-foreground mb-5">
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

      {/* ─── Section 3: Danger Zone ────────────────────────────── */}
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
              Permanently delete all registrations. This action cannot be undone.
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