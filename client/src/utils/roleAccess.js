import { ADMIN_ROLES, SCAN_ACCESS_ROLES } from "../data/roles";

export const isAdminRole = (role) => ADMIN_ROLES.includes(role?.toLowerCase());

export const canUseScanPage = (role) =>
  SCAN_ACCESS_ROLES.includes(role?.toLowerCase());

export const dashboardHref = (role) =>
  isAdminRole(role) ? "/dashboard" : "/dashboard/scan";
