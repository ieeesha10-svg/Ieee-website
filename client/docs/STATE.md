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

The UI branches on `user.role` (lowercased when compared):

- `utils/roleAccess.js` — `isAdminRole(role)`, `canUseScanPage(role)`, `dashboardHref(role)`
- `data/roles.js` — `ALL_ROLES`, `ADMIN_ROLES`, `SUPER_ADMIN_ROLES`, `SCAN_ACCESS_ROLES` (see [DATA.md](./DATA.md))

Examples:
- `ProtectedRoute requireAdmin` → only `board` / `xcom`.
- Login redirect → `isAdminRole(role)` ? `/dashboard` : `/dashboard/scan`.
- `useCreateForm` blocks submission unless `user.role` is `xcom`/`board`.

## Notes / Caveats

- `AuthContext` exposes `setUser` freely — it's used by login flows and `useLogout`.
- `UserLayout` fetches its **own** copy of the profile (`GET /users/profile`) rather than using `user` from context, so profile edits there are local to that layout.
- There is no separate auth state for roles beyond the `user` object; keep `data/roles.js` in sync with the backend's role definitions.
