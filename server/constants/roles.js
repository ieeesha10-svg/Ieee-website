/**
 * The single source of truth for role names on the server.
 *
 * These used to be re-typed inline in every `authorize(...)` call, and the lists
 * had already drifted apart from each other and from the schema enum. Import
 * them from here instead.
 *
 * `xcom` is the stored value; the UI labels it "Excom".
 */

// Can open the dashboard at all. A "member" is deliberately absent: they get
// the public site and their own profile, nothing behind /dashboard.
const DASHBOARD_ROLES = ['scanner', 'board', 'xcom'];

// Can read dashboard data. "board" is a read-only oversight role.
const VIEW_ROLES = ['board', 'xcom'];

// Can change data. This is the important one: it is deliberately xcom-only, so
// board cannot perform actions, add anything, or make changes.
const WRITE_ROLES = ['xcom'];

// Everything a Scanner can do, for any role that should be able to scan.
const SCAN_ROLES = ['scanner', 'board', 'xcom'];

// Roles that may be assigned to a user. Mirrors the UserModel enum.
const ASSIGNABLE_ROLES = ['member', 'scanner', 'board', 'xcom'];

// Human-facing labels. Keep the keys in sync with ASSIGNABLE_ROLES.
const ROLE_LABELS = {
  member: 'Member',
  scanner: 'Scanner',
  board: 'Board',
  xcom: 'Excom',
};

module.exports = {
  DASHBOARD_ROLES,
  VIEW_ROLES,
  WRITE_ROLES,
  SCAN_ROLES,
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
};
