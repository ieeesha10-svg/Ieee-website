# Hooks

All custom hooks live in `src/hooks/`. They wrap `src/utils/api.js` (Axios) and return state + actions. Feature groups:

- `src/hooks/` — public/shared hooks
- `src/hooks/auth/` — login/register/verify/logout
- `src/hooks/dashboard/` — admin features (users/members, committees, events, forms, email)
- `src/hooks/dashboard/events/` and `src/hooks/dashboard/forms/` — event/form CRUD

> Convention: hooks expose `loading`, `error`, and a `refetch`/mutator function. Errors generally surface via `toast` (react-hot-toast) or an `error` state.

## Public Hooks (`src/hooks/`)

| Hook | Endpoint(s) | Returns | Notes |
|------|-------------|---------|-------|
| `usePublicEvents` | `GET /activities?page=&limit=10` (paginates all), `GET /form` | `{ upcoming, previous, loading, error, refetch }` | Options: `{ maxPages }` — limits how many pages to fetch (default: all). Merges activities with linked registration forms; splits into Active/Completed |
| `usePublicForms` | `GET /form` | `{ forms, isLoading, refetch }` | Only standalone forms (`status === "Active" && !activityID`) |
| `usePublicForm` (in `usePublicFormById.js`) | `GET /form/:id` | `{ form, isLoading, error }` | |
| `useSubmitForm` | `POST /submissions` (raw fetch, multipart) | `{ submit, loading, error, alreadySubmitted, ticketCode, reset, setAlreadySubmitted }` | ⚠️ Duplicate-submission detection relies on an exact message string match ("You already submitted this form") — fragile, see code comment |
| `useSeasons` | `GET /seasons` | `{ seasons, isLoading, error, refetch }` | Every season with its headcount, newest first. Powers the dashboard's season picker |
| `useSeason(seasonId?)` | `GET /seasons/home` or `GET /seasons/:id` | `{ season, excom, board, isLoading, error }` | **No `seasonId` means the published season**, i.e. the one the home page shows. Drives `/crew`, `/crew/season/:seasonId` and the home Excom. The Excom/Board split is done server-side so both sections arrive ready to render |
| `useEmailQuota` | `GET /emails/quota` | `{ quota, isLoading, error, refetch }` | How much of Brevo's **daily** transactional allowance is left, drawn as a progress bar in Settings. The number comes from Brevo, not from our own `emaillogs`, because Brevo is the only authority on what remains. `quota.available === false` means Brevo could not be read, which is rendered as a neutral "could not read" state with a retry - deliberately not a toast or a zero, since neither would be true |
| `useDarkMode` | — | `[colorTheme, setTheme]` | localStorage `theme` + `.dark` class on `<html>` |
| `useJoinMenu(navigate)` | — | `{ ref, open, toggle, openMenu, close, handleNavigate }` | Takes `navigate` from `useNavigate()`. Dropdown open/close + outside-click + Esc handling |
| `usePublicSettings` | `GET /settings/public` (public) | `{ registrationOpen, committeeApplicationsOpen, loading, refetch }` | The two site-wide switches a visitor needs to know about, in one request. `null` until the answer arrives so a page can withhold itself rather than flash the wrong state. Fails open — the server still refuses a closed request, so the worst case is finding out after submitting |
| `useCommitteeApplication` | `GET /committee-requests/my`, `POST /committee-requests` | `{ user, pending, applying, loading, apply(label), reload }` | Drives the apply button on the public committees page. Reads `useAuth` for the current member and surfaces their one pending request, so a second apply is explained rather than failing silently. Board/xcom members are accepted immediately and the profile is refreshed in place |

## Auth Hooks (`src/hooks/auth/`)

| Hook | Endpoint | Returns | Notes |
|------|----------|---------|-------|
| `useLogin` | `POST /users/login` | `{ login(email, password), loading, error }` | Throws on error; caller decides redirect |
| `useRegister` | `POST /users/register` | `{ register(payload), loading, error }` | |
| `useVerifyAccount` | `POST /users/verify-email` | `{ verifyAccount(email, otp), loading, error }` | |
| `useLogout` | `POST /users/logout` | `{ logout(e?), loading }` | Navigates to `/`, clears user, toasts |
| `useDeleteMember` | `DELETE /users/members/:id` | `{ deleteMember(member), deleting }` | Toasts success/failure |
| `useForgetPassword` | `POST /users/forgot-password` | `{ forgetPassword(email), loading, error }` | Sends reset email |
| `useResetPassword` | `POST /users/reset-password` | `{ resetPassword(password), loading, error }` | Resets password via token from email link |

