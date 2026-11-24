# Static Data (`src/data/`)

These files power static content and permission logic. Keep them in sync with the backend's contract.

## Roles & Permissions — `roles.js`

The **single source of truth** for role definitions, mirroring
`server/constants/roles.js` and the enum in `server/models/UserModel.js`. The two
are separate deploys, so nothing enforces the match automatically — change all
three together.

```js
export const ALL_ROLES          = ["member", "scanner", "board", "xcom"];
export const DASHBOARD_ROLES    = ["scanner", "board", "xcom"];  // can open /dashboard
export const VIEW_ROLES         = ["board", "xcom"];              // can read dashboard data
export const WRITE_ROLES        = ["xcom"];                       // can change data
export const SCAN_ACCESS_ROLES  = ["scanner", "board", "xcom"];   // QR scan page
export const ROLE_LABELS        = { member: "Member", scanner: "Scanner",
                                     board: "Board", xcom: "Excom" };
export const READ_ONLY_NOTICE   = "You have read-only access. Contact an Excom member to make changes.";
```

| Role | Stored as | Access |
|------|-----------|--------|
| `member` | `member` | Default for every self-registration. Public site, own profile, own password, own submissions. **No dashboard at all.** |
| `scanner` | `scanner` | Event volunteer. Reaches `/dashboard/scan` and marks attendance. Sees no other dashboard data. |
| `board` | `board` | Board member. Reads the whole dashboard and changes nothing on it. Can also do whatever a scanner can. |
| `xcom` | `xcom` | Excom. Every dashboard write, plus creating users and changing other people's roles. Cannot change their own role. |

There is no `user` role. It was removed: self-registration always produces
`member`, and `server/scripts/migrate-role-user-to-member.js` converts the
accounts that still carried it. `xcom` is the stored value everywhere; the UI
labels it **Excom** via `ROLE_LABELS`.

**Board is read-only, not merely cautious.** Every write route on the server is
`authorize(...WRITE_ROLES)`, which is `xcom` alone, so a board member gets `403`
even with a hand-crafted request. The UI hides the controls too, but that is
courtesy — the server is the enforcement. Read-only pages show
`<ReadOnlyBanner />` so the missing buttons are explained rather than looking
broken.

Related helpers in `src/utils/roleAccess.js`:
- `canViewAdminPages(role)` — `VIEW_ROLES.includes(...)`: may open the dashboard at all
- `canWrite(role)` — `WRITE_ROLES.includes(...)`: may change anything
- `canViewDashboard(role)` — `DASHBOARD_ROLES.includes(...)`
- `canUseScanPage(role)` — `SCAN_ACCESS_ROLES.includes(...)`
- `roleLabel(role)` — the display name, so `xcom` reads as `Excom`
- `dashboardHref(role)` — `/dashboard` or `/dashboard/scan`
- `landingRoute(role)` — where login and email verification send you
- `isAdminRole(role)` — **means "can write"** (xcom only). It is a write check, not
  a dashboard-access check; prefer `canViewAdminPages` for navigation.

## Navigation — `DashboardNav.js`

`navItems` = sidebar links (Dashboard, Members, Events, Crew, Forms, Emails, Email Logs, Settings).
`toolsItems` = QR Attendance (badge "LIVE").

Each item has `to`, `label`, `icon` (lucide name), optional `title`/`sub`. `DashboardLayout` builds topbar metadata from these.

## Committees — `committeesData.js`

`committees` array of 9 chapters: Public Relations, Human Resources, Logistics, Marketing, Branding & Media, PES, Technical, Non-Technical, Website. Each has `id`, `icon`, `label`, `title`, `subtitle`, `points[]`, `recruitmentOpen` (all `false` right now).

## Event Types — `eventTypes.js`

```js
export const EVENT_TYPES = ["general", "event", "workshop", "webinar"];
export const EVENT_TYPE_LABELS = { general: "General", event: "Event", workshop: "Workshop", webinar: "Webinar" };
```

Used by the event create/edit forms and event cards.

## Form Field Types — `fieldTypes.js`

