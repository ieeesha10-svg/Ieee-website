# Contributing to the Frontend

Guidelines for the developers maintaining the client. Start with [INDEX.md](./INDEX.md) for orientation.

## Need Help?

See the **Getting Help** section in [INDEX.md](./INDEX.md). Reach out to the maintainer (LinkedIn / WhatsApp) — better to ask than to guess.

## Before You Start

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) and [PAGES.md](./PAGES.md).
- Read [STATE.md](./STATE.md) to understand auth and roles.
- Run `npm install` and `npm run dev` to confirm the app boots.
- Check the backend API contract for the endpoint you're about to use (roles, query params, response shapes). The frontend hooks encode many of these assumptions.

## Code Conventions

- **JavaScript (JSX), not TypeScript.** No type-checking step; be careful with API response shapes.
- **Functional components + hooks only.** No class components.
- **One hook per concern**, grouped by feature folder (`src/hooks/dashboard/events/`, etc.).
- **Named exports** for hooks and page-level components; `export default` for many shared components (follow the file's existing style).
- **Design tokens over raw hex.** Use `bg-primary`, `text-foreground`, `text-muted`, `border-border`, etc. (see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)).
- **Always handle dark mode** — semantic tokens do it automatically; use `dark:` variants otherwise.
- **Toasts** for user feedback via `react-hot-toast` (`toast.success/error`).
- **Errors** from hooks: prefer `err.response?.data?.message` over `err.message`.
- **No comments unless they explain a non-obvious decision.** Existing code has useful ones (e.g. `useSubmitForm`) — keep those in mind.
- **AbortController + debounce** pattern for search/autocomplete hooks (`useMembersList`, `useSearchMembers`).

## Adding a New Route

1. Create the page component under `src/pages/` (or `src/pages/dashboard/` / `src/pages/user-dashboard/` for those areas).
2. Add the `<Route>` in `src/App.jsx` inside the right layout/guard:
   - Public → inside `<Route element={<PublicLayout />}>`
   - Auth-only (login/signup/verify) → inside `<GuestRoute>`
   - Any logged-in user → inside `<ProtectedRoute />`
   - Admin → inside `<Route element={<ProtectedRoute requireAdmin />}>` (nested under `<DashboardLayout />`)
   - Scanner-only → inside `<Route element={<ProtectedRoute roles={SCAN_ACCESS_ROLES} />}>`
3. If it needs sidebar navigation, add an entry to `src/data/DashboardNav.js` (`navItems` or `toolsItems`).
4. Update `docs/PAGES.md` (and `docs/HOOKS.md` if you added hooks).

## Adding a New Shared Component

1. Create it in `src/components/` (or a subfolder like `src/components/events/`, `src/components/dashboard/`).
2. If it accepts `className`, merge with `twMerge` (tailwind-merge) so callers can override.
3. Export it; reuse it; don't duplicate styles.
4. Consider adding it to `docs/DESIGN_SYSTEM.md`.

## Adding Data / Permissions

- Roles and role checks live in `src/data/roles.js` + `src/utils/roleAccess.js`. Update them **in sync with the backend**. Don't hard-code role strings elsewhere.
- Static content (committees, team, socials, event/form types) lives in `src/data/`. Update `docs/DATA.md` when you change shapes.

## Verification Checklist

- [ ] `npm run lint` passes (ESLint).
- [ ] `npm run build` succeeds.
- [ ] Dark mode looks right for the change.
- [ ] Error/loading/empty states handled (skeletons exist in `src/components/skeletons/`).
- [ ] Docs updated in the same change.

## Leaving the Team

Update the **Getting Help** block in `docs/INDEX.md` with your contact info so the next maintainer can be reached.