## Dashboard Hooks (`src/hooks/dashboard/`)

### Users / Members

| Hook | Endpoint(s) | Returns | Notes |
|------|-------------|---------|-------|
| `useDashboard` | `GET /states/dashboard` | `{ data, loading, error }` | Shapes stats cards, college/year charts, top members, latest signups |
| `useMembersList` | `GET /users/all?...` | `{ members, totalCount, totalPages, filters, toggles, page, loading, resetFilters, hasActiveFilters }` | Debounced search (300ms), college/year/role/position filters, AbortController cancellation. Loads filter options via `GET /users/all?limit=1000`. Also used by `DashboardLayout` (pageSize 5) for the topbar search |
| `useSearchMembers` | `GET /users/search?keyword=` | `{ keyword, setKeyword, results, isLoading, error }` | Debounced; min 2 chars |
| `useExportUsers` | `POST /users/export-specific` (blob) | `{ exporting, exportUsers(ids) }` | Downloads `.xlsx` |
| `useUpdateRole` | `PATCH /users/members/:id` | `{ updatingRole, updateRole(id, newRole, prevRole, setRoles) }` | Optimistic with rollback |
| `useGetAdmins` | `GET /users/all?role=board,xcom&limit=100` | `{ admins, adminRoles, setAdmins, setAdminRoles, loading, refetch }` | Fetches admin list + roles for the "User Permissions" section of DashboardSettings; exposes state setters for optimistic updates |
| `useUserUpdate` | `GET /users/members/:id`, `PUT /users/profile/:id`, `PUT /users/update-password/:id` | `{ userData, loading, error, savingProfile, savingPassword, updateProfile, updatePassword }` | Used on user profile pages |
| `useSeasons` (dashboard) | `GET /seasons`, `POST /seasons`, `PUT /seasons/:id`, `PUT /seasons/:id/home`, `DELETE /seasons/:id` | `{ seasons, isLoading, error, isSaving, createSeason, renameSeason, publishSeason, deleteSeason, refetch }` | All writes are admin-only. `publishSeason` is the only thing that changes which season the home page shows, and the server unpublishes the others in the same call. Deleting a season that still has members is refused by the server rather than cascading |
| `useCrewForSeason(seasonId)` | `GET /crew?season=`, `POST /crew`, `PUT /crew/:id`, `DELETE /crew/:id` | `{ excom, board, isLoading, error, isSaving, addMember, updateMember, removeMember, refetch }` | Members come back grouped by section, which is the shape the dashboard renders. Refetches on `seasonId` change so switching seasons cannot leave the previous season's people on screen |

### Committees

| Hook | Endpoint(s) | Returns | Notes |
|------|-------------|---------|-------|
| `useReviewCommitteeRequests` | `GET /committee-requests?status=pending&page=&limit=`, `PUT /committee-requests/:id/status` | `{ requests, loading, page, totalPages, totalCount, refetch, processRequest, processingId }` | Paginated pending requests; approve/reject refetches the list |
| `useSubmitCommitteeRequest` | `POST /committee-requests` | `{ submitting, submitRequest(committeePosition) }` | Submits a committee-change request for the current user; board/xcom users are auto-accepted server-side |
| `useChangeMemberCommittee` | `PUT /committee-requests/:memberId/position` | `{ updatingCommittee, updateCommittee(id, name, new, prev, setCommittees) }` | Directly changes a member's committee; optimistic with rollback |

### Events (`src/hooks/dashboard/events/`)

