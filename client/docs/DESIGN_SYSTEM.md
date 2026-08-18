# Frontend Design System

Colors, fonts, and shared components live in `src/index.css` and `src/components/`.

> Theming uses **Tailwind v4** (`@theme` in `index.css` — there is no `tailwind.config.js`). Use the utility classes directly: `bg-primary`, `text-foreground`, `border-border`.

## Colors

### Brand

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#0096FF` | main accent |
| `primary-dark` | `#0077CC` | hover, navbar bg |
| `primary-light` | `#33B5FF` | highlights |
| `pes-green` | `#6AA73E` | PES chapter |
| `pes-green-dark` | `#4C862B` | PES hover |
| `pes-yellow` | `#F2C94C` | PES chapter |

### Semantic Tokens

Defined as CSS variables in `index.css` and mapped to Tailwind colors via `@theme`. They swap per theme.

| Token | Utility class | Light | Dark |
|-------|--------------|-------|------|
| `navbar-background` | `bg-navbar-background` | `#0077CC` | `#1A1F2E` |
| `main` | `bg-main` | `#F2F2F2` | `#0A0E1A` |
| `foreground` | `text-foreground` | `#1E293B` | `#F1F5F9` |
| `muted` | `text-muted` | `#4B5563` | `#9CA3AF` |
| `border` | `border-border` | `#E4EAF1` | `#222936` |
| `card` | `bg-card` | `#F2F2F2` | `#1A1F2E` |
| `card-alt` | `bg-card-alt` | `#FFFFFF` | `#1A1F2E` |
| `input` | `bg-input` | `#F8FAFC` | `#111827` |

Usage in JSX: `bg-main`, `text-foreground`, `text-muted`, `bg-card`, `bg-navbar-background`, `border-border`.

### Utility Gradients (`index.css` `@layer utilities`)

- `bg-primary-linear` — horizontal blue gradient (`#0096FF → #33B5FF`)
- `bg-brand-linear` — diagonal blue gradient (`#0077CC → #0096FF`)
- `animate-marquee` — 40s linear marquee animation (used on home)

## Fonts

Loaded locally in `index.css` (`@font-face`) except Barlow (Google Fonts import).

| Family | Tailwind Class | Weights |
|--------|---------------|---------|
| TT Lakes Neue | `font-lakes` | 100, 300, 400, 500, 700, 900 |
| Gotham | `font-gotham` | 700 |
| Gotham Black | `font-black` | 900 |
| Gotham Thin | `font-gotham-thin` | 300 |
| Gotham Light | `font-gotham-light` | 500 |
| Barlow | `font-barlow` | 100–900 (Google) |

Body default is `font-lakes`. Headings commonly use `font-black` or `font-gotham`.

> Font files: `src/assets/fonts/tt_lakes/` (~97 files) and `src/assets/fonts/gotham/`. Only the weights listed are declared in `index.css`.

## Dark Mode

Toggle via `useDarkMode` hook (`src/hooks/useDarkMode.js`) + `ThemeToggle` component. The hook adds/removes the `.dark` class on `<html>`, and `index.css` declares:

```css
@custom-variant dark (&:where(.dark, .dark *));
:root { /* light tokens */ }
:root.dark { /* dark tokens */ }
```

All semantic tokens react automatically. You can also use Tailwind's `dark:` prefix (`dark:bg-gray-800`, `dark:text-white`) anywhere.

## Shared Components (`src/components/`)

### Button (`Button.jsx`)

| Variant | Style |
|---------|-------|
| `default` | filled primary (blue) |
| `outline` | translucent primary bg + border |
| `link` | text only, arrow icon |

```jsx
<Button variant="outline" className="...">Click</Button>
```

Uses `tailwind-merge` (`twMerge`) so `className` overrides work.

### SectionHeader (`SectionHeader.jsx`)

```jsx
<SectionHeader
  title="text before"
  highlight="highlighted word"
  highlightColor="primary" | "primary-light" | "primary-dark"
  variant="dark" | "light"   // text color
  line="gradient" | "white"  // underline style
/>
```

### Input (`Input.jsx`)

Labeled input supporting `text`, `textarea`, and `select` via the `type` prop. Optional `error` shows a red message.

```jsx
<Input label="Email" name="email" type="email" placeholder="you@uni.edu.eg" error={errors.email} />
```

### Modal (`Modal.jsx`) & ConfirmModal (`ConfirmModal.jsx`)

- `Modal`: `{ open, onClose, title, children, maxWidth }` — centered overlay with blur backdrop.
- `ConfirmModal`: wraps Modal for confirm/cancel flows. Props: `isOpen`, `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`, `variant` (`"default"` | `"danger"`), `isLoading`.

### Badge (`Badge.jsx`)

`{ text, className }` — rounded uppercase pill.

### Other components

| Component | Purpose |
|-----------|---------|
| `PublicNavbar` / `AdminSidebar` / `UserSidebar` | Navigation bars and sidebars |
| `Footer` / `FooterAlt` | Public footer variants |
| `ThemeToggle` | Sun/moon dark mode toggle |
| `ProfileBadge` / `ProfileHeader` | User profile UI pieces |
| `HtmlContent` | Renders sanitized HTML (DOMPurify) — used for event/editor content |
| `RichTextEditor` (`components/dashboard/`) | Tiptap-based rich text editor |
| `ContactForm` | Contact page form |
| `InputBox` | Unstyled/lighter input wrapper |
| `RequiredAsterisk` | Marks required labels |
| `Tooltip` | Hover tooltip |
| `SectionIntro` | Header wrapper for section titles — `text-center max-w-2xl mx-auto mb-12 flex flex-col items-center`. Used in about sections with `Badge` + `SectionHeader` |
| `DeleteModal` | Wraps `Modal` for delete confirmation flows |
| `LoadingPage` | Full-screen loading spinner (used as Suspense fallback in `App.jsx`) |
| `Pagination` (`components/ui/`) | Page navigation controls |
| `AdvancedSearch` | Member advanced search (dashboard) |
| `SpeakerManager` | Manage speakers list on event forms |
| `Notifications` | ⚠️ Present but commented out in `DashboardLayout` |
| `events/` | `EventCountdown`, `EventDetailModal`, `EventsListCard`, `HomeEventCard` |
| `forms/` | `FormCard`, `FormSubmissionSuccessModal` |
| `dashboard/` | `DeleteUserModal`, `EventEditModal`, `EventViewModal`, `FilterGroup`, `MemberFilters` |
| `skeletons/` | Loading skeletons: `DashNavSkeleton`, `DashHomeSkeleton`, `DashEventsSkeleton`, `DashFormsSkeleton`, `DashSettingsSkeleton`, `FlagshipSkeleton`, `ImageSkeleton` |

### SectionCard (`SectionCard.jsx`)

Generic card wrapper used across sections.

## Styling Conventions

- One Tailwind utility classes per element; keep the design tokens (semantic colors) instead of hard-coded hex.
- `twMerge` is available (`tailwind-merge`) for components that accept `className` overrides.
- Dark mode must always be considered — use semantic tokens or `dark:` variants.
