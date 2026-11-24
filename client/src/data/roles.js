/**
 * ===== ROLE PERMISSIONS =====
 *
 * Four roles. These must stay in step with server/constants/roles.js and the
 * enum in server/models/UserModel.js — the two are separate deploys, so nothing
 * enforces the match automatically. The RBAC test in the server package checks
 * the server side; keep this list by hand.
 *
 * member  — Everyone who registers. Public site, own profile, own password.
 *           No dashboard at all.
 *
 * scanner — Event volunteer. Reaches /dashboard/scan and marks attendance.
 *           Cannot see any other dashboard data.
 *
 * board   — Board member. Reads the whole dashboard; changes nothing. Can also
 *           do whatever a scanner can.
 *
 * xcom    — Excom. Full control: every write on the dashboard, plus creating
 *           users and changing other people's roles. Cannot change their own.
 *
 * "xcom" is the stored value; the UI shows it as "Excom" (see ROLE_LABELS).
 * There is deliberately no "user" role any more — self-registration always
 * produces a "member".
 */

// Every role, for filters and dropdowns. Mirrors the schema enum.
export const ALL_ROLES = ["member", "scanner", "board", "xcom"];

// Can open the dashboard at all. A "member" is absent on purpose: they get the
// public site and their own profile, nothing behind /dashboard.
export const DASHBOARD_ROLES = ["scanner", "board", "xcom"];

// Can read dashboard data. Board is the read-only oversight role.
export const VIEW_ROLES = ["board", "xcom"];

// Can change data — the important one. xcom only, so board cannot perform an
// action, add anything, or make a change.
export const WRITE_ROLES = ["xcom"];

// Everything a scanner can do, for any role that should be able to scan.
export const SCAN_ACCESS_ROLES = ["scanner", "board", "xcom"];

// What the user sees. Keep in step with the roles above.
export const ROLE_LABELS = {
  member: "Member",
  scanner: "Scanner",
  board: "Board",
  xcom: "Excom",
};

// Short note shown on read-only pages so board knows why buttons are missing.
export const READ_ONLY_NOTICE =
  "You have read-only access. Contact an Excom member to make changes.";
