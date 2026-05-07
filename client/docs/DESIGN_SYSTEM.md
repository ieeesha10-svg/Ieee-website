# Frontend Design System

## Colors

### Brand

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#0096FF` | main accent |
| `primary-dark` | `#0077CC` | hover, navbar bg |
| `primary-light` | `#33B5FF` | highlights |
| `pes-green` | `#6AA73E` | PES chapter |
| `pes-yellow` | `#F2C94C` | PES chapter |

### Semantic Tokens

Set in `index.css` via CSS variables (swap per theme):

| Token | Light | Dark |
|-------|-------|------|
| `navbar-background` | `#0077CC` | `#1A1F2E` |
| `main` | `#F2F2F2` | `#0A0E1A` |
| `foreground` | `#1e293b` | `#f1f5f9` |
| `muted` | `#4b5563` | `#9ca3af` |
| `card` | `#F2F2F2` | `#1A1F2E` |

Usage in JSX: `bg-main`, `text-foreground`, `text-muted`, `bg-card`, `bg-navbar-background`

### Utility Gradients

- `bg-primary-linear` — horizontal blue gradient
- `bg-brand-linear` — diagonal blue gradient

## Fonts

| Family | Tailwind Class | Weights |
|--------|---------------|---------|
| TT Lakes Neue | `font-lakes` | 100, 300, 400, 500, 700, 900 |
| Gotham | `font-gotham` | 700 |
| Gotham Black | `font-black` | 900 |

Body default: `font-lakes`. Headings use `font-black` or `font-gotham`.

> Font files: `src/assets/fonts/tt_lakes/` (97 files) and `src/assets/fonts/gotham/`. Only the weights above are loaded in `index.css`.

## Dark Mode

Toggle via `useDarkMode` hook (`src/hooks/useDarkMode.js`).  
Adds/removes `.dark` class on `<html>`. All colors react via `:root.dark` CSS variables.

Usage: `dark:bg-gray-800`, `dark:text-white` etc. work globally.

## Components

### Button (`src/components/Button.jsx`)

| Variant | Style |
|---------|-------|
| `default` | white bg, blue text |
| `outline` | transparent, white border |
| `link` | text only, arrow icon |

```jsx
<Button variant="outline">Click</Button>
```

### SectionHeader (`src/components/SectionHeader.jsx`)

```jsx
<SectionHeader
  title="text before"
  highlight="highlighted word"
  highlightColor="primary-light" | "primary-dark"
  variant="dark" | "light"    // text color
  line="gradient" | "white"   // underline style
/>
```

### ChapterCard (`src/components/ChapterCard.jsx`)

Props: `title`, `icon`, `branch`, `body`, `activeMembers`, `bgColor`

### ThemeToggle

Sun/moon toggle using `useDarkMode`. Handles localStorage + `<html>` class.

### AuthLayout

Wrapper for login/signup/verify pages. Props: `icon`, `title`, `subtitle`, `maxWidth` (default `max-w-md`).
