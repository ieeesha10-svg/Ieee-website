import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  User,
  Lock,
  Users,
  Calendar,
  Activity,
  Settings,
  Edit,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  RefreshCcw,
  ChevronDown,
} from "lucide-react";

import InputBox from "../../components/InputBox";
import { SidebarSection, NavItem } from "../../components/UserSidebar";
import ProfileBadge from "../../components/ProfileBadge";
import api from "../../utils/api";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });

  const [userData, setUserData] = useState({
    _id: "",
    fullName: "",
    email: "",
    phone: "",
    role: "",
    age: "",
    university: "",
    college: "",
    aboutMe: "",
  });
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await api.get("/users/profile");

      const user = response.data?.user || response.data;

      const fetchedData = {
        _id: user._id || "",
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "member",
        age: user.age || "",
        university: user.university || "",
        college: user.college || "",
        aboutMe: user.optionalData?.aboutMe || "",
      };

      setUserData(fetchedData);
      setOriginalData(fetchedData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setFetchError("Failed to load profile data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCancel = () => {
    setUserData(originalData);
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
        age: Number(userData.age),
        university: userData.university,
        college: userData.college,
        optionalData: { aboutMe: userData.aboutMe },
      };

      // 2. إرسال البيانات للباك إند
      await api.put(`/users/${userData._id}`, payload);

      setOriginalData(userData);
      setIsEditing(false);
      setSaveMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Error saving data:", error);
      setSaveMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage({ type: "", text: "" }), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-main flex flex-col items-center justify-center gap-4 text-foreground">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-main flex flex-col items-center justify-center gap-4 text-foreground p-4">
        <AlertTriangle className="text-red-500 w-16 h-16 mb-2" />
        <h2 className="font-gotham text-2xl font-bold">Oops!</h2>
        <button
          onClick={fetchUserData}
          className="mt-4 bg-primary px-6 py-2 rounded-lg text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  // مكوّن أزرار الحفظ (عشان نستخدمه مرتين: مرة للديسكتوب فوق، ومرة للموبايل تحت)
  const ActionButtons = () => (
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
        className="bg-[#EBF4FF] dark:bg-transparent border-[0.8px] border-[rgba(0,150,255,0.2)] dark:border-[#E4EAF1] dark:border-border text-[#0096FF] dark:text-primary px-6 py-[12px] md:py-[14px] rounded-[10px] font-lakes font-bold text-[14px] md:text-[15px] flex items-center gap-2 hover:opacity-80 dark:hover:bg-input transition-colors disabled:opacity-50 min-w-[110px] md:min-w-[129px] justify-center"
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
    <div className="relative min-h-screen bg-main text-foreground pb-12 overflow-hidden transition-colors duration-300">
      {isOffline && (
        <div className="bg-red-500 text-white p-3 flex justify-center items-center gap-3 font-lakes text-sm">
          <WifiOff size={18} /> You are currently offline.
        </div>
      )}

      <div className="max-w-[1304px] mx-auto mt-6 md:mt-8 lg:mt-12 px-4 relative z-10">
        {/* === Profile Banner === */}
        <div className="rounded-[24px] md:rounded-[28px] pt-[24px] md:pt-[36px] px-[20px] md:px-[40px] pb-6 md:pb-[36px] flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 relative overflow-hidden text-white transition-all duration-300 bg-[linear-gradient(135deg,#0077CC_0%,#0096FF_55%,#33B5FF_100%)] shadow-[0px_12px_48px_rgba(0,100,220,0.18)] dark:bg-[linear-gradient(135deg,#001A40_0%,#002F6B_35%,#0066BB_70%,#0088EE_100%)] dark:shadow-[0px_20px_60px_rgba(0,0,0,0.7),0px_0px_0px_1px_rgba(0,150,255,0.2),inset_0px_1px_0px_rgba(255,255,255,0.08)]">
          <div className="relative flex-shrink-0 z-10">
            <div className="w-[80px] md:w-[96px] h-[80px] md:h-[96px] rounded-[48px] border-[2.4px] flex items-center justify-center uppercase backdrop-blur-sm transition-all duration-300 border-[rgba(255,255,255,0.4)] bg-[linear-gradient(135deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.1)_100%)] shadow-[0px_8px_32px_rgba(0,0,0,0.18)] dark:border-white/30 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.06)_100%)] dark:shadow-[0px_8px_32px_rgba(0,0,0,0.5),0px_0px_0px_4px_rgba(0,150,255,0.15)]">
              <span className="font-gotham font-medium text-[28px] md:text-[35.2px] leading-[42px] tracking-[-1.056px] text-white">
                {userData.fullName ? userData.fullName.substring(0, 2) : "AM"}
              </span>
            </div>
            <div
              className={`absolute bottom-0 right-0 w-[20px] md:w-[24px] h-[20px] md:h-[24px] border-[2.4px] rounded-[12px] transition-all duration-300 ${isOffline ? "bg-gray-400 border-white dark:border-[#13161D] shadow-none" : "bg-[#1BCC6E] border-white shadow-[0px_2px_6px_rgba(0,0,0,0.15)] dark:border-[#13161D] dark:shadow-[0px_0px_8px_rgba(27,204,110,0.5)]"}`}
            ></div>
          </div>

          <div className="flex-1 text-center md:text-left z-10 md:pt-2">
            <p className="font-lakes font-bold text-[9px] md:text-[11.52px] leading-[16px] tracking-[1.152px] uppercase text-white/65 dark:text-white/55 mb-[6px] transition-all duration-300">
              IEEE EGYPT • EL SHOROUK ACADEMY STUDENT BRANCH
            </p>
            <h1 className="font-gotham font-medium text-[28px] md:text-[40px] leading-[37px] tracking-[-1.008px] text-white mb-3 transition-all duration-300">
              {userData.fullName || "Ahmed Mostafa"}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-[10px]">
              <ProfileBadge
                text={
                  userData.committee
                    ? `${userData.committee} Committee`
                    : "Technical Committee"
                }
              />
              <ProfileBadge
                text={
                  userData.college
                    ? `3rd Year • ${userData.college}`
                    : "3rd Year • Engineering"
                }
              />
              <ProfileBadge text="Member since 2022" />
            </div>
          </div>
        </div>

        {/* === Grid Layout === */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mt-6 lg:mt-10">
          {/* Left Sidebar (Stacked on mobile) */}
          <div className="w-full lg:w-[308px] flex-shrink-0 space-y-6 md:space-y-8">
            <SidebarSection title="Account">
              <NavItem
                icon={<LayoutGrid size={20} />}
                title="Overview"
                subtitle="Dashboard & stats"
              />
              <NavItem
                icon={<User size={20} />}
                title="User Profile"
                subtitle="Personal information"
                isActive
              />
              <NavItem
                icon={<Lock size={20} />}
                title="Change Password"
                subtitle="Security settings"
              />
            </SidebarSection>

            <SidebarSection title="IEEE Activity">
              <NavItem
                icon={<Users size={20} />}
                title="My Committees"
                subtitle="Groups & teams"
              />
              <NavItem
                icon={<Calendar size={20} />}
                title="Attended Events"
                subtitle="Bookmarked events"
              />
              <NavItem
                icon={<Activity size={20} />}
                title="Activity History"
                subtitle="Timeline of actions"
                hasNotification
              />
            </SidebarSection>

            <SidebarSection title="Preferences">
              <NavItem
                icon={<Settings size={20} />}
                title="Settings"
                subtitle="App preferences"
              />
            </SidebarSection>
          </div>

          {/* Right Form Container */}
          <div className="flex-1 relative">
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

                {/* Desktop Buttons (Hidden on mobile) */}
                <div className="hidden lg:flex gap-3">
                  <ActionButtons />
                </div>
              </div>

              {saveMessage.text && (
                <div
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${saveMessage.type === "success" ? "bg-green-50/50 text-green-600" : "bg-red-50/50 text-red-600"}`}
                >
                  {saveMessage.type === "success" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                  {saveMessage.text}
                </div>
              )}

              {/* Form Grid Container */}
              <div className="relative pl-4 md:pl-7 lg:pl-9 mt-4 md:mt-6">
                {/* Gradient Line */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] md:w-[4px] rounded-full bg-[linear-gradient(180deg,#1FA6FF_0%,#2AADFF_50%,#2DB0FF_75%,#0088FF_100%)] z-[3]"></div>

                {/* Inputs Grid (1 col on mobile, 2 on lg screens) */}
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
                  <InputBox
                    label="University"
                    name="university"
                    value={userData.university}
                    isEditing={isEditing}
                    onChange={handleChange}
                    placeholder="shorouk academy"
                  />
                  <InputBox
                    label="College"
                    name="college"
                    value={userData.college}
                    isEditing={isEditing}
                    onChange={handleChange}
                    placeholder="Engineering"
                  />

                  {/* Role Dropdown */}
                  {/* Role Dropdown */}
                  <div className="bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-[16px] md:rounded-[24px] p-[14px] md:p-[18.8px] flex flex-col gap-1 md:gap-[6px] relative transition-colors">
                    <label className="text-[#475569] dark:text-muted font-bold text-[12px] md:text-[13px] tracking-wide">
                      Role
                    </label>
                    <select
                      disabled
                      className="bg-[#F1F5F9] dark:bg-transparent border-[0.8px] border-[#CBD5E1] dark:border-transparent rounded-[10px] md:rounded-[12px] p-2 md:p-[12px] text-[#64748B] dark:text-white text-[13px] md:text-[14px] outline-none appearance-none cursor-not-allowed"
                    >
                      <option>{userData.role}</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-6 top-[60%] text-muted opacity-60"
                    />
                  </div>

                  {/* Textarea */}
                  <div className="bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-[16px] md:rounded-[24px] p-[14px] md:p-[18.8px] flex flex-col gap-1 md:gap-[6px] lg:col-span-1 transition-colors">
                    <label className="text-[#475569] dark:text-muted font-bold text-[12px] md:text-[13px] tracking-wide">
                      About Me (Optional)
                    </label>
                    <textarea
                      name="aboutMe"
                      value={userData.aboutMe}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-[#F1F5F9] dark:bg-transparent border-[0.8px] border-[#CBD5E1] dark:border-[#222936] dark:border-transparent rounded-[10px] md:rounded-[12px] p-2 md:p-[12px] text-[#64748B] dark:text-white text-[13px] md:text-[14px] resize-none h-[50px] md:h-[55px] disabled:opacity-80 outline-none focus:border-[#0096FF] focus:ring-1 focus:ring-[#0096FF] dark:focus:border-primary dark:focus:ring-primary"
                    ></textarea>
                  </div>

                  <InputBox
                    label="Age"
                    name="age"
                    value={userData.age}
                    isEditing={isEditing}
                    onChange={handleChange}
                    type="number"
                    placeholder="19"
                  />

                  {/* Textarea */}
                  <div className="bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-[16px] md:rounded-[24px] p-[14px] md:p-[18.8px] flex flex-col gap-1 md:gap-[6px] lg:col-span-1 transition-colors">
                    <label className="text-[#475569] dark:text-muted font-bold text-[12px] md:text-[13px] tracking-wide">
                      About Me (Optional)
                    </label>
                    <textarea
                      name="aboutMe"
                      value={userData.aboutMe}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-[#F1F5F9] dark:bg-transparent border-[0.8px] border-[#CBD5E1] dark:border-[#222936] dark:border-transparent rounded-[10px] md:rounded-[12px] p-2 md:p-[12px] text-[#64748B] dark:text-white text-[13px] md:text-[14px] resize-none h-[50px] md:h-[55px] disabled:opacity-80 outline-none focus:border-[#0096FF] focus:ring-1 focus:ring-[#0096FF] dark:focus:border-primary dark:focus:ring-primary transition-colors"
                    ></textarea>
                  </div>
                </div>

                {/* Mobile Buttons (Visible only on mobile/tablet) */}
                <div className="flex lg:hidden gap-3 mt-8">
                  <ActionButtons />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
