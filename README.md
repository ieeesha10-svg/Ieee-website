# IEEE El shrouk academy Student Branch Website

> The official full-stack web platform for the IEEE Student Branch at El shrouk academy.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-MERN-green.svg)
![Status](https://img.shields.io/badge/status-Active-success.svg)

## 📖 About
This repository contains the source code for our student branch website. It allows the board to manage events, register members, and showcase our gallery and blogs.

The project is built as a **Monorepo**, meaning both the Frontend (Client) and Backend (Server) are contained in this single repository for easier maintenance.

## 🛠 Tech Stack

**Frontend (Client):**
* **React** (Vite) - UI Library
* **Tailwind CSS** (Recommended) or **CSS Modules** - Styling
* **Axios** - API Integration
* **React Router** - Navigation

**Backend (Server):**
* **Node.js & Express** - Server Runtime
* **MongoDB & Mongoose** - Database
* **JWT** - Authentication
* **Multer** - Image Uploads (for events/members)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [Git](https://git-scm.com/)
* [MongoDB Compass](https://www.mongodb.com/products/tools/compass) (if running DB locally)

### 2. Installation

Clone the repository and install dependencies for **both** root, client, and server.

```bash
# Clone the repo
git clone [https://github.com/your-username/ieee-website.git](https://github.com/your-username/ieee-website.git)
cd ieee-website

# Install Root dependencies (for concurrently)
npm install

# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install

### 3. Environment
Create a `.env` file in the `server` folder with any required secrets. Example `.env`:

```
MONGO_URI=mongodb://localhost:27017/ieee
PORT=5000
JWT_SECRET=your_jwt_secret
```

Keep `.env` out of source control — a root `.gitignore` has been added to ignore `.env` files.

### 4. Run (development)
From the repository root you can run both client and server concurrently (root `dev` uses `concurrently`):

```bash
# from repo root
npm run dev
```

This runs the server (nodemon) and the Vite client. By default the client proxies `/api` to `http://localhost:5000` in development.

### 5. Run (individually)
```bash
# run server only (from /server)
npm run dev

# run client only (from /client)
npm run dev
```

### 6. Notes & Troubleshooting
- Ensure dependencies are installed in root, `server`, and `client`.
- If the client reports CORS issues in development, confirm `client/vite.config.js` contains a proxy for `/api` to `http://localhost:5000`.
- If the server doesn't start, check that `PORT` isn't already in use and that `.env` values are loaded.

---

If you'd like, I can keep updating this README live as you change scripts, add env variables, or modify setup steps — tell me how frequently you'd like updates.

## Team Documentation
We maintain onboarding and technical docs in the `docs/` folder. New team members should read `docs/ONBOARDING.md` first.

- `docs/ONBOARDING.md` — Quick start and first tasks
- `docs/ARCHITECTURE.md` — High-level architecture and folder layout
- `docs/API.md` — API documentation template
- `docs/CONTRIBUTING.md` — PR rules and checklist
- `docs/STYLEGUIDE.md` — Coding conventions
- `docs/DEPLOYMENT.md` — Deployment & env variables
