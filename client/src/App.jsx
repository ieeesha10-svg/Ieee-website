import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import Events from './pages/Events';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import BulkMailer from './pages/BulkMailer';
import Dashboard from './pages/Dashboard';
import PublicNavbar from './components/PublicNavbar';
import AdminSidebar from './components/AdminSidebar';
import { UserIcon } from 'lucide-react';
import { useAuth } from './context/AuthContext';

// --- 1. ROUTE GUARD COMPONENT ---
const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user } = useAuth();

  // 1. Not logged in? Send to Home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Is this an Admin route? Check their role
  if (requireAdmin) {
    const isAdmin = ['admin', 'board', 'xcom'].includes(user.role?.toLowerCase());
    if (!isAdmin) {
      // If a regular student tries to access /dashboard, send them to home
      return <Navigate to="/" replace />;
    }
  }

  // 3. If they pass the checks, render the nested routes
  return <Outlet />;
};

// --- 2. LAYOUT CONTROLLER ---
const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth(); 

  // Logic: Show Sidebar if URL starts with /dashboard
  const isAdminRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex ${isAdminRoute ? 'flex-row' : 'flex-col'}`}>

      {/* Sidebar (Admin Only) */}
      {isAdminRoute && <AdminSidebar />}

      {/* Navbar (Public Only) */}
      {!isAdminRoute && <PublicNavbar />}

      {/* Page Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* For Admin: Add a top header with toggle inside the main area */}
        {isAdminRoute && (
          <header className="bg-white dark:bg-gray-800 h-16 shadow-sm flex-shrink-0 flex items-center justify-between px-8 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200">Dashboard</h2>
            <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-ieee-blue dark:hover:text-white font-medium transition flex items-center gap-1">
              {/* Added optional chaining (?.) so it doesn't crash if user is somehow null here */}
              <UserIcon size={18} /> Hi, {user?.name?.split(' ')[0] || 'Admin'}
            </Link>
            <ThemeToggle />
          </header>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>

    </div>
  );
};

// --- 3. MAIN APP ---
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* === PUBLIC ROUTES === */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* === PROTECTED ROUTES (All Users) === */}
          {/* Any route inside this block requires the user to be logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* === ADMIN ROUTES (Admins Only) === */}
          {/* Any route inside this block requires the user to be logged in AND have an admin role */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/email" element={<BulkMailer />} />
            <Route path="/dashboard/users" element={<div className="p-10 dark:text-white">User Management</div>} />
            <Route path="/dashboard/forms" element={<div className="p-10 dark:text-white">Forms Manager</div>} />
            <Route path="/dashboard/scan" element={<div className="p-10 dark:text-white">QR Scanner</div>} />
          </Route>

          {/* === CATCH ALL === */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;