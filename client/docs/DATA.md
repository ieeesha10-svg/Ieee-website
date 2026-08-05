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
export const FORM_TYPE_OPTIONS = [ "", "registration", "survey", "feedback", "custom" ];
```

Plus `FORM_TYPE_BADGE` (label + badge classes + dot color per type) and the type colors.

## Academic Years — `ordinalMap.js`

- `ORDINAL_OPTIONS` — `[{ label: "Graduate"|"1st Year"|..., value: 0..5 }]`
- `YEAR_MAP` — label → value
- `ORDINAL` — value → short ordinal ("1st", "2nd", ...)

Used with `utils/formatAcademicYear.js` (`formatAcademicYear(year)` → "3rd Year" / "Graduate" / "N/A").

## Avatar Colors — `avatarColors.js`

`pickColor(id)` — deterministic color from a string id (stable per user). `AVATAR_COLORS` = 12 Tailwind bg classes.

## Social Media — `socialMedia.js`

`SOCIAL_MEDIA` — Facebook/Instagram/LinkedIn/TikTok with icon, href, title, subtitle.
`EMAIL_ADDRESS` — `ieee.sha.10@gmail.com` (public contact).

## Team Pages — `chairpersons.js` & `devTeamData.js`

- `chairpersons.js` — `COUNSELOR` + `MEMBERS` (chair, vice chair, treasurer, secretary) with local images + socials.
- `devTeamData.js` — `stats` + `tracks` for the `/dev-team` page (head + UI/UX + frontend + backend teams) with local images + links.

> Note: these are **static imports** of local images in `src/assets/images/`. The `/crew` page is different — it fetches live crew from `GET /crew` via `useCrew`.
