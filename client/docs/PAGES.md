# Pages & Routes

All routes are defined in `src/App.jsx`. Routing is handled by `react-router-dom` v7 (`BrowserRouter`).

There are **four** route groups, each wrapped in its own guard/layout:

1. Public pages (`PublicLayout`)
2. Auth pages (`GuestRoute` — logged-in users are redirected away)
3. User profile (`ProtectedRoute`)
4. Admin dashboard (`ProtectedRoute requireAdmin` / role list)

## Route Guards

| Guard | Defined in `App.jsx` | Behavior |
|-------|----------------------|----------|
| `PublicLayout` | `App.jsx:97` | Renders `PublicNavbar` + `Footer`. Footer is hidden on `/login`, `/registration`, `/verify`, `/forgot-password`, `/reset-password`, `/dev-team`, and `/applications` |
| `GuestRoute` | `App.jsx:91` | If `user` exists → redirect to `/profile` |
| `ProtectedRoute` | `App.jsx:73` | No `user` → redirect to `/login`. With `requireAdmin` → `canViewAdminPages`, i.e. `board` / `xcom`. With `requireWrite` → `canWrite`, i.e. `xcom` only, used for the write-only pages. With `roles` → role must be in the passed list |
| Catch-all | `App.jsx:193` | Unknown routes → `NotFoundPage` with `PublicNavbar` |

## Public Routes

| Route | Component (`src/pages/`) | Status | Notes |
|-------|---------------------------|--------|-------|
| `/` | `Home` | ✅ | Composes Hero, MissionVision, MembershipBenefits, FlagshipEvents, Chapters, Chairpersons, JoinUs sections |
| `/events` | `Events` | ✅ | Upcoming + previous events via `usePublicEvents` |
| `/events/:id` | `EventRegistration` | ✅ | Event page + linked registration form (fetches `GET /activities/:id`, submits via `useSubmitForm`) |
| `/events/:id/details` | `EventDetails` | ✅ | Full event details page |
| `/about` | `AboutPage` | ✅ | HeroAbout, ImpactStats, WhatWeDo, Committees, Board, CTA sections — wrapped in `Wrapper` with odd/even alternating backgrounds. The Board section is the **published season's Excom** from `useSeason()`, counselor full-width, not a hardcoded list |
| `/contact` | `ContactPage` | ✅ | Contact form + social media links |
| `/crew` | `CrewPage` | ✅ | Excom + Board of the **published** season, via `useSeason()` with no id. Season labels at the bottom link to the other seasons |
| `/crew/season/:seasonId` | `CrewPage` | ✅ | Same page reading `seasonId` from the URL, i.e. an archived season. Every other season is offered as a label |
| `/committees` | `CommitteesPage` | ✅ | Static committee cards from `src/data/committeesData.js` |
| `/dev-team` | `DevTeam` | ✅ | Static team from `src/data/devTeamData.js` |
| `/applications` | `FormApplicationsPage` | ✅ | Lists public forms via `usePublicForms` |
| `/applications/:id` | `FormSubmissionPage` | ✅ | **Protected** — submits a form (`usePublicForm` + `useSubmitForm`) |

## Auth Routes (guest only)

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/login` | `auth/LoginPage` | ✅ | Email + password (`useLogin`). Redirects based on role |
| `/registration` | `auth/SignupPage` | ✅ | Name, email, phone, age, uni, college, year, password (`useRegister`) |
| `/verify` | `auth/VerifyEmailPage` | ✅ | Email + 6-digit OTP (`useVerifyAccount`) |
| `/forgot-password` | `auth/ForgetPasswordPage` | ✅ | Email input (`useForgetPassword`). Sends reset email |
| `/reset-password` | `auth/ResetPasswordPage` | ✅ | New password + confirm (`useResetPassword`). Token from email link |

## User Profile Routes (`ProtectedRoute`)

Wrapped in `UserLayout` (profile banner + account/activity sidebar).

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/profile` | `user-dashboard/UserProfile` | ✅ | Editable profile (`useUserUpdate`) |
| `/profile/password` | `user-dashboard/ChangePassword` | ✅ | Change password (`useUserUpdate`) |
| `/profile/committees` | `user-dashboard/MyCommittees` | ✅ | Committee membership view |
| `/profile/events` | `user-dashboard/AttendedEvents` | ✅ | Attended events list |

