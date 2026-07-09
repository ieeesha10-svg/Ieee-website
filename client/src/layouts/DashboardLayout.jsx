import React, { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Search, X, Download, Loader2, Mail, GraduationCap, Calendar, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AdminSidebar from "../components/AdminSidebar";
import Notifications from "../components/Notifications";
import ThemeToggle from "../components/ThemeToggle";
import { navItems, toolsItems } from "../data/DashboardNav";
import DashNavSkeleton from "../components/skeletons/DashNavSkeleton";
import { useSearchMembers } from "../hooks/dashboard/useSearchMembers";
import api from "../utils/api";

const pageMeta = [...navItems, ...toolsItems].reduce((acc, item) => {
  acc[item.to] = {
    title: item.title,
    sub: item.sub,
    buttonText: item.buttonText,
    buttonIcon: item.buttonIcon,
  };
  return acc;
}, {});

const DashboardLayout = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const [formStats, setFormStats] = useState(null);
  const [eventCount, setEventCount] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const {
    members: searchResults,
    loading: searchLoading,
    search: searchTerm,
    setSearch: setSearchTerm,
  } = useSearchMembers({ pageSize: 5 });

  useEffect(() => {
    if (pathname === "/dashboard/forms") {
      api
        .get("/form")
        .then((res) => setFormStats(res.data))
        .catch(() => {});
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/dashboard/events") {
      api
        .get("/activities")
        .then((res) => {
          const count = res.data.activities?.length ?? 0;
          setEventCount(count);
        })
        .catch(() => setEventCount(0));
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/dashboard/users") {
      api.get("/users/all?limit=1").then((res) => {
        setUserCount(res.data.total ?? 0);
      }).catch(() => {});
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        searchRef.current && !searchRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportUser = useCallback(async (userId) => {
    setExporting(true);
    try {
      const res = await api.post(
        "/users/export-specific",
        { userIds: [userId] },
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ieee-member-${userId}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, []);

  const meta = Object.entries(pageMeta).find(
    ([path]) => pathname === path,
  )?.[1] || { title: "Dashboard", sub: "", buttonText: "" };

  if (pathname === "/dashboard/forms" && formStats) {
    meta.sub = `${formStats.count} ${formStats.count === 1 ? "form" : "forms"} — ${formStats.activeCount} currently open`;
  }

  if (pathname === "/dashboard/events" && eventCount != null) {
    meta.sub = `${eventCount} ${eventCount === 1 ? "event" : "events"} managed`;
  }

  if (pathname === "/dashboard/users" && userCount != null) {
    meta.sub = `${userCount} ${userCount === 1 ? "student" : "students"}`;
  }

  const rightSide = (
    <div className="flex items-center gap-4">
      <Notifications />
      <ThemeToggle />
      <Link to="/profile">
        <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
          {user?.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "A"}
        </span>
      </Link>
    </div>
  );

  const searchInput = (
    <div className="relative" ref={searchRef}>
      <Search
        size={15}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="text"
        placeholder="Search members..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        className="w-48 lg:w-56 h-9 rounded-lg border border-[#00629B1F] dark:border-border bg-[#F0F3F7] dark:bg-input pl-8 pr-3 text-xs text-foreground placeholder:text-muted outline-none focus:border-primary transition"
      />

      {showDropdown && searchTerm && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1A1F2E] border border-border rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto"
        >
          {searchLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={18} className="animate-spin text-muted" />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">No members found</p>
          ) : (
            searchResults.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedUser(m);
                  setShowDropdown(false);
                  setSearchTerm("");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/5 transition-colors text-left"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${m.avatarColor}`}>
                  {m.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                  <p className="text-xs text-muted truncate">{m.college} · {m.year}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen transition-colors duration-300 flex">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex flex-col bg-white dark:bg-card border-b border-border shadow-sm py-4 pl-14 md:pl-8 pr-4 md:pr-8">
          <div className="shrink-0 flex items-center justify-between">
            <>
              <div className="min-w-0 flex-1 mr-2">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200 truncate">
                  {meta.title}
                </h2>
                <p className="hidden md:block text-xs text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                  {(pathname === "/dashboard/users" && userCount === null) || (pathname === "/dashboard/forms" && formStats === null) || (pathname === "/dashboard/events" && eventCount === null) ? <DashNavSkeleton /> : meta.sub}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:block">{searchInput}</div>
                {rightSide}
              </div>
            </>
          </div>
        </header>

        <div className="scrollable-content flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-white dark:bg-[#1A1F2E] rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted/10 transition-colors"
            >
              <X size={20} className="text-muted" />
            </button>

            <div className="flex flex-col items-center pt-10 pb-6 px-6 border-b border-border">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mb-4 ${selectedUser.avatarColor}`}>
                {selectedUser.initials}
              </div>
              <h3 className="text-lg font-bold text-foreground">{selectedUser.name}</h3>
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mt-2 capitalize">
                {selectedUser.role}
              </span>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-muted shrink-0" />
                <span className="text-sm text-foreground">{selectedUser.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap size={16} className="text-muted shrink-0" />
                <span className="text-sm text-foreground">{selectedUser.college}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-muted shrink-0" />
                <span className="text-sm text-foreground">{selectedUser.year}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-muted shrink-0" />
                <span className="text-sm text-foreground capitalize">{selectedUser.role}</span>
              </div>

              <button
                onClick={() => handleExportUser(selectedUser.id)}
                disabled={exporting}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Export as Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
