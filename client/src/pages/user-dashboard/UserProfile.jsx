import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  User,
  Edit,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

import InputBox from "../../components/ui/InputBox";
import api from "../../utils/api";
import { COLLEGE_OPTIONS, OTHER_COLLEGE } from "../../data/collegeOptions";
import { ORDINAL_OPTIONS } from "../../data/ordinalMap";

export default function UserProfile() {
  const { userData, setUserData, isOffline } = useOutletContext();

  const isKnownCollege = (c) => COLLEGE_OPTIONS.includes(c);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });
  const [originalData, setOriginalData] = useState(userData);
  const [collegeOption, setCollegeOption] = useState(
    isKnownCollege(userData.college) ? userData.college : ""
  );
  const [isOtherCollege, setIsOtherCollege] = useState(
    !!userData.college && !isKnownCollege(userData.college)
  );
  const [customCollege, setCustomCollege] = useState(
    !!userData.college && !isKnownCollege(userData.college) ? userData.college : ""
  );

  useEffect(() => {
    setOriginalData(userData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCollegeSelect = (e) => {
    const value = e.target.value;
    if (value === OTHER_COLLEGE) {
      setIsOtherCollege(true);
      setCustomCollege("");
      setUserData((prev) => ({ ...prev, college: "" }));
    } else {
      setIsOtherCollege(false);
      setCustomCollege("");
      setCollegeOption(value);
      setUserData((prev) => ({ ...prev, college: value }));
    }
  };

  const handleCustomCollege = (e) => {
    setCustomCollege(e.target.value);
    setUserData((prev) => ({ ...prev, college: e.target.value }));
  };

  const handleCancel = () => {
    setUserData(originalData);
    const c = originalData.college;
    setCollegeOption(isKnownCollege(c) ? c : "");
    setIsOtherCollege(!!c && !isKnownCollege(c));
    setCustomCollege(!!c && !isKnownCollege(c) ? c : "");
    setIsEditing(false);
    setSaveMessage({ type: "", text: "" });
  };

  const handleSave = async () => {
    if (isOffline) return;
    setIsSaving(true);
    setSaveMessage({ type: "", text: "" });
    try {
      const payload = {
        name: userData.fullName,
        phone: userData.phone,
        age: userData.age !== "" && userData.age != null ? Number(userData.age) : undefined,
        ...(userData.position === "professional"
          ? {
              organization: userData.organization,
              roleInOrganization: userData.roleInOrganization,
              yearsOfExperience: userData.yearsOfExperience ? Number(userData.yearsOfExperience) : undefined,
              reasonForRegistration: userData.reasonForRegistration,
            }
          : {
              university: userData.university,
              college: userData.college,
              yearOfStudy: userData.yearOfStudy !== "" ? Number(userData.yearOfStudy) : undefined,
            }),
        optionalData: { aboutMe: userData.aboutMe },
      };

      await api.put(`/users/profile/${userData._id}`, payload);

      setOriginalData(userData);
      setIsEditing(false);
      setSaveMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage({ type: "", text: "" }), 3000);
    }
  };

  // ─── Action Buttons (helper function, NOT a component) ────────────────────
  const renderActionButtons = () => (
    <>
      <button
        onClick={handleSave}
        disabled={isSaving || isOffline || !isEditing}
        className="bg-[#0077CC] dark:bg-brand-linear border-[0.8px] border-[rgba(0,119,204,0.2)] dark:border-transparent rounded-[10px] text-white px-6 md:px-8 py-[12px] md:py-[14px] font-lakes font-bold text-[14px] md:text-[15px] flex items-center justify-center gap-2 min-w-[110px] md:min-w-[129px] shadow-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {isSaving ? <Loader2 size={18} className="animate-spin" /> : "Save"}
      </button>
      <button
        onClick={() => {
          if (isEditing) handleCancel();
          else setIsEditing(true);
        }}
        disabled={isSaving}
        className="bg-[#EBF4FF] dark:bg-transparent border-[0.8px] border-[rgba(0,150,255,0.2)] dark:border-border text-[#0096FF] dark:text-primary px-6 py-[12px] md:py-[14px] rounded-[10px] font-lakes font-bold text-[14px] md:text-[15px] flex items-center gap-2 hover:opacity-80 dark:hover:bg-input transition-colors disabled:opacity-50 min-w-[110px] md:min-w-[129px] justify-center"
      >
        {isEditing ? (
          "Cancel"
        ) : (
          <>
            <Edit size={16} /> Edit
          </>
        )}
      </button>
    </>
  );

  return (
    <div className="bg-white dark:bg-[#13161D] rounded-[20px] md:rounded-[24px] border-[0.8px] border-[rgba(0,120,255,0.11)] dark:border-[#222936] shadow-sm p-5 sm:p-6 md:p-8 lg:p-10">
      {/* Form Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-[40px] md:w-[46px] h-[40px] md:h-[46px] rounded-[12px] md:rounded-[14px] bg-[linear-gradient(135deg,#0096FF_0%,#0055CC_100%)] flex items-center justify-center text-white shrink-0">
            <User size={18} className="md:w-[20px] md:h-[20px]" />
          </div>
          <div>
            <h2 className="text-[16px] md:text-[17.92px] font-gotham font-medium text-[#0A1628] dark:text-white mb-1">
              Personal Information
            </h2>
            <p className="text-[#7A96B2] font-[Outfit] text-[12px] md:text-[12.8px]">
              Manage your profile details
            </p>
          </div>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex gap-3">{renderActionButtons()}</div>
      </div>

      {/* Save/Error Message */}
      {saveMessage.text && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            saveMessage.type === "success"
              ? "bg-green-50/50 text-green-600"
              : "bg-red-50/50 text-red-600"
          }`}
        >
          {saveMessage.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          {saveMessage.text}
        </div>
      )}

      {/* Form Fields */}
      <div className="relative pl-4 md:pl-7 lg:pl-9 mt-4 md:mt-6">
        {/* Gradient Line */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] md:w-[4px] rounded-full bg-[linear-gradient(180deg,#1FA6FF_0%,#2AADFF_50%,#2DB0FF_75%,#0088FF_100%)] z-[3]" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 md:gap-y-6 font-lakes">
          <InputBox
            label="Full Name"
            name="fullName"
            value={userData.fullName}
            isEditing={isEditing}
            onChange={handleChange}
            placeholder="name of user"
          />
          <InputBox
            label="Phone"
            name="phone"
            value={userData.phone}
            isEditing={isEditing}
            onChange={handleChange}
            placeholder="+20 100 000 0000"
          />
          <InputBox
            label="Email"
            name="email"
            value={userData.email}
            isEditing={false}
            onChange={handleChange}
            type="email"
            placeholder="name@gmail.com"
          />
          {userData.position === "professional" ? (
            <>
              <InputBox
                label="Organization / Company"
                name="organization"
                value={userData.organization}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="Google"
              />
              <InputBox
                label="Role in Organization"
                name="roleInOrganization"
                value={userData.roleInOrganization}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="Software Engineer"
              />
              <InputBox
                label="Years of Experience"
                name="yearsOfExperience"
                value={userData.yearsOfExperience}
                isEditing={isEditing}
                onChange={handleChange}
                type="number"
                placeholder="2"
              />
            </>
          ) : (
            <>
              <InputBox
                label="University"
                name="university"
                value={userData.university}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="shorouk academy"
              />
              <div className="bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-[24px] p-[18.8px] flex flex-col gap-[6px] transition-colors">
                <label className="text-[#475569] dark:text-muted font-bold text-[13px] leading-[16px] font-[Inter] tracking-wide">
                  College / Faculty
                </label>
                <div className="relative">
                  <select
                    name="college"
                    value={isOtherCollege ? OTHER_COLLEGE : collegeOption}
                    onChange={handleCollegeSelect}
                    disabled={!isEditing}
                    className="w-full bg-[#F1F5F9] dark:bg-transparent dark:text-white border-[0.8px] border-[#CBD5E1] dark:border-transparent rounded-[12px] p-[12px] text-[#64748B] text-[14px] leading-[17px] font-[Inter] outline-none transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    <option value="" disabled hidden>Select College / Faculty</option>
                    {COLLEGE_OPTIONS.map((c) => (
                      <option className="text-black" key={c} value={c}>{c}</option>
                    ))}
                    <option className="text-black" value={OTHER_COLLEGE}>Other</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted opacity-60 pointer-events-none"
                  />
                </div>
              </div>
              {isOtherCollege && (
                <div className="bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-[24px] p-[18.8px] flex flex-col gap-[6px] transition-colors lg:col-span-2">
                  <label className="text-[#475569] dark:text-muted font-bold text-[13px] leading-[16px] font-[Inter] tracking-wide">
                    Specify College / Faculty
                  </label>
                  <input
                    type="text"
                    value={customCollege}
                    onChange={handleCustomCollege}
                    disabled={!isEditing}
                    placeholder="Type your college / faculty"
                    className="bg-[#F1F5F9] dark:bg-transparent border-[0.8px] border-[#CBD5E1] dark:border-transparent rounded-[12px] p-[12px] text-[#64748B] dark:text-foreground text-[14px] leading-[17px] font-[Inter] outline-none transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed placeholder:text-[#64748B]/60 focus:border-[#0096FF] focus:ring-1 focus:ring-[#0096FF] dark:focus:border-primary dark:focus:ring-primary"
                  />
                </div>
              )}
              <div className="bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-[24px] p-[18.8px] flex flex-col gap-[6px] transition-colors">
                <label className="text-[#475569] dark:text-muted font-bold text-[13px] leading-[16px] font-[Inter] tracking-wide">
                  Year of Study
                </label>
                <div className="relative">
                  <select
                    name="yearOfStudy"
                    value={userData.yearOfStudy ?? ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full bg-[#F1F5F9] dark:bg-transparent border-[0.8px] border-[#CBD5E1] dark:border-transparent rounded-[12px] p-[12px] text-[#64748B] dark:text-foreground text-[14px] leading-[17px] font-[Inter] outline-none transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    <option value="" disabled hidden>Select Year of Study</option>
                    {ORDINAL_OPTIONS.map(({ label, value }) => (
                      <option className="text-black" key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted opacity-60 pointer-events-none"
                  />
                </div>
              </div>
            </>
          )}
          <InputBox
            label="Age"
            name="age"
            value={userData.age}
            isEditing={isEditing}
            onChange={handleChange}
            type="number"
            placeholder="Enter your age"
          />

          {/* Role (read-only, hidden for basic users) */}
          {userData.role !== "user" && (
            <div className="bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-[16px] md:rounded-[24px] p-[14px] md:p-[18.8px] flex flex-col gap-1 md:gap-[6px] relative transition-colors">
              <label className="text-[#475569] dark:text-muted font-bold text-[12px] md:text-[13px] tracking-wide">
                Role
              </label>
              <input
                disabled
                value={userData.role}
                className="bg-[#F1F5F9] dark:bg-transparent border-[0.8px] border-[#CBD5E1] dark:border-transparent rounded-[10px] md:rounded-[12px] p-2 md:p-[12px] text-[#64748B] dark:text-white text-[13px] md:text-[14px] outline-none cursor-not-allowed"
              />
            </div>
          )}

          {/* About Me Textarea */}
          <div className="bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-[16px] md:rounded-[24px] p-[14px] md:p-[18.8px] flex flex-col gap-1 md:gap-[6px] lg:col-span-2 transition-colors">
            <label className="text-[#475569] dark:text-muted font-bold text-[12px] md:text-[13px] tracking-wide">
              {userData.position === "professional" ? "Reason for Registration" : "About Me"}
            </label>
            <textarea
              name={userData.position === "professional" ? "reasonForRegistration" : "aboutMe"}
              value={userData.position === "professional" ? userData.reasonForRegistration : userData.aboutMe}
              onChange={handleChange}
              disabled={!isEditing}
              className="bg-[#F1F5F9] dark:bg-transparent border-[0.8px] border-[#CBD5E1] dark:border-[#222936] dark:border-transparent rounded-[10px] md:rounded-[12px] p-2 md:p-[12px] text-[#64748B] dark:text-white text-[13px] md:text-[14px] resize-none h-[50px] md:h-[55px] disabled:opacity-80 outline-none focus:border-[#0096FF] focus:ring-1 focus:ring-[#0096FF] dark:focus:border-primary dark:focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="flex lg:hidden gap-3 mt-8">{renderActionButtons()}</div>
      </div>
    </div>
  );
}
