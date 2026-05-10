import React, { useState } from "react";
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
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "#about", icon: Info },
  { label: "Chapters", href: "#chapters", icon: MapPin },
  { label: "Events", href: "/events", icon: Calendar, badge: "100+" },
  { label: "Contact", href: "#contact", icon: Mail },
];

const PublicNavbar = () => {
  // 1. Add state to control the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  // Check if someone is logged in by looking at LocalStorage
  const { user } = useAuth();

  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleLogout = async () => {
    try {
      const { message } = await api.post("/users/logout");

      toast.success("Logged out successfully!");

      setTimeout(() => {
        window.location.reload();
        navigate("/");
      }, 1000);
    } catch (error) {
      const msg = error.response?.data?.message || "Logout failed";
      toast.error(msg);
    }
  };

  // Helper to close menu when a link is clicked
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-navbar-background shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-2 h-full flex items-center justify-between">
        <Toaster position="top-center" />

        {/* Logo */}
        <Link to="/">
          <img src="/logo.png" alt="IEEE Logo" />
        </Link>

        {/* --- DESKTOP MENU (Hidden on small screens) --- */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((nav_link, index) => {
            return (
              <a
                key={index}
                href={
                  nav_link.href.startsWith("#") && !isHome
                    ? "/" + nav_link.href
                    : nav_link.href
                }
                className="text-lg text-white hover:text-primary-light transition flex items-center"
              >
                {nav_link.label}
              </a>
            );
          })}

          <ThemeToggle />

          {user ? (
            <>
              <Link
                to="/profile"
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition flex items-center gap-1"
              >
                <UserIcon size={18} /> Hi, {user.name.split(" ")[0]}
              </Link>
              {["admin", "board", "xcom"].includes(
                user.role?.toLowerCase(),
              ) && (
                <Link
                  to="/dashboard"
                  className="text-primary dark:text-sky-400 font-bold hover:underline text-sm"
                >
                  Go to Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 transition flex items-center gap-1 font-medium"
              >
                <LogOutIcon size={18} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="px-6 py-3 bg-linear-to-r from-primary-dark to-primary-light hover:from-primary-light hover:to-primary-dark text-white rounded-lg transition duration-600 shadow-lg font-light"
              >
                Join Now
              </Link>
            </>
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
        className={`text-white fixed top-0 right-0 h-full w-[300px] max-w-[80vw] bg-primary-dark dark:bg-main z-50 shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sheet Header */}
        <div className="flex items-start justify-between px-6 pt-8 pb-4 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Menu</h2>
            <p className="text-sm text-white/50 mt-0.5">Explore our platform</p>
          </div>
          <button
            onClick={closeMenu}
            className="shrink-0 rounded-full border border-border p-2 hover:bg-border transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
          {NAV_LINKS.map((link, index) => {
            const Icon = link.icon;
            return (
              <a
                key={index}
                href={
                  link.href.startsWith("#") && !isHome
                    ? "/" + link.href
                    : link.href
                }
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl p-4 transition bg-white/10 dark:bg-[#222936]/20"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-border shrink-0">
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
              </a>
            );
          })}
        </div>

        {/* Sheet Footer */}
        <div className="px-4 pb-8 pt-4 border-t border-border">
          {user ? (
            <Link
              to="/profile"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-xl p-3 bg-border/50 hover:bg-border transition"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold text-sm shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-white/50 truncate">{user.email}</p>
              </div>
            </Link>
          ) : (
            <div
              className="relative backdrop-blur-2xl overflow-hidden rounded-xl p-4 border border-border 
	            bg-linear-to-r from-primary to-primary-light 
	            dark:bg-none dark:bg-[#222936]/20 
	            text-center"
            >
              <div className="flex gap-4 mb-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-linear">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold">Ready to Join?</h3>
                  <p className="text-xs text-white/50 mt-0.5 mb-4">
                    Start your journey today
                  </p>
                </div>
              </div>
              <Link
                to="/signup"
                onClick={closeMenu}
                className="block w-full rounded-lg bg-main text-primary dark:text-white font-medium text-sm py-2.5 text-center"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
