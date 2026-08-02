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
├── assets/          fonts, icons, images
├── components/      shared UI (Button, Navbar, Sidebar, etc.)
├── context/         React Context providers (AuthContext)
├── hooks/           custom hooks (useDarkMode)
├── layouts/         page wrappers (AuthLayout)
├── pages/           route-level components
├── sections/        page sections (home/About, home/Hero, etc.)
├── utils/           api.js (Axios instance)
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
| [`BUILD_DEPLOY.md`](./docs/BUILD_DEPLOY.md) | Env vars, Vite, Vercel deployment |
| [`CONTRIBUTING.md`](./docs/CONTRIBUTING.md) | Conventions and how to add pages/components |
