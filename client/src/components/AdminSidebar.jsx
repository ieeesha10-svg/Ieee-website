import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Mail,
  Settings,
  ScanQrCode,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useLogout } from "../hooks/auth/useLogout";
import { navItems, toolsItems } from "../data/DashboardNav";
import ConfirmModal from "./ConfirmModal";

const ICON_MAP = {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Mail,
  Settings,
  ScanQrCode,
};

const AdminSidebar = () => {
  const { user } = useAuth();
  const { logout } = useLogout();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    if (await logout()) setShowLogoutModal(false);
  };

  const nav = (onNavClick) => (
    <>
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-4">
        <div>
          <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#344F64]">
            MAIN
          </p>
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const Icon = ICON_MAP[item.icon];
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavClick}
                  className={({ isActive }) => {
                    const active = item.end
                      ? isActive || location.pathname === item.to + "/"
                      : isActive;
                    return `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-primary text-white hover:bg-primary-dark" : "text-[#7A9BB5] hover:bg-input hover:text-foreground"}`;
                  }}
                >
                  {({ isActive }) => {
                    const active = item.end
                      ? isActive || location.pathname === item.to + "/"
                      : isActive;
                    return (
                      <>
                        {Icon && <Icon size={16} />}
                        {item.label}
                        {active && (
                          <ChevronRight
                            size={14}
                            className="ml-auto shrink-0"
                          />
                        )}
                      </>
                    );
                  }}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/7 pt-2">
          <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#344F64]">
            TOOLS
          </p>
          <nav className="flex flex-col gap-0.5">
            {toolsItems.map((item) => {
              const Icon = ICON_MAP[item.icon];
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isActive ? "bg-primary text-white hover:bg-primary-dark" : "text-[#7A9BB5] hover:bg-input hover:text-foreground"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {Icon && <Icon size={16} />}
                      {item.label}
                      {isActive && (
                        <ChevronRight size={14} className="ml-auto shrink-0" />
                      )}
                      {item.badge && (
                        <span className="ml-auto text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 rounded-md px-1.5 py-0.5 leading-none">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-white/8 flex flex-col gap-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#8BA0B8] hover:text-white hover:bg-[#1A2E42] transition-colors"
        >
          <Home size={18} />
          <span>Home</span>
        </Link>
        <div className="flex items-center gap-2 bg-[#1A2E42] border-white/8 px-4 py-3 rounded-xl">
          <div className="flex-1 min-w-0">
            <p className="text-[#5A7186] text-[10px] leading-tight">
              Logged in as
            </p>
            <p className="text-white text-xs font-semibold leading-tight truncate">
              {user?.name || "Admin"}
            </p>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            aria-label="Log out"
            className="shrink-0 text-muted hover:text-red-400 transition-colors cursor-pointer p-1"
          >
            <LogOut size={15} />
          </button>
				</div>
        
      </div>
    </>
  );

  return (
    <>
      <Toaster position="top-center" />

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle sidebar"
        className="md:hidden fixed top-4 left-4 z-50 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-md"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#0a0e1a] border-r border-border transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 py-4 border-b border-white/8 flex items-center gap-3">
          <div className="bg-primary text-white text-[10px] font-bold rounded-md px-1.5 py-1 shrink-0 w-8 h-8 flex items-center justify-center">
            IEEE
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-tight">
              IEEE Student Branch
            </p>
            <p className="text-muted text-xs leading-tight mt-2">Admin Panel</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="shrink-0 text-muted hover:text-foreground transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
        {nav(() => setMobileOpen(false))}
      </aside>

      {/* Desktop sidebar */}
      <aside className="shrink-0 h-screen sticky top-0 z-50 hidden md:flex flex-col bg-[#0a0e1a]">
        <div className="px-4 py-4 border-b border-white/7 flex items-center gap-3">
          <div className="bg-primary text-white text-[10px] font-bold rounded-md px-1.5 py-1 shrink-0 w-8 h-8 flex items-center justify-center">
            IEEE
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">
              IEEE Student Branch
            </p>
            <p className="text-[#5A7186] text-xs leading-tight">Admin Panel</p>
          </div>
        </div>
        {nav()}
      </aside>

      {createPortal(
        <ConfirmModal
          isOpen={showLogoutModal}
          title="Log out"
          message="Are you sure you want to log out?"
          confirmLabel="Log out"
          cancelLabel="Cancel"
          variant="danger"
          isLoading={loggingOut}
          onConfirm={handleLogout}
          onCancel={() => { setShowLogoutModal(false); setLoggingOut(false); }}
        />,
        document.body
      )}
    </>
  );
};

export default AdminSidebar;
