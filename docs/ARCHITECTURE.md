Architecture — Overview

This project is a MERN monorepo containing two primary workspaces:

- `client/` — Vite + React application (frontend)
- `server/` — Express API (backend) communicating with MongoDB via Mongoose

Key points
- Development: run `npm run dev` at the repo root to start client and server concurrently.
- The Vite dev server proxies `/api` to the server (see `client/vite.config.js`).
- The server loads environment variables from `server/.env` and exports the Express `app` for serverless deployments.

Folder layout

```
client/
  src/
  vite.config.js
server/
  controllers/
  models/
  routes/
  index.js
README.md
docs/
```

Recommended reading
- `docs/API.md` — API endpoint documentation
- `docs/DEPLOYMENT.md` — deploy and environment details
