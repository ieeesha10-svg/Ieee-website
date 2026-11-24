import React, { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { SCAN_ACCESS_ROLES } from "./data/roles";
import { canViewAdminPages, canWrite } from "./utils/roleAccess";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import UserLayout from "./layouts/UserLayout";

// Components
import PublicNavbar from "./components/layout/PublicNavbar";
import Footer from "./components/layout/Footer";
import LoadingPage from "./components/ui/LoadingPage";

// Pages
import Home from "./pages/Home";
import Events from "./pages/Events";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CrewPage from "./pages/CrewPage";
import CommitteesPage from "./pages/CommitteesPage";
import DevTeam from "./pages/DevTeam";

const EventRegistration = lazy(() => import("./pages/EventRegistration"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const ApplicationsPage = lazy(() => import("./pages/FormApplicationsPage"));
const FormSubmissionPage = lazy(() => import("./pages/FormSubmissionPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Auth Pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const ForgetPasswordPage = lazy(
  () => import("./pages/auth/ForgetPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));

// Dashboard Pages
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const DashboardMembers = lazy(
  () => import("./pages/dashboard/DashboardMembers"),
);
const DashboardCommitteeRequests = lazy(
  () => import("./pages/dashboard/DashboardCommitteeRequests"),
);
const DashboardEvents = lazy(
  () => import("./pages/dashboard/events/DashboardEvents"),
);
const CreateEvent = lazy(() => import("./pages/dashboard/events/CreateEvent"));
const FeaturedEvents = lazy(
  () => import("./pages/dashboard/events/FeaturedEvents"),
);
const DashboardCrew = lazy(() => import("./pages/dashboard/DashboardCrew"));
const EmailLogsPage = lazy(() => import("./pages/dashboard/EmailLogsPage"));
const DashboardForms = lazy(
  () => import("./pages/dashboard/forms/DashboardForms"),
);
const CreateForm = lazy(() => import("./pages/dashboard/forms/CreateForm"));
const ShowFormSubmissions = lazy(
  () => import("./pages/dashboard/forms/ShowFormSubmissions"),
);
const BulkMailer = lazy(() => import("./pages/dashboard/BulkMailer"));
const DashboardSettings = lazy(
  () => import("./pages/dashboard/DashboardSettings"),
);
const QRScanner = lazy(() => import("./pages/dashboard/QRScanner"));

// Profile Pages
const UserProfile = lazy(() => import("./pages/user-dashboard/UserProfile"));
const ChangePassword = lazy(
  () => import("./pages/user-dashboard/ChangePassword"),
);
const MyCommittees = lazy(() => import("./pages/user-dashboard/MyCommittees"));
const AttendedEvents = lazy(
  () => import("./pages/user-dashboard/AttendedEvents"),
);

const hideInitialLoader = () => {
  const loader = document.getElementById("initial-loader");
  if (!loader || loader.classList.contains("loader-hidden")) return;
  loader.classList.add("loader-hidden");
  setTimeout(() => loader.remove(), 400);
};

const DismissInitialLoader = () => {
  React.useEffect(() => {
    hideInitialLoader();
  }, []);
  return null;
};

const ProtectedRoute = ({
  requireAdmin = false,
  requireWrite = false,
  roles = null,
}) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles) {
    const allowed = roles.includes(user.role?.toLowerCase());
    if (!allowed) return <Navigate to="/login" replace />;
  }

  // "requireAdmin" means the user may open dashboard pages (board or xcom).
  // Per-control checks handle write permissions, and the server rejects writes
  // when the user does not have permission.
  if (requireAdmin) {
    const allowed = canViewAdminPages(user.role);
    if (!allowed) return <Navigate to="/login" replace />;
  }

  // Pages that create or send content are restricted to users who can write.
  if (requireWrite) {
    if (!canWrite(user.role)) return <Navigate to="/dashboard" replace />;
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
      {!([
        "/login",
        "/signup",
        "/registration",
        "/verify",
        "/forgot-password",
        "/reset-password",
        "/dev-team",
        "/applications",
      ].includes(location.pathname) ||
        location.pathname.startsWith("/applications/")) && <Footer />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter useTransitions={false}>
      <Suspense fallback={<LoadingPage />}>
        <DismissInitialLoader />
        <Routes>
          {/* Public pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventRegistration />} />
            <Route path="/events/:id/details" element={<EventDetails />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Guest-only authentication pages */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registration" element={<SignupPage />} />
              <Route path="/verify" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgetPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            <Route path="/crew" element={<CrewPage />} />
            {/* An archived season; without an id, /crew shows the published season. */}
            <Route path="/crew/season/:seasonId" element={<CrewPage />} />
            <Route path="/committees" element={<CommitteesPage />} />
            <Route path="/dev-team" element={<DevTeam />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            {/* Visitors can open a form without an account; the backend checks requiresLogin. */}
            <Route path="/applications/:id" element={<FormSubmissionPage />} />
      
 
         {/* User profile pages */}
<Route element={<ProtectedRoute />}>
  <Route path="/profile" element={<UserLayout />}>
    <Route index element={<UserProfile />} />
    <Route path="password" element={<ChangePassword />} />
    <Route path="committees" element={<MyCommittees />} />
    <Route path="events" element={<AttendedEvents />} />
  </Route>
</Route>
                </Route>

          {/* Dashboard pages */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/users" element={<DashboardMembers />} />
              <Route
                path="/dashboard/committee-requests"
                element={<DashboardCommitteeRequests />}
              />
              <Route path="/dashboard/events" element={<DashboardEvents />} />

              {/* Write-only pages */}
              <Route element={<ProtectedRoute requireWrite />}>
                <Route
                  path="/dashboard/events/create-event"
                  element={<CreateEvent />}
                />
                <Route
                  path="/dashboard/forms/create-form"
                  element={<CreateForm />}
                />
                <Route path="/dashboard/email" element={<BulkMailer />} />
              </Route>

              <Route
                path="/dashboard/events/flagship"
                element={<FeaturedEvents />}
              />
              <Route path="/dashboard/crew" element={<DashboardCrew />} />
              <Route path="/dashboard/email-logs" element={<EmailLogsPage />} />
              <Route path="/dashboard/forms" element={<DashboardForms />} />
              <Route
                path="/dashboard/forms/submissions/:formId"
                element={<ShowFormSubmissions />}
              />
              <Route
                path="/dashboard/settings"
                element={<DashboardSettings />}
              />
            </Route>
          </Route>

          {/* QR scanner: only the configured scan roles can access it. */}
          <Route element={<ProtectedRoute roles={SCAN_ACCESS_ROLES} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard/scan" element={<QRScanner />} />
            </Route>
          </Route>

          {/* Fallback page */}
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
