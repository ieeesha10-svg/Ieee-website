import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Search, Download, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AdminSidebar from "../components/AdminSidebar";
import Notifications from "../components/Notifications";
import ThemeToggle from "../components/ThemeToggle";
import { navItems, toolsItems } from "../data/DashboardNav";
import DashNavSkeleton from "../components/skeletons/DashNavSkeleton";
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

  useEffect(() => {
    if (pathname === "/dashboard/forms") {
      api.get("/form").then((res) => setFormStats(res.data)).catch(() => {});
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/dashboard/events") {
      api.get("/activities").then((res) => setEventCount(res.data.length ?? 0)).catch(() => {});
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/dashboard/users") {
      api.get("/users/all?limit=1").then((res) => {
        setUserCount(res.data.total ?? 0);
      }).catch(() => {});
    }
  }, [pathname]);

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
    <div className="relative">
      <Search
        size={15}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="text"
        placeholder="Search members..."
        className="w-48 lg:w-56 h-9 rounded-lg border border-[#00629B1F] dark:border-border bg-[#F0F3F7] dark:bg-input pl-8 pr-3 text-xs text-foreground placeholder:text-muted outline-none focus:border-primary transition"
      />
    </div>
  );

  return (
    <div className="min-h-screen transition-colors duration-300 flex">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex flex-col bg-white dark:bg-card border-b border-border shadow-sm py-4 pl-14 md:pl-8 pr-4 md:pr-8">
          <div className={"shrink-0 flex items-center justify-between"}>
            <>
              <div className={" min-w-0 flex-1 mr-2"}>
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
    </div>
  );
};

export default DashboardLayout;
