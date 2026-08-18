# Architecture

How the frontend is wired together, from browser entry to routed pages.

## Request / Render Flow

```
index.html
  └─ src/main.jsx
       ├─ <AuthProvider>          // loads user once, gates the app on auth check
       └─ <App/>                  // <BrowserRouter> + all <Routes>
            ├─ <PublicLayout>     // PublicNavbar + Footer + <Outlet/>
            │    ├─ public pages
             │    ├─ <GuestRoute>  // auth pages (login/registration/verify)
            │    └─ <ProtectedRoute> + <UserLayout>  // /profile/*
            ├─ <ProtectedRoute requireAdmin> + <DashboardLayout>  // /dashboard/*
            ├─ <ProtectedRoute roles={SCAN_ACCESS_ROLES}> + <DashboardLayout>  // /dashboard/scan
            └─ catch-all → <NotFoundPage/>
```

## Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Entry | `src/main.jsx` | Mounts `AuthProvider` > `App` into `#root` |
| Routing | `src/App.jsx` | All routes, layouts, guards, redirects |
| Layouts | `src/layouts/` | `PublicLayout` (in `App.jsx`), `AuthLayout`, `UserLayout`, `DashboardLayout` |
| Pages | `src/pages/` | Route-level components (one per route) |
| Sections | `src/sections/` | Composable page sections (home/about/events) |
| Components | `src/components/` | Reusable UI (`ui/`), layout (`layout/`), guest-facing (`guest/`), dashboard (`dashboard/`), skeletons (`skeletons/`) |
| Hooks | `src/hooks/` | Data-fetching + UI state hooks (wraps `api`) |
| Context | `src/context/AuthContext.jsx` | Global auth/user state |
| Data | `src/data/` | Static data + role/permission maps |
| Utils | `src/utils/` | `api.js` Axios instance + helpers |

## Entry Point — `src/main.jsx`

```jsx
<React.StrictMode>
  <AuthProvider>
    <App />
  </AuthProvider>
</React.StrictMode>
```

`AuthProvider` runs a single `GET /users/profile` on mount, then only renders `children` once it resolves (`{!loading && children}`). So pages are never rendered before we know if the user is logged in. See [STATE.md](./STATE.md).

## Routing — `src/App.jsx`

All routes live here. Three reusable guards are defined in the same file:

- `ProtectedRoute({ requireAdmin, roles })` — redirects to `/login` when there is no `user`, when `roles` is provided and the role isn't included, or when `requireAdmin` is true and the role isn't in `ADMIN_ROLES`. Renders `<Outlet/>` when allowed.
- `GuestRoute` — redirects logged-in users to `/profile`.
- `PublicLayout` — renders navbar + footer around public pages. The footer is skipped for `/login`, `/registration`, `/verify`, `/forgot-password`, `/reset-password`, `/dev-team`, and `/applications`.

Full route table: [PAGES.md](./PAGES.md).

## Layouts

### `DashboardLayout` (`src/layouts/DashboardLayout.jsx`)
- Renders `AdminSidebar` + a sticky topbar (page title, member search, theme toggle, avatar).
- Sidebar items come from `src/data/DashboardNav.js` (`navItems` + `toolsItems`).
- Topbar subtitle is dynamically enriched: on `/dashboard/forms` it fetches form count, on `/dashboard/events` event count, on `/dashboard/users` user count.
- Member search uses `useMembersList({ pageSize: 5, enabled: isAdminRole(role) })`; clicking a result opens a `Modal` with member details and an "Export as Excel" button.

### `UserLayout` (`src/layouts/UserLayout.jsx`)
- Profile banner (avatar, name, badges) + sidebar with Account / IEEE Activity sections.
- Fetches its own copy of the profile via `GET /users/profile` and exposes it to child routes through `<Outlet context={{ userData, setUserData, isOffline }} />`.
- Handles loading, error/retry, and offline banner states.

### `AuthLayout` (`src/layouts/AuthLayout.jsx`)
- Wrapper for login/signup/verify pages. Props: `icon`, `title`, `subtitle`, `maxWidth` (default `max-w-md`).

## API Layer — `src/utils/api.js`

Single Axios instance shared by everything:

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,          // sends auth cookie automatically
  headers: { 'Content-Type': 'application/json' },
});
```

- Set `VITE_API_URL` in `.env` (see [CONTRIBUTING.md](./CONTRIBUTING.md)).
- `withCredentials: true` is critical — auth relies on cookies, not tokens in localStorage.
- One exception: `useSubmitForm` posts with raw `fetch` to `/submissions` (multipart for file uploads) but still passes `credentials: "include"`.

## Auth

- Single source of truth: `useAuth()` from `AuthContext` (see [STATE.md](./STATE.md)).
- Login redirects by role via `utils/roleAccess.js`: `isAdminRole(role)` → `/dashboard`, otherwise `canUseScanPage(role)` → `/dashboard/scan`.

## Static Sections vs API Data

- Home/About/Committees/Crew/DevTeam pages are mostly static, driven by `src/data/*` files.
- Events, forms, members, dashboards are fully API-driven through hooks in `src/hooks/`.

## Adding a Feature (Big Picture)

1. Add hook(s) in `src/hooks/` (e.g. `src/hooks/dashboard/` for admin features).
2. Build UI components in `src/components/` (or inline in the page if small).
3. Add the route in `src/App.jsx` inside the correct guard/layout.
4. Update `docs/PAGES.md` and `docs/HOOKS.md`.
