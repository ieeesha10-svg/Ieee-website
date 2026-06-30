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
  Save,
  ChevronDown,
  WifiOff,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  RefreshCcw,
} from "lucide-react";
import api from "../utils/api";

export default function ProfilePage() {
  // === 1. States ===
  const [isEditing, setIsEditing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Loading & Error States
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

  // === 2. Offline/Online Detection ===
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

  // === 3. Fetch Data Logic ===
  const fetchUserData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // const response = await api.get("/users/profile");
      const response = {
        data: {
          user: {
            name: "Ahmed Waheed Elmallah",
            email: "ahmed.elmallah@ieee.org",
            phone: "+20 100 000 0000",
            role: "Technical Committee",
            age: 21,
            university: "Shorouk Academy",
            college: "Engineering",
            optionalData: { aboutMe: "Software Developer student." },
          },
        },
      };
      const user = response.data?.user || response.data;

      const fetchedData = {
        _id: user._id || "",
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "member",
        age: user.age || "",
        university: user.university || "Shorouk Academy",
        college: user.college || "",
        aboutMe: user.optionalData?.aboutMe || "", // حسب ما الباك إند بيحفظها
      };

      setUserData(fetchedData);
      setOriginalData(fetchedData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setFetchError("Failed to load profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // === 4. Handlers ===
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

      await api.put(`/users/${userData._id}`, payload);

      setOriginalData(userData);
      setIsEditing(false);
      setSaveMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      setTimeout(() => setSaveMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      setSaveMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // === 5. Render States ===

  if (isLoading) {
    return (
      <div className="min-h-screen bg-main flex flex-col items-center justify-center gap-4 text-foreground">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
        <p className="font-lakes font-medium text-muted">
          Loading your profile...
        </p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-main flex flex-col items-center justify-center gap-4 text-foreground p-4">
        <AlertTriangle className="text-red-500 w-16 h-16 mb-2" />
        <h2 className="font-gotham text-2xl font-bold">
          Oops! Something went wrong
        </h2>
        <p className="font-lakes text-muted text-center max-w-md">
          {fetchError}
        </p>
        <button
          onClick={fetchUserData}
          className="mt-4 flex items-center gap-2 bg-primary-linear text-white px-6 py-2.5 rounded-lg font-lakes hover:opacity-90 transition-opacity"
        >
          <RefreshCcw size={18} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-main text-foreground pb-12 overflow-hidden transition-colors duration-300">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-red-500 text-white p-3 flex justify-center items-center gap-3 font-lakes text-sm shadow-md z-50 relative">
          <WifiOff size={18} />
          You are currently offline. Changes cannot be saved.
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1304px] mx-auto mt-8 lg:mt-12 px-4 relative z-10">
        {/* === Profile Banner === */}
        <div
          className="rounded-[28px] pt-[36px] px-[40px] pb-0 md:pb-[36px] flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden text-white transition-all duration-300 bg-[linear-gradient(135deg,#0077CC_0%,#0096FF_55%,#33B5FF_100%)] shadow-[0px_12px_48px_rgba(0,100,220,0.18)] dark:bg-[linear-gradient(135deg,#001A40_0%,#002F6B_35%,#0066BB_70%,#0088EE_100%)] dark:shadow-[0px_20px_60px_rgba(0,0,0,0.7),0px_0px_0px_1px_rgba(0,150,255,0.2),inset_0px_1px_0px_rgba(255,255,255,0.08)]"
        >
          <div className="relative flex-shrink-0 z-10">
            <div
              className="w-[96px] h-[96px] rounded-[48px] border-[2.4px] flex items-center justify-center uppercase backdrop-blur-sm transition-all duration-300 border-[rgba(255,255,255,0.4)] bg-[linear-gradient(135deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.1)_100%)] shadow-[0px_8px_32px_rgba(0,0,0,0.18)] dark:border-white/30 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.06)_100%)] dark:shadow-[0px_8px_32px_rgba(0,0,0,0.5),0px_0px_0px_4px_rgba(0,150,255,0.15)]"
            >
              <span className="font-gotham font-medium text-[35.2px] leading-[42px] tracking-[-1.056px] text-white">
                {userData.fullName ? userData.fullName.substring(0, 2) : "AM"}
              </span>
            </div>
            <div
              className={`absolute bottom-0 right-0 w-[24px] h-[24px] border-[2.4px] rounded-[12px] transition-all duration-300 ${isOffline ? "bg-gray-400 border-white dark:border-[#13161D] shadow-none" : "bg-[#1BCC6E] border-white shadow-[0px_2px_6px_rgba(0,0,0,0.15)] dark:border-[#13161D] dark:shadow-[0px_0px_8px_rgba(27,204,110,0.5)]"}`}
            ></div>
          </div>

          <div className="flex-1 text-center md:text-left z-10 md:pt-2">
            <p className="font-lakes font-bold text-[11.52px] leading-[16px] tracking-[1.152px] uppercase text-white/65 dark:text-white/55 mb-[6px] transition-all duration-300">
              IEEE EGYPT • EL SHOROUK ACADEMY STUDENT BRANCH
            </p>
            <h1 className="font-gotham font-medium text-[40px] leading-[37px] tracking-[-1.008px] text-white mb-3 transition-all duration-300">
              {userData.fullName || "Ahmed Mostafa"}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-[10px]">
              <Badge
                text={
                  userData.committee
                    ? `${userData.committee} Committee`
                    : "Technical Committee"
                }
              />
              <Badge
                text={
                  userData.college
                    ? `3rd Year • ${userData.college}`
                    : "3rd Year • Engineering"
                }
              />
              <Badge text="Member since 2022" />
            </div>
          </div>
        </div>

        {/* === Grid Layout === */}
        <div className="flex flex-col lg:flex-row gap-10 mt-10">
          {/* Left Sidebar */}
          <div className="w-full lg:w-[308px] flex-shrink-0 space-y-8">
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
            <div className="bg-white dark:bg-[#13161D] rounded-[24px] border-[0.8px] border-[rgba(0,120,255,0.11)] dark:border-[#222936] shadow-[0px_6px_24px_rgba(0,100,220,0.13)] dark:shadow-sm p-6 md:p-8 lg:p-10 transition-colors duration-300">
              {/* Form Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <div className="flex items-center gap-6">
                  <div className="w-[46px] h-[46px] rounded-[14px] bg-[linear-gradient(135deg,#0096FF_0%,#0055CC_100%)] dark:bg-brand-linear shadow-[0px_4px_14px_rgba(0,150,255,0.3)] dark:shadow-[0_8px_24px_rgba(0,100,220,0.25)] flex items-center justify-center text-white">
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="text-[17.92px] leading-[22px] tracking-[-0.3584px] font-gotham font-medium text-[#0A1628] dark:text-white mb-[4px]">
                      Personal Information
                    </h2>
                    <p className="text-[#7A96B2] dark:text-muted font-[Outfit] text-[12.8px] leading-[16px]">
                      Manage your profile details
                    </p>
                  </div>
                </div>

                {/* Edit / Save Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || isOffline || !isEditing}
                    className="bg-[#0077CC] dark:bg-brand-linear border-[0.8px] border-[rgba(0,119,204,0.2)] dark:border-transparent rounded-[10px] text-white px-8 py-[14px] font-lakes font-bold text-[15px] flex items-center justify-center gap-2 min-w-[129px] shadow-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (isEditing) handleCancel();
                      else setIsEditing(true);
                    }}
                    disabled={isSaving}
                    className="bg-[#EBF4FF] dark:bg-transparent border-[0.8px] border-[rgba(0,150,255,0.2)] dark:border-[#E4EAF1] dark:border-border text-[#0096FF] dark:text-primary px-6 py-[14px] rounded-[10px] font-lakes font-bold text-[15px] flex items-center gap-2 hover:opacity-80 dark:hover:bg-input transition-colors disabled:opacity-50 min-w-[129px] justify-center"
                  >
                    {isEditing ? (
                      "Cancel"
                    ) : (
                      <>
                        <Edit size={16} /> Edit
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Messages (Success / Error during save) */}
              {saveMessage.text && (
                <div
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-lakes text-sm font-medium ${saveMessage.type === "success" ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"}`}
                >
                  {saveMessage.type === "success" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                  {saveMessage.text}
                </div>
              )}

              {/* Form Grid Container with Gradient Line */}
              <div className="relative pl-5 md:pl-7 lg:pl-9 mt-6">
                {/* Responsive Vertical Gradient Line */}
                <div className="absolute left-0 top-0 bottom-0 w-[4px] md:w-[5px] lg:w-[6px] rounded-[10px] bg-[linear-gradient(180deg,#1FA6FF_0%,#2AADFF_50%,#2DB0FF_75%,#0088FF_100%)] dark:bg-[linear-gradient(180deg,#6366F1_0%,#22C55E_100%)] z-[3] transition-all duration-300"></div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 font-lakes">
                <InputBox
                  label="Full Name"
                  name="fullName"
                  value={userData.fullName}
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="name of user"
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
                  label="Phone"
                  name="phone"
                  value={userData.phone}
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="+20 100 000 0000"
                />

                {/* Role Dropdown */}
                <div className="bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-[24px] p-[18.8px] flex flex-col gap-[6px] transition-colors relative">
                  <label className="text-[#475569] dark:text-muted font-bold text-[13px] leading-[16px] font-[Inter] tracking-wide">
                    Role
                  </label>
                  <select
                    name="role"
                    value={userData.role}
                    disabled={true}
                    className="bg-[#F1F5F9] dark:bg-transparent border-[0.8px] border-[#CBD5E1] dark:border-transparent rounded-[12px] p-[12px] text-[#64748B] dark:text-foreground text-[14px] leading-[17px] font-[Inter] outline-none appearance-none cursor-not-allowed opacity-80"
                  >
                    <option value={userData.role}>{userData.role}</option>
                  </select>
                  <div className="absolute right-8 top-1/2 pointer-events-none text-muted mt-[6px]">
                    <ChevronDown size={18} className="opacity-60" />
                  </div>
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

                <InputBox
                  label="University"
                  name="university"
                  value={userData.university}
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="Shorouk Academy"
                />

                <InputBox
                  label="College"
                  name="college"
                  value={userData.college}
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="Engineering"
                />

                {/* Textarea */}
                <div className="bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-[24px] p-[18.8px] flex flex-col gap-[6px] transition-colors lg:col-span-1">
                  <label className="text-[#475569] dark:text-muted font-bold text-[13px] leading-[16px] font-[Inter] tracking-wide">
                    About Me (Optional)
                  </label>
                  <textarea
                    name="aboutMe"
                    value={userData.aboutMe}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="bg-[#F1F5F9] dark:bg-transparent border-[0.8px] border-[#CBD5E1] dark:border-[#222936] dark:border-transparent rounded-[12px] p-[12px] text-[#64748B] dark:text-foreground text-[14px] leading-[17px] font-[Inter] outline-none resize-none h-[55px] transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed focus:border-[#0096FF] focus:ring-1 focus:ring-[#0096FF] dark:focus:border-primary dark:focus:ring-primary"
                  ></textarea>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Helper Components ================= */

function Badge({ text }) {
  return (
    <span
      className="px-[14.8px] flex items-center justify-center rounded-full font-lakes font-medium text-[12px] leading-[17px] tracking-[0.24px] backdrop-blur-sm transition-all duration-300 h-[26px] bg-[rgba(255,255,255,0.15)] border-[0.8px] border-[rgba(255,255,255,0.25)] text-white dark:bg-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.18)] dark:text-white/90"
    >
      {text}
    </span>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div>
      <h3 className="text-[#9CA3AF] text-[12px] font-gotham font-bold tracking-[1.5px] uppercase mb-4 ml-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function NavItem({ icon, title, subtitle, isActive, hasNotification }) {
  return (
    <div
      className={`flex items-center justify-between p-[14.8px] rounded-[16px] cursor-pointer transition-all duration-300 ${isActive
        ? "bg-[linear-gradient(135deg,#0096FF_0%,#0055CC_100%)] dark:bg-brand-linear border-[0.8px] border-[#0077CC] dark:border-transparent shadow-[0px_4px_20px_rgba(0,150,255,0.35)] dark:shadow-[0_12px_32px_rgba(0,100,220,0.2)] text-white"
        : "bg-white dark:bg-[#13161D] border-[0.8px] border-[rgba(0,120,255,0.11)] dark:border-[#222936] shadow-[0px_2px_8px_rgba(0,100,220,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-primary/30 text-[#0A1628] dark:text-foreground"
        }`}
    >
      <div className="flex items-center gap-[18.8px]">
        <div
          className={`w-[40px] h-[40px] rounded-[12px] flex items-center justify-center transition-colors ${isActive
            ? "bg-white/20 text-white"
            : "bg-[#EBF4FF] dark:bg-[#1A1F2E] text-[#0096FF] dark:text-primary"
            }`}
        >
          {icon}
        </div>
        <div>
          <h4
            className={`text-[14.08px] leading-[17px] font-gotham font-normal ${isActive ? "text-white" : "text-[#0A1628] dark:text-white"}`}
          >
            {title}
          </h4>
          <p
            className={`text-[11.52px] leading-[15px] font-[Outfit] mt-[1px] ${isActive ? "text-white" : "text-[#7A96B2] dark:text-muted"}`}
          >
            {subtitle}
          </p>
        </div>
      </div>
      {hasNotification && (
        <div className="w-[8px] h-[8px] bg-[#FF4757] rounded-full shadow-[0px_0px_0px_2.8px_rgba(255,71,87,0.16)] mr-2"></div>
      )}
    </div>
  );
}

function InputBox({ label, name, value, isEditing, onChange, type = "text", placeholder }) {
  return (
    <div className={`bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-[24px] p-[18.8px] flex flex-col gap-[6px] transition-colors`}>
      <label className="text-[#475569] dark:text-muted font-bold text-[13px] leading-[16px] font-[Inter] tracking-wide">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={!isEditing}
        placeholder={placeholder}
        className="bg-[#F1F5F9] dark:bg-transparent border-[0.8px] border-[#CBD5E1] dark:border-transparent rounded-[12px] p-[12px] text-[#64748B] dark:text-foreground text-[14px] leading-[17px] font-[Inter] outline-none transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed placeholder:text-[#64748B]/60 focus:border-[#0096FF] focus:ring-1 focus:ring-[#0096FF] dark:focus:border-primary dark:focus:ring-primary"
      />
    </div>
  );
}
