# Frontend Documentation Index

Documentation for the **client** (frontend) side of the IEEE El-Shorouk Academy Student Branch website.

Start here if you are new. Each document covers one topic and links back to the real source files.

## Getting Help

> This documentation was written for the developers taking over the frontend after the current team.
> If something is unclear, incomplete, or you find a bug you cannot solve on your own, **reach out directly**, I'm happy to walk you through anything.

**Abdallah Aziz** Frontend Engineer, current maintainer

- WhatsApp: (+20) 1010 434 465
- LinkedIn: https://www.linkedin.com/in/abdallah-m-aziz/

## Table of Contents

| Document | What it covers |
|----------|----------------|
| [PAGES.md](./PAGES.md) | All routes, guards, and page components — status included |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Colors, fonts, dark mode, shared components |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | App flow: entry point → layouts → routing → guards |
| [STATE.md](./STATE.md) | Global state (`AuthContext`) and how roles drive the UI |
| [DATA.md](./DATA.md) | Static data: roles/permissions, committees, form & event types, team |
| [HOOKS.md](./HOOKS.md) | Every custom hook and the API endpoints it calls |
| [BUILD_DEPLOY.md](./BUILD_DEPLOY.md) | Environment variables, Vite, and Vercel deployment |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Conventions and how to add pages/components safely |

## Quick Orientation

```
client/
├── index.html            HTML shell (fonts via Google, favicon, meta tags)
├── vite.config.js        Vite + Tailwind v4 plugin
├── vercel.json           SPA rewrites (all paths → /)
├── .env.example          VITE_API_URL template
├── src/
│   ├── main.jsx          Entry point — mounts <AuthProvider><App /></AuthProvider>
│   ├── App.jsx           All routing, layouts, and route guards
│   ├── index.css         Tailwind + fonts + design tokens (light/dark)
│   ├── assets/           Fonts (TT Lakes, Gotham), images, icons
│   ├── components/       Shared + feature UI components
│   ├── context/          AuthContext (the only global context)
│   ├── data/             Static data & role permission maps
│   ├── hooks/            Data-fetching and UI hooks (one per feature area)
│   ├── layouts/          Public / Dashboard / User page shells
│   ├── pages/            Route-level components
│   ├── sections/         Page sections (home, about, events)
│   └── utils/            api.js (Axios), date/event/file helpers
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full flow.

## Status Legend

Used throughout the docs:

- ✅ Done / stable
- 🚧 In progress / partial
- ⚠️ Known issue or fragile code

## How to Keep This Documentation Alive

- Update a doc **in the same PR/commit** that changes the code it describes.
- If you add a route, page, or hook, update the matching table here.
- When you leave the team, update the **Getting Help** section above so the next maintainer can be reached.
