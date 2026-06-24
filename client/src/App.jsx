import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProfilePage from "./pages/ProfilePage";
import Home from "./pages/Home";
import Events from "./pages/Events";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import EventRegistration from "./pages/EventRegistration";
import CrewPage from "./pages/CrewPage";
import NotFoundPage from "./pages/NotFoundPage";
// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import BulkMailer from "./pages/dashboard/BulkMailer";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
// Components
import PublicNavbar from "./components/PublicNavbar";
import Footer from "./components/Footer";
import DashboardLayout from "./layouts/DashboardLayout";

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  if (requireAdmin) {
    const isAdmin = ["admin", "board", "xcom"].includes(user.role?.toLowerCase());
    if (!isAdmin) return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const PublicLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col">
      <PublicNavbar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
      {!["/login", "/signup", "/verify"].includes(location.pathname) && <Footer />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventRegistration />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify" element={<VerifyEmailPage />} />
          <Route path="/crew" element={<CrewPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requireAdmin />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/email" element={<BulkMailer />} />
            <Route path="/dashboard/users" element={<div className="p-10 dark:text-white">User Management</div>} />
            <Route path="/dashboard/forms" element={<div className="p-10 dark:text-white">Forms Manager</div>} />
            <Route path="/dashboard/scan" element={<div className="p-10 dark:text-white">QR Scanner</div>} />
            <Route path="/dashboard/settings" element={<DashboardSettings />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <>
              <PublicNavbar />
              <NotFoundPage />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
