/**
 * ===== ROLE PERMISSIONS =====
 *
 * user    — Default student. Can register, login, view own profile,
 *           update own password, update own name/phone/etc.
 *           Cannot view other users, cannot manage members.
 *
 * member  — Paid IEEE member. Same as user + can perform CRUD on
 *           members (GET/POST/PATCH/DELETE /api/users/members).
 *
 * scanner — Event volunteer. Same as member — CRUD on members +
 *           scan page access (for event check-ins).
 *
 * board   — Board member. Dashboard access, can view/export all users,
 *           can manage members. Limited delete. Cannot create admins.
 *
 * xcom    — Tech head / chairman. Full control — everything board can
 *           do + can create other admin users (xcom/board/member/scanner)
 *           via POST /api/users/create-internal.
 */

export const ALL_ROLES = ["user", "member", "scanner", "board", "xcom"];

// Can view dashboard, all users, export
export const ADMIN_ROLES = ["board", "xcom"];

// Has full control + can create other admin users
export const SUPER_ADMIN_ROLES = ["xcom"];

// Can open and use the QR scan page (every role except the default "user")
export const SCAN_ACCESS_ROLES = ["member", "scanner", "board", "xcom"];
