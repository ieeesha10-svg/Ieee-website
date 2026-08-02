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
| `PublicLayout` | `App.jsx:81` | Renders `PublicNavbar` + `Footer`. Footer is hidden on `/login`, `/signup`, `/verify`, `/dev-team`, and `/applications*` |
| `GuestRoute` | `App.jsx:75` | If `user` exists → redirect to `/profile` |
| `ProtectedRoute` | `App.jsx:55` | No `user` → redirect to `/login`. With `requireAdmin` → role must be in `ADMIN_ROLES` (`board`, `xcom`). With `roles` → role must be in the passed list |
| Catch-all | `App.jsx:162` | Unknown routes → `NotFoundPage` with `PublicNavbar` |

## Public Routes

| Route | Component (`src/pages/`) | Status | Notes |
|-------|---------------------------|--------|-------|
| `/` | `Home` | ✅ | Composes Hero, Achievements, Chapters, MembershipBenefits, JoinUs, FlagshipEvents, Chairpersons, Mission/Vision, Legacy sections |
| `/events` | `Events` | ✅ | Upcoming + previous events via `usePublicEvents` |
| `/events/:id` | `EventRegistration` | ✅ | Event page + linked registration form (`usePublicForm`) |
| `/events/:id/details` | `EventDetails` | ✅ | Full event details page |
| `/about` | `AboutPage` | ✅ | Board, committees, impact stats, CTA sections |
| `/contact` | `ContactPage` | ✅ | Contact form + social media links |
| `/crew` | `CrewPage` | ✅ | Crew members via `useCrew` |
| `/committees` | `CommitteesPage` | ✅ | Static committee cards from `src/data/committeesData.js` |
| `/dev-team` | `DevTeam` | ✅ | Static team from `src/data/devTeamData.js` |
| `/applications` | `FormApplicationsPage` | ✅ | Lists public forms via `usePublicForms` |
| `/applications/:id` | `FormSubmissionPage` | ✅ | **Protected** — submits a form (`usePublicForm` + `useSubmitForm`) |

## Auth Routes (guest only)

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/login` | `auth/LoginPage` | ✅ | Email + password (`useLogin`). Redirects based on role |
| `/signup` | `auth/SignupPage` | ✅ | Name, email, phone, age, uni, college, year, password (`useRegister`) |
| `/verify` | `auth/VerifyEmailPage` | ✅ | Email + 6-digit OTP (`useVerifyAccount`) |

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

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/dashboard` | `dashboard/DashboardHome` | ✅ | Stats + charts via `useDashboard` |
| `/dashboard/users` | `dashboard/DashboardMembers` | ✅ | Members list, filters, role management (`useMembersList`, `useUpdateRole`, `useDeleteMember`) |
| `/dashboard/events` | `dashboard/events/DashboardEvents` | ✅ | Event table + view/edit modals |
| `/dashboard/events/create-event` | `dashboard/events/CreateEvent` | ✅ | Create event + registration form (`useCreateEvent`) |
| `/dashboard/events/flagship` | `dashboard/events/FeaturedEvents` | ✅ | Manage featured events (`useFeaturedEvents`, add/remove/swap) |
| `/dashboard/crew` | `dashboard/DashboardCrew` | ✅ | Crew management + committee requests (`useCommitteeRequests`, `useChangeCommittee`) |
| `/dashboard/forms` | `dashboard/forms/DashboardForms` | ✅ | Forms list, filters, open/close/delete (`useForms`, `useToggleForm`, `useDeleteForm`) |
| `/dashboard/forms/create-form` | `dashboard/forms/CreateForm` | ✅ | Form builder (`useCreateForm`) |
| `/dashboard/forms/submissions/:formId` | `dashboard/forms/ShowFormSubmissions` | ✅ | Responses for a form (`useFormSubmissions`) |
| `/dashboard/email` | `dashboard/BulkMailer` | ✅ | Compose + send broadcast emails |
| `/dashboard/email-logs` | `dashboard/EmailLogsPage` | ✅ | Delivery history (`useEmailLogs`) |
| `/dashboard/settings` | `dashboard/DashboardSettings` | ✅ | Admin profile, site config |

## Scan Route (member / scanner / board / xcom)

Separate route group guarded by `ProtectedRoute roles={SCAN_ACCESS_ROLES}`.

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/dashboard/scan` | `dashboard/QRScanner` | ✅ | QR attendance scanner (html5-qrcode) |

> Note: `SCAN_ACCESS_ROLES` includes `member`, `scanner`, `board`, `xcom` — so non-admin volunteers can access this single route, while the rest of `/dashboard/*` stays admin-only.

## Adding a New Route

See [CONTRIBUTING.md](./CONTRIBUTING.md#adding-a-new-route) for the step-by-step.