```js
export const ALLOWED_TYPES = ["TextInput", "TextArea", "Dropdown", "Checkbox", "FileUpload"];
export const FIELD_TYPE_OPTIONS = [ { value, label }, ... ];
```

Validated by `useCreateForm` and rendered by the form builder.

## Form Types — `formTypes.js`

```js
export const FORM_TYPE_OPTIONS = [
  { value: "", label: "Select a form type" },
  { value: "recruitment", label: "Recruitment" },
  { value: "feedback", label: "Feedback" },
  { value: "attendance", label: "Attendance or Event Registration" },
  { value: "workshop", label: "Workshop" },
  { value: "survey", label: "Survey" },
];
```

`value` is persisted as `form.type` and must match the enum in `server/models/FormModel.js`. `attendance` is the ticket-bearing type — the server mints the QR ticket code only for it, and every activity-linked form is created as `attendance`.

Plus `FORM_TYPE_BADGE` (label + badge classes + dot color per type), `DEFAULT_FORM_TYPE_BADGE` (the fallback for unknown types, an alias of the `other` entry), and color constants: `RECRUITMENT_COLOR`, `ATTENDANCE_COLOR`, `WORKSHOP_COLOR`, `SURVEY_COLOR`, `FEEDBACK_COLOR`, `LEGACY_COLOR`.

`other` exists in the badge map and the server enum for forms saved before this type set; it is not offered in the builder.

## Academic Years — `ordinalMap.js`

- `ORDINAL_OPTIONS` — `[{ label: "Graduate"|"1st Year"|..., value: 0..5 }]`
- `YEAR_MAP` — label → value
- `ORDINAL` — value → short ordinal ("1st", "2nd", ...)

Used with `utils/formatAcademicYear.js` (`formatAcademicYear(year)` → "3rd Year" / "Graduate" / "N/A").

## Avatar Colors — `avatarColors.js`

`pickColor(id)` — deterministic color from a string id (stable per user). `AVATAR_COLORS` = 12 Tailwind bg classes.

## Social Media — `socialMedia.js`

`SOCIAL_MEDIA` — Facebook/Instagram/LinkedIn/TikTok with `Icon` (React component), `href`, `title`, `subtitle`, `linkLabel`.
`EMAIL_ADDRESS` — `ieee.sha.10@gmail.com` (public contact).

## Team Pages — `devTeamData.js`

- `devTeamData.js` — `stats` + `tracks` for the `/dev-team` page (head + UI/UX + frontend + backend teams) with local images + links. Images are imported from `src/assets/images/dev-team/`.

> Note: `devTeamData.js` uses bundled image imports from `src/assets/images/`.
>
> There is no longer a `chairpersons.js`. The home page Excom, the About page's Executive Committee section, `/crew` and `/crew/season/:seasonId` are **all** driven by the database (`GET /seasons/home` and `GET /seasons/:id`). Committee portraits are hosted on Cloudinary and the database holds the absolute URL, so no portrait is committed to the repo and the same record serves Vite's dev server and a static production build. Edit committee members under `/dashboard/crew` — that writes the Excom and Board of a season and publishes one of them to the home page. `src/assets/images/chairpersons/` now holds only the LinkedIn, Facebook and Collabratec icons, which remain bundled imports.

## Sponsors — `sponsors.js`

`SPONSORS` array of 14 sponsor objects with `src` (local image import from `src/assets/images/sponsers/`) and `alt` (company name). Used by the `Sponsors` section on the home page.

## College Options — `collegeOptions.js`

```js
export const COLLEGE_OPTIONS = [
  "Engineering",
  "Computer Science",
  "Biomedical Engineering",
  "Communication & Computer Engineering",
  "Electrical Power & Machinery",
  "Architectural Engineering",
  "Civil Engineering",
  "BIS",
  "Management Information Systems (MIS)",
  "Mass Communication",
];
export const OTHER_COLLEGE = "__other__";
```

Used in signup and form pages for the college dropdown. `OTHER_COLLEGE` is a sentinel value for free-text input when the user's college isn't listed.
