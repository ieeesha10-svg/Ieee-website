# IEEE El-Shorouk Academy — Client (10th Season)

Frontend for the IEEE El-Shorouk University Student Branch website.

## Tech Stack

React 19 + Vite 7 + Tailwind CSS v4 + React Router v7 + Axios

## Quick Start

```bash
cp .env.example .env         # configure API URL
npm install
npm run dev                  # http://localhost:5173
npm run build                # production → client/dist
npm run lint
```

## Folder Structure

```
src/
├── assets/          backgrounds, fonts, icons, images
├── components/
│   ├── dashboard/   admin modals, editors, filters
│   ├── guest/       contact, events, forms, home components
│   ├── layout/      navbar, footer, sidebars
│   ├── skeletons/   loading skeletons for every view
│   └── ui/          Badge, Button, Modal, SectionHeader, SectionIntro, etc.
├── context/         AuthContext (the only global context)
├── hooks/           auth, dashboard (events/forms), public hooks
├── layouts/         AuthLayout, DashboardLayout, UserLayout
├── pages/           route-level components (auth/, dashboard/, user-dashboard/)
├── sections/        page sections (about/, events/, home/)
├── utils/           api.js, date/event/file helpers, roleAccess.js
├── App.jsx          routing & layout logic
├── index.css        Tailwind + fonts + design tokens
└── main.jsx         entry point
```

## Key Config

| File | Purpose |
|------|---------|
| `vite.config.js` | Vite + Tailwind plugin |
| `.env.example` | env template |
| `src/utils/api.js` | Axios instance (reads `VITE_API_URL`) |
| `vercel.json` | root-level deploy config |

## Documentation

Full developer documentation lives in [`docs/`](./docs/). Start at **[`docs/INDEX.md`](./docs/INDEX.md)** — it includes the table of contents and how to contact the maintainer.

| Doc | Purpose |
|-----|---------|
| [`INDEX.md`](./docs/INDEX.md) | Entry point, TOC, maintainer contacts |
| [`PAGES.md`](./docs/PAGES.md) | All routes, guards, and page components |
| [`DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) | Colors, fonts, dark mode, shared components |
| [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | App flow: entry → layouts → routing → guards |
| [`STATE.md`](./docs/STATE.md) | Global state (AuthContext) |
| [`DATA.md`](./docs/DATA.md) | Static data & role permissions |
| [`HOOKS.md`](./docs/HOOKS.md) | All custom hooks and API endpoints |
| [`CONTRIBUTING.md`](./docs/CONTRIBUTING.md) | Setup, conventions, build/deploy, how to add pages/components |
