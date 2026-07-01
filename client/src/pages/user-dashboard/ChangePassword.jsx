import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import api from "../../utils/api";

// ─── Defined OUTSIDE the component to prevent remount on every render ─────────
function PasswordField({ label, name, placeholder, value, show, onChange, onToggle }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <label className="font-lakes font-bold text-[12px] md:text-[13px] leading-[18px] tracking-[0.69px] uppercase text-[#3A5068] dark:text-[#7A96B2]">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-[#F7FAFF] dark:bg-[#1A1F2E] border-[0.8px] border-[#D8E8F8] dark:border-[#222936] rounded-[12px] py-[12px] pl-[16px] pr-[44px] text-[#0A1628] dark:text-white text-[14.4px] font-gotham font-light leading-[17px] placeholder:text-[#7A96B2] placeholder:font-gotham placeholder:font-light outline-none transition-all duration-200 focus:border-[#0096FF] focus:ring-1 focus:ring-[#0096FF]/30 dark:focus:border-primary dark:focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#7A96B2] hover:text-[#0096FF] dark:hover:text-primary transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePassword() {
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
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleClear = () => {
    setPasswords({ current: "", new: "", confirm: "" });
    setMessage({ type: "", text: "" });
  };

  const handleUpdatePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }
    if (passwords.new.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "New passwords do not match!" });
      return;
    }

    setIsSaving(true);
    setMessage({ type: "", text: "" });
    try {
      // NOTE: As per API documentation, there is no official route documented for password changes.
      // The current implementation attempts to call PUT /api/users/update-password.
      // Please verify with the backend developer if this endpoint is supported or needs to be added.
      await api.put("/users/update-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update password.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const tips = [
    "At least 8 characters long",
    "Mix uppercase, lowercase & numbers",
    "Include at least one special character",
    "Avoid using personal information",
  ];

  return (
    <div className="space-y-4 md:space-y-5">

      {/* ─── Main Form Card ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#13161D] rounded-[20px] md:rounded-[24px] border-[0.8px] border-[rgba(0,120,255,0.11)] dark:border-[#222936] shadow-[0px_6px_24px_rgba(0,100,220,0.08)] dark:shadow-none p-6 md:p-8 lg:p-10 transition-colors">

        {/* Header */}
        <div className="flex items-center gap-[12px] mb-[28px] md:mb-[32px]">
          <div className="w-[46px] h-[46px] rounded-[14px] bg-gradient-to-br from-[#FF6B35] to-[#CC3D00] flex items-center justify-center text-white shrink-0 shadow-[0px_4px_14px_rgba(255,107,53,0.3)]">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="font-gotham font-normal text-[19px] leading-[23px] tracking-[-0.36px] text-[#0A1628] dark:text-white">
              Change Password
            </h2>
            <p className="font-lakes font-medium text-[13px] leading-[18px] text-[#7A96B2] mt-[2px]">
              Keep your account secure
            </p>
          </div>
        </div>

        {/* Feedback Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all ${
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
        )}

        {/* Password Fields */}
        <div className="space-y-[22px] mb-[28px]">
          {/* Current Password — full width */}
          <PasswordField
            label="Current Password"
            name="current"
            placeholder="Enter current password"
            value={passwords.current}
            show={showPasswords.current}
            onChange={handleChange}
            onToggle={() => toggleShow("current")}
          />

          {/* New + Confirm — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] md:gap-[20px]">
            <PasswordField
              label="New Password"
              name="new"
              placeholder="New password"
              value={passwords.new}
              show={showPasswords.new}
              onChange={handleChange}
              onToggle={() => toggleShow("new")}
            />
            <PasswordField
              label="Confirm New Password"
              name="confirm"
              placeholder="Confirm new password"
              value={passwords.confirm}
              show={showPasswords.confirm}
              onChange={handleChange}
              onToggle={() => toggleShow("confirm")}
            />
          </div>
        </div>

        {/* Action Buttons — right aligned */}
        <div className="flex justify-end items-center gap-[10px]">
          <button
            onClick={handleClear}
            disabled={isSaving}
            className="px-[26px] py-[13px] rounded-[12px] border-[0.8px] border-[#D8E8F8] dark:border-[#222936] font-lakes font-bold text-[14px] leading-[20px] tracking-[0.14px] text-[#3A5068] dark:text-muted bg-white dark:bg-transparent hover:bg-[#F7FAFF] dark:hover:bg-[#1A1F2E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            onClick={handleUpdatePassword}
            disabled={isSaving}
            className="flex items-center gap-[8px] px-[26px] py-[13px] rounded-[12px] text-white font-lakes font-bold text-[13.92px] leading-[19px] tracking-[0.14px] bg-[linear-gradient(135deg,#0096FF_0%,#0055CC_100%)] shadow-[0px_4px_16px_rgba(0,150,255,0.35)] hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <ShieldCheck size={15} />
                Update Password
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Password Tips Card ───────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#13161D] rounded-[20px] md:rounded-[24px] border-[0.8px] border-[rgba(0,120,255,0.11)] dark:border-[#222936] shadow-[0px_6px_24px_rgba(0,100,220,0.08)] dark:shadow-none p-6 md:p-8 lg:p-10 transition-colors">
        <h4 className="font-lakes font-bold text-[13.6px] leading-[19px] text-[#3A5068] dark:text-white mb-[20px]">
          Password Tips
        </h4>
        <ul className="space-y-[15px]">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-center gap-[10px]">
              <span className="font-[Outfit] font-normal text-[12.8px] leading-[16px] text-[#0096FF] select-none">
                ✓
              </span>
              <span className="font-gotham font-[350] text-[12.8px] md:text-[13px] leading-[15px] text-[#3A5068] dark:text-[#94A3B8]">
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
