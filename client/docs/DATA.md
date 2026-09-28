# Static Data (`src/data/`)

These files power static content and permission logic. Keep them in sync with the backend's contract.

## Roles & Permissions — `roles.js`

The **single source of truth** for role definitions.

```js
export const ALL_ROLES            = ["user", "member", "scanner", "board", "xcom"];
export const ADMIN_ROLES          = ["board", "xcom"];                       // dashboard access
export const SUPER_ADMIN_ROLES    = ["xcom"];                                // can create admins
export const SCAN_ACCESS_ROLES    = ["member", "scanner", "board", "xcom"];  // QR scan page
```

| Role | Access |
|------|--------|
| `user` | Default student — own profile, password, register/login |
| `member` | `user` + CRUD on members, scan page |
| `scanner` | `member` + event check-ins (scan page) |
| `board` | Dashboard, view/export users, manage members, limited delete. Cannot create admins |
| `xcom` | Everything `board` can + create admin users |

Related helpers in `src/utils/roleAccess.js`:
- `isAdminRole(role)` — `ADMIN_ROLES.includes(role?.toLowerCase())`
- `canUseScanPage(role)`
- `dashboardHref(role)` — `/dashboard` or `/dashboard/scan`

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

## Team Pages — `chairpersons.js` & `devTeamData.js`

- `chairpersons.js` — `COUNSELOR` + `MEMBERS` (chair, vice chair, treasurer, secretary) with socials. **The About page's Board section is the only remaining consumer**; the home page Excom now comes from the database.
- `devTeamData.js` — `stats` + `tracks` for the `/dev-team` page (head + UI/UX + frontend + backend teams) with local images + links.

> Note: `chairpersons.js` images are `/public/images/chairpersons/...` URLs, not bundled imports, so the same files serve both Vite's dev server and a static production build. `devTeamData.js` still imports from `src/assets/images/`.
>
> The home page Excom, `/crew` and `/crew/season/:seasonId` are **all** driven by the database (`GET /seasons/home` and `GET /seasons/:id`), not by a data file. `chairpersons.js` is left in place only so the About page renders the same people; it is no longer the source of truth for who the committee is. Edit committee members under `/dashboard/crew`, which writes the Excom and Board of a season and publishes one of them to the home page.

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
