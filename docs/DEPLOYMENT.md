Deployment

This document lists deployment guidance for the project.

Client
- The `client` app is a static build. You can deploy to Vercel, Netlify, or other static hosts.
- Build locally: from `client/` run `npm run build` to produce `dist/`.

Server
- The `server` is an Express app; it can be deployed as a Node server or as serverless functions (Vercel).
- Ensure environment variables are set in the deployment platform (`MONGO_URI`, `JWT_SECRET`, etc.).

Environment variables (example)
- `MONGO_URI` — MongoDB connection string
- `PORT` — server port (optional in many platforms)
- `JWT_SECRET` — JWT signing secret

Recommended flow
- Use Vercel for frontend (and optionally backend routes). If using a separate backend, set CORS and production envs accordingly.
