import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import ThemeToggle from '../components/ThemeToggle';

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-row">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white dark:bg-gray-800 h-16 shadow-sm flex-shrink-0 flex items-center justify-between px-8 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">Dashboard</h2>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition flex items-center gap-1">
              <UserIcon size={18} /> Hi, {user?.name?.split(" ")[0] || "Admin"}
            </Link>
            <ThemeToggle />
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
