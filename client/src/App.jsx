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
import { ADMIN_ROLES, SCAN_ACCESS_ROLES } from "./data/roles";
// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import UserLayout from "./layouts/UserLayout";
// Components
import PublicNavbar from "./components/PublicNavbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Events from "./pages/Events";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import EventRegistration from "./pages/EventRegistration";
import EventDetails from "./pages/EventDetails";
import CrewPage from "./pages/CrewPage";
import CommitteesPage from "./pages/CommitteesPage";
import DevTeam from "./pages/DevTeam";
import ApplicationsPage from "./pages/FormApplicationsPage";
import FormSubmissionPage from "./pages/FormSubmissionPage";
import NotFoundPage from "./pages/NotFoundPage";
// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgetPasswordPage from "./pages/auth/ForgetPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
// Dashboard Pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardMembers from "./pages/dashboard/DashboardMembers";
import DashboardEvents from "./pages/dashboard/events/DashboardEvents";
import CreateEvent from "./pages/dashboard/events/CreateEvent";
import FeaturedEvents from "./pages/dashboard/events/FeaturedEvents";
import DashboardCrew from "./pages/dashboard/DashboardCrew";
import EmailLogsPage from "./pages/dashboard/EmailLogsPage";
import DashboardForms from "./pages/dashboard/forms/DashboardForms";
import CreateForm from "./pages/dashboard/forms/CreateForm";
import ShowFormSubmissions from "./pages/dashboard/forms/ShowFormSubmissions";
import BulkMailer from "./pages/dashboard/BulkMailer";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import QRScanner from "./pages/dashboard/QRScanner";
// Profile Pages
import UserProfile from "./pages/user-dashboard/UserProfile";
import ChangePassword from "./pages/user-dashboard/ChangePassword";
import MyCommittees from "./pages/user-dashboard/MyCommittees";
import AttendedEvents from "./pages/user-dashboard/AttendedEvents";

const ProtectedRoute = ({ requireAdmin = false, roles = null }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles) {
    const allowed = roles.includes(user.role?.toLowerCase());
    if (!allowed) return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    const isAdmin = ADMIN_ROLES.includes(user.role?.toLowerCase());
    if (!isAdmin) return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const GuestRoute = () => {
  const { user } = useAuth();
  if (user) return <Navigate to="/profile" replace />;
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
      {![
        "/login",
        "/signup",
        "/registration",
        "/verify",
        "/forgot-password",
        "/reset-password",
        "/dev-team",
        "/applications",
      ].includes(location.pathname) &&
        !location.pathname.startsWith("/applications/") && <Footer />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter useTransitions={false}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventRegistration />} />
          <Route path="/events/:id/details" element={<EventDetails />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registration" element={<SignupPage />} />
            <Route path="/verify" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgetPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
          <Route path="/crew" element={<CrewPage />} />
          <Route path="/committees" element={<CommitteesPage />} />
          <Route path="/dev-team" element={<DevTeam />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/applications/:id" element={<FormSubmissionPage />} />
            <Route path="/profile" element={<UserLayout />}>
              <Route index element={<UserProfile />} />
              <Route path="password" element={<ChangePassword />} />
              <Route path="committees" element={<MyCommittees />} />
              <Route path="events" element={<AttendedEvents />} />
            </Route>
          </Route>
        </Route>

        <Route element={<ProtectedRoute requireAdmin />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/users" element={<DashboardMembers />} />
            <Route path="/dashboard/events" element={<DashboardEvents />} />
            <Route
              path="/dashboard/events/create-event"
              element={<CreateEvent />}
            />
            <Route
              path="/dashboard/events/flagship"
              element={<FeaturedEvents />}
            />
            <Route path="/dashboard/crew" element={<DashboardCrew />} />
            <Route path="/dashboard/email-logs" element={<EmailLogsPage />} />
            <Route path="/dashboard/forms" element={<DashboardForms />} />
            <Route
              path="/dashboard/forms/create-form"
              element={<CreateForm />}
            />
            <Route
              path="/dashboard/forms/submissions/:formId"
              element={<ShowFormSubmissions />}
            />
            <Route path="/dashboard/email" element={<BulkMailer />} />
            <Route path="/dashboard/settings" element={<DashboardSettings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={SCAN_ACCESS_ROLES} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/scan" element={<QRScanner />} />
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