## Admin Dashboard Routes

Wrapped in `DashboardLayout` (admin sidebar + topbar with member search). Guarded by `ProtectedRoute requireAdmin` (`board` / `xcom`).

**`board` is read-only.** The pages below all render for a board member, but
every write control in them is hidden (`canWrite(user?.role)`) and the page shows
`<ReadOnlyBanner />`. The server refuses those writes with `403` regardless, so
this is presentation, not protection.

The three rows marked **xcom only** are additionally wrapped in
`ProtectedRoute requireWrite`, and are hidden from the sidebar for `board`
(`writeOnly: true` in `data/DashboardNav.js`). They exist only to perform a
write, so showing a board member an empty page would be pointless.

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/dashboard` | `dashboard/DashboardHome` | ✅ | Stats + charts via `useDashboard` |
| `/dashboard/users` | `dashboard/DashboardMembers` | ✅ | Members list, filters, role management (`useMembersList`, `useUpdateRole`, `useDeleteMember`); direct committee change (`useChangeMemberCommittee`). Role and committee selects are read-only text for `board` |
| `/dashboard/committee-requests` | `dashboard/DashboardCommitteeRequests` | ✅ | Committee applications as three tabs — Pending (approve/reject), Approved and Rejected, each row naming the admin who decided it (`useReviewCommitteeRequests`). `board` sees the queue, `xcom` decides |
| `/dashboard/events` | `dashboard/events/DashboardEvents` | ✅ | Event table + view/edit modals. `board` gets View only |
| `/dashboard/events/create-event` | `dashboard/events/CreateEvent` | ✅ | **xcom only.** Create event + registration form (`useCreateEvent`) |
| `/dashboard/events/flagship` | `dashboard/events/FeaturedEvents` | ✅ | Manage featured events (`useFeaturedEvents`). `board` can preview; add/remove/swap/edit are xcom-only |
| `/dashboard/crew` | `dashboard/DashboardCrew` | ✅ | Season management (create / rename / **publish to home** / delete) + the Excom and Board of the selected season. Member CRUD with LinkedIn, Facebook, Collabatek, email and website (`useSeasons`, `useCrewForSeason`). `board` reads the lists |
| `/dashboard/forms` | `dashboard/forms/DashboardForms` | ✅ | Forms list, filters, open/close/delete (`useForms`, `useToggleForm`, `useDeleteForm`). The open/close toggle is disabled for `board` |
| `/dashboard/forms/create-form` | `dashboard/forms/CreateForm` | ✅ | **xcom only.** Form builder (`useCreateForm`) |
| `/dashboard/forms/submissions/:formId` | `dashboard/forms/ShowFormSubmissions` | ✅ | Responses for a form (`useFormSubmissions`). Read-only, so `board` may use it |
| `/dashboard/email` | `dashboard/BulkMailer` | ✅ | **xcom only.** Compose + send broadcast emails. `board` reads the delivery history in Email Logs instead |
| `/dashboard/email-logs` | `dashboard/EmailLogsPage` | ✅ | Delivery history (`useEmailLogs`) |
| `/dashboard/settings` | `dashboard/DashboardSettings` | ✅ | Admin profile, site config, user permissions, backup. `board` reads; xcom writes |

## Scan Route (scanner / board / xcom)

Separate route group guarded by `ProtectedRoute roles={SCAN_ACCESS_ROLES}`.

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/dashboard/scan` | `dashboard/QRScanner` | ✅ | QR attendance scanner (html5-qrcode) |

> Note: `SCAN_ACCESS_ROLES` is `scanner`, `board`, `xcom` — so a volunteer scanner
> reaches this single route while the rest of `/dashboard/*` stays admin-only.
> A plain `member` is not in the list and has no dashboard. Scanner is in
> `DASHBOARD_ROLES` only because the scan page renders inside `DashboardLayout`;
> `AdminSidebar` gives it the scan tool and nothing else.

## Adding a New Route

See [CONTRIBUTING.md](./CONTRIBUTING.md#adding-a-new-route) for the step-by-step.
