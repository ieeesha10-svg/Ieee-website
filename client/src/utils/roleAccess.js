import {
  DASHBOARD_ROLES,
  VIEW_ROLES,
  WRITE_ROLES,
  SCAN_ACCESS_ROLES,
  ROLE_LABELS,
} from "../data/roles";

const norm = (role) => role?.toLowerCase();

export const isAdminRole = (role) => WRITE_ROLES.includes(norm(role));

export const canViewDashboard = (role) => DASHBOARD_ROLES.includes(norm(role));

export const canViewAdminPages = (role) => VIEW_ROLES.includes(norm(role));

// The single check every write control should be wrapped in.
export const canWrite = (role) => WRITE_ROLES.includes(norm(role));

export const canUseScanPage = (role) =>
  SCAN_ACCESS_ROLES.includes(norm(role));

export const roleLabel = (role) => ROLE_LABELS[norm(role)] || "—";

// Where the Dashboard button should point. A scanner goes straight to the scan
// page; board and xcom land on the dashboard home.
export const dashboardHref = (role) =>
  canViewAdminPages(role) ? "/dashboard" : "/dashboard/scan";

// Where to send someone after login or email verification.
// A member has no dashboard, so they land on their profile.
export const landingRoute = (role) =>
  canViewAdminPages(role)
    ? "/dashboard"
    : canUseScanPage(role)
      ? "/dashboard/scan"
      : "/profile";
