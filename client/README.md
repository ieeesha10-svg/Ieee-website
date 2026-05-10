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

See `docs/FRONTEND_CONFIG.md` for detailed setup.
