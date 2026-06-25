import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import Notifications from '../components/Notifications';
import ThemeToggle from '../components/ThemeToggle';
import { navItems, toolsItems } from '../data/DashboardNav';

const pageMeta = [...navItems, ...toolsItems].reduce((acc, item) => {
  acc[item.to] = { title: item.title, sub: item.sub };
  return acc;
}, {});

const DashboardLayout = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const meta = Object.entries(pageMeta).find(([path]) =>
    pathname === path
  )?.[1] || { title: 'Dashboard', sub: '' };

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-row">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white dark:bg-gray-800 h-16 shadow-sm flex-shrink-0 flex items-center justify-between pl-14 md:pl-8 pr-4 md:pr-8 border-b border-gray-100 dark:border-gray-700">
					<div className="min-w-0 flex-1 mr-2">
						<h2 className="font-semibold text-gray-700 dark:text-gray-200 truncate">{meta.title}</h2>
						<p className="text-xs text-gray-400 dark:text-gray-500 leading-tight mt-0.5 truncate">{meta.sub}</p>
					</div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search members..."
                className="w-48 lg:w-56 h-9 rounded-lg border border-border dark:bg-input pl-8 pr-3 text-xs text-foreground placeholder:text-muted outline-none focus:border-primary transition"
              />
            </div>

            <Notifications />

            <ThemeToggle />

            <Link to="/profile">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                {user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "A"}
              </span>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
