Onboarding — Quick Start

Welcome to the project. This document helps new team members get productive quickly.

Purpose
- Describe the project goals, audience, and ownership.

Quick links
- Repo root: contains `client/` (Vite React) and `server/` (Express API).

Prerequisites
- Node.js (v16+), Git, MongoDB (or Atlas account)

Local setup
1. Clone the repo and install deps:

    git clone <repo-url>
    cd <repo>
    npm install
    cd server && npm install
    cd ../client && npm install

2. Create env file: `server/.env` (see `docs/DEPLOYMENT.md` for variables)

3. Run locally:

    # from repo root
    npm run dev

Where to look for work
- Frontend: `client/src/components`, `client/src/pages`
- Backend: `server/controllers`, `server/models`, `server/routes`

Communication & contacts
- Add team Slack/WhatsApp/Email details here.

First tasks for new contributors
- Run the app locally, fix a small bug, open a PR following `docs/CONTRIBUTING.md`.
