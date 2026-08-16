import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  User as UserIcon,
  LogOut as LogOutIcon,
  Menu,
  X,
  Home,
  Info,
  MapPin,
  Calendar,
	Mail,
	Braces,
	Briefcase,
  FileText,
  ChevronRight,
  ChevronDown,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useJoinMenu from "../../hooks/useJoinMenu";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { Toaster } from "react-hot-toast";
import ConfirmModal from "../ui/ConfirmModal";
import { useLogout } from "../../hooks/auth/useLogout";
import { canUseScanPage, dashboardHref, isAdminRole } from "../../utils/roleAccess";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: Info },
  { label: "Events", href: "/events", icon: Calendar, badge: "50+" },
  { label: "Forms", href: "/applications", icon: FileText },
  { label: "Committees", href: "/committees", icon: Briefcase },
  { label: "Crew", href: "/crew", icon: MapPin },
  { label: "Dev Team", href: "/dev-team", icon: Braces },
  { label: "Contact", href: "/contact", icon: Mail },
];

const PublicNavbar = () => {
  // 1. Add state to control the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { logout, loading: loggingOut } = useLogout();
  const {
    ref: desktopMenuRef,
    open: desktopMenuOpen,
    toggle: desktopToggle,
    handleNavigate: desktopHandleNavigate,
  } = useJoinMenu(navigate);
  const {
    ref: mobileMenuRef,
    open: mobileMenuOpen,
    toggle: mobileToggle,
    close: mobileMenuClose,
    handleNavigate: mobileHandleNavigate,
  } = useJoinMenu(navigate);
  const { user } = useAuth();

  // Helper to close menu when a link is clicked
  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    mobileMenuClose();
  };

  return (
    <nav className="bg-navbar-background lg:bg-navbar-background/88 dark:lg:bg-navbar-background/60 lg:backdrop-blur-xl shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 pt-2 pb-3 h-full flex items-center justify-between">
        <Toaster position="top-center" />

        {/* Logo */}
        <Link to="/">
          <img src="/logo.png" alt="IEEE Logo" />
        </Link>
				<div className="hidden md:flex items-center gap-6">
	        {NAV_LINKS.map((nav_link, index) => {
						return (
              <Link
                key={index}
                to={nav_link.href}
                className="text-lg text-white hover:text-primary-light transition flex items-center"
              >
                {nav_link.label}
              </Link>
	          );
					})}
				</div>
        
        {/* DESKTOP MENU (Hidden on small screens) */}
        <div className="hidden md:flex items-center gap-6 relative">

          <ThemeToggle />

          {user ? (
            <>
              <Link
                to="/profile"
                className="text-white dark:text-gray-300 hover:text-primary-light dark:hover:text-white font-medium transition flex items-center gap-1"
              >
                <UserIcon size={18} /> Hi, {user.name.split(" ")[0]}
              </Link>
              {canUseScanPage(user.role) && (
                <Link
                  to={dashboardHref(user.role)}
                  className="text-primary-light font-bold hover:underline text-sm"
                >
                	Dashboard
                </Link>
              )}
              <button
                onClick={() => setShowLogoutModal(true)}
                aria-label="Log out"
                className="text-red-500 hover:text-red-700 transition flex items-center gap-1 font-medium"
              >
                <LogOutIcon size={18} />
              </button>
            </>
          ) : (
            <div ref={desktopMenuRef} className="relative">
              <button
                type="button"
                onClick={desktopToggle}
                className="px-6 py-3 bg-linear-to-r from-primary-dark to-primary-light hover:from-primary-light hover:to-primary-dark text-white rounded-lg transition duration-600 shadow-lg font-light flex items-center gap-2"
              >
                Join Now
                <ChevronDown
                  size={16}
                  className={`transition-transform ${desktopMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {desktopMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-xl overflow-hidden border border-[#FFFFFF33] dark:border-border bg-primary-linear dark:bg-main shadow-2xl">
                  <button
                    type="button"
                    onClick={() => desktopHandleNavigate("/login")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white text-sm hover:bg-white/10 transition text-left"
                  >
                    <UserIcon size={18} className="text-primary-light shrink-0" />
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => desktopHandleNavigate("/registration")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white text-sm hover:bg-white/10 transition text-left"
                  >
                    <UserPlus size={18} className="text-primary-light shrink-0" />
                    Registration
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- MOBILE MENU BUTTON (Visible only on small screens) --- */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white rounded-full border border-primary-light p-3 transition"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* --- BACKDROP --- */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      />

      {/* --- MOBILE SLIDE-IN SHEET --- */}
      <div
        className={`text-white fixed top-0 right-0 h-full w-[300px] max-w-[80vw] bg-primary-linear dark:bg-main z-50 shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sheet Header */}
        <div className="flex items-start justify-between px-6 pt-8 pb-4 border-b border-[#FFFFFF33] dark:border-border">
          <div>
            <h2 className="text-2xl font-bold">Menu</h2>
            <p className="text-sm text-white/50 mt-0.5">Explore our platform</p>
          </div>
          <button
            onClick={closeMenu}
            aria-label="Close menu"
            className="shrink-0 rounded-full p-2 bg-primary-light/80 dark:bg-border transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
          {NAV_LINKS.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                to={link.href}
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl p-4 transition bg-white/10 dark:bg-[#222936]/20"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-light/50 dark:bg-border shrink-0">
                  <Icon size={22} />
                </span>
                <span className="flex-1 font-medium">{link.label}</span>
                {link.badge && (
                  <span className="text-xs font-semibold bg-white/10 px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
                <ChevronRight
                  size={16}
                  className="text-primary-light transition"
                />
              </Link>
            );
          })}
        </div>

        {/* Sheet Footer */}
        <div className={`px-4 pb-8 pt-4 ${isAdminRole(user?.role) ? "border-t border-[#FFFFFF33] dark:border-border" : ""}`}>
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl p-3 bg-card hover:bg-card/80 transition"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold text-sm shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
              </Link>
              {canUseScanPage(user.role) && (
                <Link
                  to={dashboardHref(user.role)}
                  onClick={closeMenu}
                  className="flex items-center justify-center rounded-xl p-3 bg-primary dark:bg-primary/10 text-white dark:text-primary font-semibold text-sm transition mt-2"
                >
                  Dashboard
                </Link>
              )}
            </>
          ) : (
            <div
              className="relative backdrop-blur-2xl text-center overflow-hidden rounded-xl p-4
              border border-[#FFFFFF33] dark:border-border
	            bg-linear-to-r from-white/15 to-primary-light
	            dark:from-white/5 dark:to-[#222936]/20"
            >
              <div className="flex gap-4 mb-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-linear">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold">Ready to Join?</h3>
                  <p className="text-xs text-white/70 mt-0.5 mb-4">
                    Start your journey today
                  </p>
                </div>
              </div>
              <div ref={mobileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={mobileToggle}
                  className="block w-full rounded-lg bg-main text-primary dark:text-white font-medium text-sm py-2.5 text-center flex items-center justify-center gap-2"
                >
                  Join Now
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {mobileMenuOpen && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-[#FFFFFF33] dark:border-border bg-white/10 dark:bg-[#222936]/20">
                    <button
                      type="button"
                      onClick={() => {
                        mobileHandleNavigate("/login");
                        closeMenu();
                      }}
                      className="w-full flex items-center gap-3 rounded-xl p-3 text-white text-sm hover:bg-white/10 transition text-left"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-light/50 dark:bg-border shrink-0">
                        <UserIcon size={16} />
                      </span>
                      <span className="flex-1 font-medium">Login</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        mobileHandleNavigate("/registration");
                        closeMenu();
                      }}
                      className="w-full flex items-center gap-3 rounded-xl p-3 text-white text-sm hover:bg-white/10 transition text-left"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-light/50 dark:bg-border shrink-0">
                        <UserPlus size={16} />
                      </span>
                      <span className="flex-1 font-medium">Registration</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {createPortal(
        <ConfirmModal
          isOpen={showLogoutModal}
          title="Log out"
          message="Are you sure you want to log out?"
          confirmLabel="Log out"
          cancelLabel="Cancel"
          variant="danger"
          isLoading={loggingOut}
          onConfirm={async () => { if (await logout()) setShowLogoutModal(false); }}
          onCancel={() => setShowLogoutModal(false)}
        />,
        document.body
      )}
    </nav>
  );
};

export default PublicNavbar;