| Hook | Endpoint(s) | Returns | Notes |
|------|-------------|---------|-------|
| `useEvents` | `GET /activities?page=1&limit=1000`, `GET /form` | `{ allEvents, paginatedEvents, statusFilter, setFilter, counts, loading, error, page, setPage, pagination, refetch }` | Client-side pagination (9/page) + Active/Completed filter |
| `useCreateEvent` | `POST /activities`, `PUT /activities/:id` (cover image) | `{ createEvent(payload, coverImageFile), loading }` | Builds payload via `utils/eventUtils.buildPayload` |
| `useGetEvent` | `GET /activities/:id` | `{ getEventById(id) }` | |
| `useUpdateEvent` | `PUT /activities/:id` | `{ updateEvent(id, payload, coverImageFile, coverImageRemoved), loading }` | |
| `useDeleteEvent` | `DELETE /activities/:id` | `{ deleteEvent(id), loading }` | |
| `useFeaturedEvents` | `GET /activities/featured`, `GET /form` | `{ featured, loading, error, refetch }` | Plus `useAddFeatured`, `useRemoveFeatured`, `useSwapFeatured` (same file) |

### Forms (`src/hooks/dashboard/forms/`)

| Hook | Endpoint(s) | Returns | Notes |
|------|-------------|---------|-------|
| `useForms` | `GET /form?page=1&limit=1000`, `GET /activities/:id`, `GET /submissions/form/:id`, `PUT /form/:id/toggle` | `{ forms, paginatedForms, filter, openCount, closedCount, eventCount, page, totalPages, pagination, isLoading, refetch }` | Resolves event titles; counts responses; **auto-closes expired forms** via toggle |
| `useCreateForm` | `POST /form` | `{ formData, updateField, fieldsList, addField, updateFieldAt, removeFieldAt, moveField, handleSubmit, isSubmitting, errors, isAuthorized }` | Full form-builder state; validates fields; builds payload with slugified unique field ids |
| `useUpdateForm` | `PUT /form/:id/settings` | `{ updateForm(formId, updates) }` | |
| `useDeleteForm` | `DELETE /form/:id` | `{ deleteForm(id, title) }` | |
| `useToggleForm` | `PUT /form/:id/toggle` | `{ toggleFormStatus(id, title, becomingOpen) }` | |
| `useExportFormSubmissions` | `GET /submissions/export/:formId` (blob) | `{ exporting, exportSubmissions(formId, filename) }` | Downloads submissions as `.xlsx` |

### Email

| Hook | Endpoint(s) | Returns | Notes |
|------|-------------|---------|-------|
| `useEmailLogs` | `GET /emails/logs?page=&limit=&search=&status=` | `{ logs, loading, search, setSearch, statusFilter, setStatusFilter, page, setPage, pagination }` | 500ms debounce; maps backend statuses ("Done"/"Rejected"/...) to UI statuses (delivered/failed/pending) |

### Site Settings

| Hook | Endpoint(s) | Returns | Notes |
|------|-------------|---------|-------|
| `useSiteSettings` | `GET /settings`, `PUT /settings/registration`, `PUT /settings/committee-applications` | `{ registrationOpen, committeeApplicationsOpen, loading, saving, setRegistration(open), setCommitteeApplications(open), refetch }` | Admin-only, drives `ToggleSwitch` in DashboardSettings. Flips optimistically and rolls back if the server refuses. `saving` names the switch mid-flight so each row disables only itself. Neither switch affects sign-in or the review of already-submitted applications |

### Submissions

| Hook | Endpoint(s) | Returns | Notes |
|------|-------------|---------|-------|
| `useFormSubmissions` (in `useGetSubmissions.js`) | `GET /submissions/form/:id` | `{ submissions, total, isLoading, error }` | |

## Utility Files in `src/utils/`

Not hooks, but used by them:

| File | Purpose |
|------|---------|
| `api.js` | Axios instance (baseURL from `VITE_API_URL`, `withCredentials: true`) |
| `eventUtils.js` | `mapActivity`, `buildPayload`, `isHtmlContentEmpty`, `getTypeColor`, `formatDate`, `formatEventDate` |
| `dateUtils.js` | `toLocalDatetimeString` (datetime-local input value) |
| `fileUploadUtils.js` | `ACCEPTED_FILE_TYPES`, `ACCEPTED_FILE_EXTENSIONS`, `useFileUpload` helper (10MB limit, PDF/JPG/PNG/GIF/WEBP/DOC/DOCX) |
| `formatAcademicYear.js` | `formatAcademicYear(year)` |
| `roleAccess.js` | `isAdminRole`, `canUseScanPage`, `dashboardHref` |
