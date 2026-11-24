# Global State

There is exactly **one** global context: `AuthContext` in `src/context/AuthContext.jsx`.

## What it provides

Wrapped around the whole app in `src/main.jsx`:

```jsx
const { user, setUser, loading } = useAuth();
```

| Value | Type | Description |
|-------|------|-------------|
| `user` | `object \| null` | The logged-in user profile (`{ _id, name, email, role, ... }`) or `null` |
| `setUser` | `fn` | Manually update the user object (e.g. after login) |
| `loading` | `boolean` | `true` until the initial auth check finishes |

> **Note:** Logout is handled by the `useLogout` hook (`src/hooks/auth/useLogout.js`), not the context. It calls `POST /users/logout`, clears the user via `setUser(null)`, and hard-redirects to `/login`.

## How it loads

On mount, `AuthProvider` calls `GET /users/profile`:

```js
useEffect(() => {
  api.get('/users/profile')
    .then(({ data }) => setUser(data?.user))
    .catch(() => setUser(null))
    .finally(() => setLoading(false));
}, []);
```

- If the request succeeds, `user` is populated.
- If it fails (401/network), `user` stays `null` and the app treats the visitor as logged out.

**The app only renders after this check** — the provider renders `{!loading && children}`, so `user` is always settled by the time any page mounts. This is why route guards in `App.jsx` can read `user` synchronously.

## Auth is cookie-based

No tokens are stored in `localStorage`. The backend sets an HTTP-only cookie, and the Axios instance (`src/utils/api.js`) sends it with `withCredentials: true`. Logging out clears it via `POST /users/logout`.

## Role-driven UI

The UI branches on `user.role` through two modules, never on raw strings:

- `utils/roleAccess.js` — `canViewAdminPages(role)`, `canWrite(role)`, `canViewDashboard(role)`, `canUseScanPage(role)`, `roleLabel(role)`, `dashboardHref(role)`, `landingRoute(role)`
- `data/roles.js` — `ALL_ROLES`, `DASHBOARD_ROLES`, `VIEW_ROLES`, `WRITE_ROLES`, `SCAN_ACCESS_ROLES`, `ROLE_LABELS`, `READ_ONLY_NOTICE` (see [DATA.md](./DATA.md))

The four roles are `member` (default, no dashboard), `scanner` (scan page only),
`board` (reads the dashboard, changes nothing) and `xcom` (every write, shown as
**Excom**).

Examples:
- `ProtectedRoute requireAdmin` → `canViewAdminPages`, i.e. `board` / `xcom`.
- `ProtectedRoute requireWrite` → `canWrite`, i.e. `xcom` only. Used for the
  pages that are nothing but a write: the event and form builders, and the
  bulk mailer.
- `ProtectedRoute roles={SCAN_ACCESS_ROLES}` → the `/dashboard/scan` group.
  Scanner is in the list on purpose even though they cannot open the rest of the
  dashboard, because the scan page sits inside `DashboardLayout`.
- Login and email-verification redirect → `landingRoute(role)`.
- Every write control in a dashboard page is wrapped in `canWrite(user?.role)`.
  A page that has writes also renders `<ReadOnlyBanner />` when it doesn't, so a
  board member is told the access is deliberate rather than broken.
- `useCreateForm` refuses to submit unless `canWrite(user.role)`.

## Notes / Caveats

- `AuthContext` exposes `setUser` freely — it's used by login flows and `useLogout`.
- `UserLayout` fetches its **own** copy of the profile (`GET /users/profile`) rather than using `user` from context, so profile edits there are local to that layout.
- There is no separate auth state for roles beyond the `user` object; keep `data/roles.js` in sync with `server/constants/roles.js` and the `UserModel` enum.
- **Hiding a control is not enforcement.** The client gates writes for the user's
  benefit; the server is what actually refuses them. A write that is hidden in
  the UI but unguarded on the server is a bug — when you add one, add the
  `authorize(...WRITE_ROLES)` too.
