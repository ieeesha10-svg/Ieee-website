# Build & Deployment

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_URL` | yes (prod) | Base URL of the backend API, e.g. `https://ieee-sha-api.onrender.com/api`. Falls back to `http://localhost:5000/api` if empty |
> Vite only exposes variables prefixed with `VITE_` to the client via `import.meta.env`. Do not put secrets in `.env` — the frontend bundle is public.

## Commands (`client/package.json`)

| Command | What it does |
|---------|--------------|
| `npm run dev` | Vite dev server → `http://localhost:5173` |
| `npm run build` | Production build → `client/dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | ESLint over the project |

## Build Tooling

- **Vite 7** — `vite.config.js` is minimal; it only registers the Tailwind plugin:
  ```js
  plugins: [tailwindcss()]   // @tailwindcss/vite
  ```
- **Tailwind CSS v4** — configured via `@import "tailwindcss"` + `@theme` in `src/index.css`. There is **no** `tailwind.config.js`.
- **ESLint 9** — flat config in `eslint.config.js` (react-hooks + react-refresh plugins).

## Deployment (Vercel)

`vercel.json` at the client root is a simple SPA rewrite so deep links work:

```json
{ "rewrites": [ { "source": "/(.*)", "destination": "/" } ] }
```

Typical flow:

1. `npm run build`
2. Deploy `client/` (or point Vercel's build command at the client directory — set root directory to `client`, build command `npm run build`, output directory `dist`).
3. Set `VITE_API_URL` as a Vercel environment variable (must be present at **build time** since Vite inlines it into the bundle).

> The `.env.example` comment in `src/utils/api.js` shows a render.com URL as an alternative backend host. Confirm the current production API URL with the team before deploying.

## Tech Stack (versions)

React 19, React Router 7, Vite 7, Tailwind CSS 4, Axios, react-hot-toast, lucide-react, react-icons, recharts, xlsx, html5-qrcode, Tiptap (rich text editor), DOMPurify, MobX + @react-form-builder (form designer packages).
