import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { SidebarSection, NavItem } from "../components/UserSidebar";
import ProfileBadge from "../components/ProfileBadge";
import api from "../utils/api";
import {
  LayoutGrid,
  User,
  Lock,
  Users,
  Bookmark,
  Activity,
  Settings,
  Loader2,
  AlertTriangle,
  RefreshCcw,
  WifiOff,
} from "lucide-react";

export default function UserLayout() {
  const location = useLocation();

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [userData, setUserData] = useState({
    _id: "",
    fullName: "",
    email: "",
    phone: "",
    role: "",
    age: "",
    university: "",
    college: "",
    committee: "",
    aboutMe: "",
  });

  // ─── Online/Offline detection ───────────────────────────────────────────────
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

  // ─── Fetch user data ─────────────────────────────────────────────────────────
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
      setUserData({
        _id: user._id || "",
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "member",
        age: user.age || "",
        university: user.university || "",
        college: user.college || "",
        committee: user.committee || "",
        aboutMe: user.optionalData?.aboutMe || "",
      });
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

  // ─── Loading state ────────────────────────────────────────────────────────────
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

  // ─── Error state ──────────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-main text-foreground transition-colors duration-300">
      {/* ─── Offline Banner ───────────────────────────────────────────────── */}
      {isOffline && (
        <div className="bg-red-500 text-white p-3 flex justify-center items-center gap-3 font-lakes text-sm">
          <WifiOff size={18} /> You are currently offline.
        </div>
      )}

      <div className="max-w-[1304px] mx-auto px-4 md:px-8 py-6 md:py-8 lg:py-12 space-y-6 md:space-y-8 lg:space-y-10">

        {/* ─── Profile Banner (ثابت في كل صفحة) ────────────────────────── */}
        <div className="rounded-[24px] md:rounded-[28px] pt-[24px] md:pt-[36px] px-[20px] md:px-[40px] pb-6 md:pb-[36px] flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 relative overflow-hidden text-white transition-all duration-300 bg-[linear-gradient(135deg,#0077CC_0%,#0096FF_55%,#33B5FF_100%)] shadow-[0px_12px_48px_rgba(0,100,220,0.18)] dark:bg-[linear-gradient(135deg,#001A40_0%,#002F6B_35%,#0066BB_70%,#0088EE_100%)] dark:shadow-[0px_20px_60px_rgba(0,0,0,0.7),0px_0px_0px_1px_rgba(0,150,255,0.2),inset_0px_1px_0px_rgba(255,255,255,0.08)]">
          {/* Avatar */}
          <div className="relative flex-shrink-0 z-10">
            <div className="w-[80px] md:w-[96px] h-[80px] md:h-[96px] rounded-[48px] border-[2.4px] flex items-center justify-center uppercase backdrop-blur-sm transition-all duration-300 border-[rgba(255,255,255,0.4)] bg-[linear-gradient(135deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.1)_100%)] shadow-[0px_8px_32px_rgba(0,0,0,0.18)] dark:border-white/30 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.06)_100%)] dark:shadow-[0px_8px_32px_rgba(0,0,0,0.5),0px_0px_0px_4px_rgba(0,150,255,0.15)]">
              <span className="font-gotham font-medium text-[28px] md:text-[35.2px] leading-[42px] tracking-[-1.056px] text-white">
                {userData.fullName ? userData.fullName.substring(0, 2) : "AM"}
              </span>
            </div>
            {/* Online dot */}
            <div
              className={`absolute bottom-0 right-0 w-[20px] md:w-[24px] h-[20px] md:h-[24px] border-[2.4px] rounded-[12px] transition-all duration-300 ${
                isOffline
                  ? "bg-gray-400 border-white dark:border-[#13161D] shadow-none"
                  : "bg-[#1BCC6E] border-white shadow-[0px_2px_6px_rgba(0,0,0,0.15)] dark:border-[#13161D] dark:shadow-[0px_0px_8px_rgba(27,204,110,0.5)]"
              }`}
            />
          </div>

          {/* Info */}
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

        {/* ─── Main Grid: Sidebar + Page Content ──────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          {/* Sidebar */}
          <div className="w-full lg:w-[308px] flex-shrink-0 space-y-8">
            <SidebarSection title="Account">
              <Link to="/profile/overview">
                <NavItem
                  icon={<LayoutGrid size={20} />}
                  title="Overview"
                  subtitle="Dashboard & stats"
                  isActive={location.pathname === "/profile/overview"}
                />
              </Link>
              <Link to="/profile">
                <NavItem
                  icon={<User size={20} />}
                  title="User Profile"
                  subtitle="Personal information"
                  isActive={location.pathname === "/profile"}
                />
              </Link>
              <Link to="/profile/password">
                <NavItem
                  icon={<Lock size={20} />}
                  title="Change Password"
                  subtitle="Security settings"
                  isActive={location.pathname === "/profile/password"}
                />
              </Link>
            </SidebarSection>

            <SidebarSection title="IEEE Activity">
              <NavItem
                icon={<Users size={18} />}
                title="My Committees"
                subtitle="Groups & teams"
              />
              <NavItem
                icon={<Bookmark size={18} />}
                title="Saved Events"
                subtitle="Bookmarked events"
              />
              <NavItem
                icon={<Activity size={18} />}
                title="Activity History"
                subtitle="Timeline of actions"
                hasNotification
              />
            </SidebarSection>

            <SidebarSection title="Preferences">
              <NavItem
                icon={<Settings size={18} />}
                title="Settings"
                subtitle="App preferences"
              />
            </SidebarSection>
          </div>

          {/* Page Content (المحتوى المتغير) */}
          <div className="flex-1 min-w-0">
            <Outlet context={{ userData, setUserData, isOffline }} />
          </div>

        </div>
      </div>
    </div>
  );
}
