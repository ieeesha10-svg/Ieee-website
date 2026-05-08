# Pages & Routes

Defined in `src/App.jsx`. Layout switches between public navbar and admin sidebar based on `/dashboard` path prefix.

## Public Routes

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/` | `Home` | ✅ | Composes Hero, About, Chapters sections |
| `/events` | `Events` | 🚧 placeholder | Empty |
| `/login` | `LoginPage` | ✅ | Email + password. Redirects based on role |
| `/signup` | `SignupPage` | ✅ | Name, email, phone, age, uni, college, year, password |
| `/verify` | `VerifyEmailPage` | ✅ | Email + OTP (6-digit) |

## Protected Routes (any logged-in user)

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/profile` | `ProfilePage` | 🚧 placeholder | Empty |

## Admin Routes (`admin` / `board` / `xcom` roles)

| Route | Component | Status | Notes |
|-------|-----------|--------|-------|
| `/dashboard` | `Dashboard` | 🚧 placeholder | Empty |
| `/dashboard/email` | `BulkMailer` | 🚧 placeholder | Empty |
| `/dashboard/users` | inline `div` | 🚧 | Placeholder text "User Management" |
| `/dashboard/forms` | inline `div` | 🚧 | Placeholder text "Forms Manager" |
| `/dashboard/scan` | inline `div` | 🚧 | Placeholder text "QR Scanner" |

## Auth Guard

`ProtectedRoute` in `App.jsx`:
- Checks `user` from `AuthContext`
- `requireAdmin={true}` restricts to `admin`, `board`, or `xcom` roles
- Unauthorized users are redirected to `/`

## Catch-all

Any unknown route → redirect to `/`.
