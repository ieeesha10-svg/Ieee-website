# IEEE SHA – SB | Backend Documentation

> **IEEE SHA Student Branch Website — REST API & System Documentation**

Welcome to the official documentation of the **IEEE SHA – SB** backend system. This document is divided into three main parts:

| Part | Section | Description |
|------|---------|-------------|
| **1** | [README — Project Setup](#part-1--readme-project-setup) | Overview, tech stack, environment variables, installation |
| **2** | [System Architecture](#part-2--system-architecture) | Workflow, authentication model, database design, integrations |
| **3** | [API Documentation](#part-3--api-documentation) | Full reference for every endpoint (requests, responses, errors) |

---

# Part 1 — README (Project Setup)

## 1.1 Project Overview

**IEEE SHA – SB** is the backend service powering the official website of the **IEEE SHA Student Branch**. It manages the full lifecycle of the branch's digital operations: public member registration with email OTP verification, event/activity management with dynamic registration forms, QR-ticketed attendance scanning, committee join-request workflows, a crew directory, bulk email campaigns, and an administrative analytics dashboard.

The system is built around five user roles (`user`, `member`, `scanner`, `board`, `xcom`), where privileged roles administer events, review submissions, approve committee requests, and communicate with the community through integrated email services.

## 1.2 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Runtime | **Node.js** | JavaScript server runtime |
| Framework | **Express v5** | REST API routing & middleware |
| Database | **MongoDB** + **Mongoose v9** | Data persistence & ODM |
| Authentication | **jsonwebtoken (JWT)** | Stateless auth via **httpOnly cookies** |
| Security | **bcryptjs**, **helmet**, **cors**, **sanitize-html** | Password hashing, secure headers, CORS whitelist, HTML sanitization |
| File Storage | **Cloudinary** + **Multer** (memory storage) | Cover images & submission file uploads (10 MB limit) |
| Email | **Brevo** (`@getbrevo/brevo`) | Transactional + bulk email delivery *(Resend integration exists but is disabled)* |
| Documents | **ExcelJS**, **xlsx** | Excel import/export (users, submissions, bulk recipients) |
| Ticketing | **qrcode**, **nanoid** | Unique ticket codes + QR image generation |
| Utilities | **dotenv**, **cookie-parser**, **validator**, **html-to-text** | Config, cookies, input validation, text extraction |
| Dev Tooling | **nodemon** | Hot-reload during development |

## 1.3 Project Structure

```
server/
├── index.js                  # App entry point (Express bootstrap, Vercel-ready export)
├── seeder.js                 # Database seeding script
├── package.json
├── .env                      # Environment variables (never commit!)
├── config/
│   ├── db.js                 # MongoDB connection (Mongoose)
│   └── cloudinary.js         # Cloudinary SDK configuration
├── controllers/              # Business logic per domain
│   ├── userController.js     # Auth, registration, profiles, member management, exports
│   ├── activityController.js # Activities CRUD + featured activities
│   ├── formController.js     # Dynamic form builder CRUD
│   ├── submissionController.js # Form submissions, QR scan, Excel export
│   ├── committeeRequestController.js # Committee join workflow
│   ├── crewController.js     # Crew directory CRUD
│   ├── emailController.js    # Bulk email campaigns + logs
│   └── statsController.js    # Dashboard analytics aggregation
├── models/                   # Mongoose schemas
│   ├── UserModel.js          # Users (roles, OTP, reset tokens)
│   ├── ActivityModel.js      # Events/activities
│   ├── FormModel.js          # Dynamic forms + field validation
│   ├── SubmissionModel.js    # Submissions + tickets + attendance
│   ├── PendingRequest.js     # Committee join requests
│   ├── FeaturedActivitiesModel.js # Homepage featured list
│   ├── crewModel.js          # Team members shown on site
│   └── EmailLog.js           # Bulk email delivery log
├── routes/                   # Express routers per domain
├── middleware/
│   ├── authMiddleware.js     # protect (JWT cookie) + authorize (RBAC)
│   ├── uploadMiddleware.js   # Multer memory-storage config
│   └── errorsMiddleware.js   # AppError, catchAsync, globalErrorHandler
├── utils/
│   ├── routesHandler.js      # Central route mounting
│   ├── sendEmail.js          # Brevo email client + templates
│   ├── emailTemplates.js     # Shared email footer/templates
│   ├── uploadToCloudinary.js # Streamed Cloudinary uploads
│   └── collegeNormalize.js   # College name normalization for stats
└── view/
    └── emails_Templates/     # HTML email templates
```

## 1.4 Environment Variables

Create a `.env` file in the `server/` root. Copy the variable names below and provide your own values:

```env
# ---------- Server ----------
PORT=5000
NODE_ENV=development            # "development" enables relaxed CORS/cookies
MONGO_URI=mongodb://127.0.0.1:27017/ieeesha
JWT_SECRET=your_super_secret_key

# ---------- CORS ----------
CORS_ORIGINS=http://localhost:5173,https://www.ieeesha.org
CORS_ORIGIN=                    # fallback if CORS_ORIGINS is unset
CLIENT_URL=http://localhost:5173

# ---------- Email ----------
BREVO_API_KEY=xkeysib-...       # Brevo transactional email API key
EMAIL_USER=                     # legacy/optional SMTP credentials
EMAIL_PASS=
RESEND_API_KEY=                 # optional (Resend provider currently disabled)

# ---------- Media ----------
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your_api_secret
```

| Variable | Required | Description |
|----------|:--------:|-------------|
| `PORT` | No | Server port. Defaults to `5000`. |
| `NODE_ENV` | Yes | `development` → lax cookies + localhost CORS; anything else → production behavior (secure cross-domain cookies on `.ieeesha.org`). |
| `MONGO_URI` | Yes | MongoDB connection string. Process exits if connection fails. |
| `JWT_SECRET` | Yes | Secret used to sign auth tokens (30-day expiry) and reset-password tokens (1-hour expiry). |
| `CORS_ORIGINS` / `CORS_ORIGIN` | Yes | Comma-separated whitelist of allowed origins. Requests without an origin are allowed. |
| `CLIENT_URL` | Yes | Frontend base URL (used when constructing links). |
| `BREVO_API_KEY` | Yes* | Required for OTP, ticket, reset-password, decision & bulk emails. Sender: `noreply@ieeesha.org`. |
| `CLOUDINARY_CLOUD_NAME` | Yes* | Cloudinary account identifier. |
| `CLOUDINARY_API_KEY` | Yes* | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes* | Cloudinary API secret. |
| `EMAIL_USER` / `EMAIL_PASS` | No | Legacy SMTP credentials (current pipeline uses Brevo). |
| `RESEND_API_KEY` | No | Alternative email provider key (integration disabled). |

\* *Required for features that use them (uploads / emails).*

## 1.5 Installation & Setup

### Prerequisites
- **Node.js ≥ 18** (native `fetch` is used in the file-download proxy)
- **MongoDB** (local instance or Atlas cluster)
- A **Cloudinary** account (for media uploads)
- A **Brevo** account with a verified sender (`noreply@ieeesha.org`)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
#    Create a .env file as described in section 1.4

# 3. Start the development server (nodemon hot-reload)
npm run dev

# 4. Verify the server is running
curl http://localhost:5000/
# => { "message": "Welcome to the API" }
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start development server with `nodemon` (auto-restart on change). |

### Deployment Notes

- `index.js` exports the Express app (`module.exports = app`) making it **Vercel serverless-compatible**. Locally, it listens on `PORT` only when run directly (`require.main === module`).
- In production, auth cookies are issued with `secure: true`, `sameSite: 'none'`, and `domain: '.ieeesha.org'` to support cross-subdomain requests — HTTPS is mandatory.
- On first DB connection, `Form.syncIndexes()` runs automatically to apply unique indexes.
- Static files are served from `/uploads` (legacy local storage); new uploads stream directly to **Cloudinary**.

---

# Part 2 — System Architecture

## 2.1 High-Level Architecture

```
                        ┌─────────────────────────────────────────────┐
                        │                CLIENTS                       │
                        │   React SPA (member portal, admin panel,     │
                        │   scanner app)                               │
                        └──────────────────┬──────────────────────────┘
                                           │ HTTPS (credentials included)
                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS APPLICATION (Node.js)                    │
│                                                                          │
│  Global Middleware                                                       │
│  ├── helmet()            → security headers                              │
│  ├── cors()              → origin whitelist + credentials                │
│  ├── express.json()      → JSON body parsing                             │
│  ├── cookieParser()      → parses signed 'jwt' auth cookie               │
│  └── /uploads static                                                     │
│                                                                          │
│  Route Layer (utils/routesHandler.js)                                    │
│  ├── /api/users              → userRoutes                                │
│  ├── /api/states             → statsController                           │
│  ├── /api/crew               → crewRoutes                                │
│  ├── /api/activities         → activityRoutes                            │
│  ├── /api/form               → formRoutes                                │
│  ├── /api/submissions        → submissionRoutes                          │
│  ├── /api/committee-requests → committeeRequestRoutes                    │
│  ├── /api/emails             → emailRouts                                │
│  ├── 404 catch-all (app.all)                                             │
│  └── globalErrorHandler                                                  │
│                                                                          │
│  Controller Layer → Business logic (catchAsync-wrapped async handlers)   │
│  Model Layer      → Mongoose schemas, hooks & validation                 │
└───────────┬─────────────────────┬───────────────────────┬───────────────┘
            │                     │                       │
            ▼                     ▼                       ▼
   ┌─────────────────┐   ┌─────────────────┐    ┌─────────────────────┐
   │     MongoDB     │   │   Cloudinary    │    │       Brevo         │
   │  (Atlas/local)  │   │  Image/file CDN │    │  Transactional &    │
   │  8 collections  │   │                 │    │  bulk email API     │
   └─────────────────┘   └─────────────────┘    └─────────────────────┘
```

## 2.2 Core Workflow

1. **Registration** — A visitor registers as a `student` or `professional`. Passwords are hashed with bcrypt (salt rounds = 10). Public requests are role-sanitized: anyone requesting `member` gets it; everything else is forced to `user` (privilege escalation prevention). If a `committee` preference was chosen, a `PendingRequest` is created automatically.
2. **Email Verification (OTP)** — A random 6-digit OTP (valid 15 minutes) is emailed via Brevo. `POST /verify-email` validates it, flags the account `isVerified`, clears the OTP, and **auto-login** the user by setting the JWT cookie.
3. **Authentication** — Login verifies credentials and issues a JWT (30 days) stored in an **httpOnly cookie named `jwt`**. All subsequent requests authenticate via this cookie (`protect` middleware). Logout expires the cookie.
4. **Events & Forms** — Admins (`xcom`/`board`) create an **Activity**; the API atomically creates a linked dynamic **Form** (custom fields: TextInput, TextArea, Dropdown, Checkbox, FileUpload). Form answers are validated against field definitions inside a Mongoose `pre('save')` hook.
5. **Submission & Ticketing** — Logged-in users submit forms once (unique compound index `formId + userId`). Registration-type forms mint a unique **ticket code** (`<formId>-<userId>-<nanoid6>`), render a **QR code**, and email it to the attendee. FileUpload answers are streamed to Cloudinary under `submissions/<formId>/`.
6. **Check-in (Scanning)** — Volunteers (`scanner`) scan QR codes via `POST /submissions/scan`; the submission flips to `attended`, timestamps the check-in, and greets the registrant. Double-scans are rejected.
7. **Committee Management** — Members request committee positions; `xcom`/`board` approve/reject. Approval assigns `user.committee` and triggers a decision email. XCom/board requests are auto-approved.
8. **Communication** — Bulk emails are sent either from an uploaded Excel sheet (column A = recipient, other columns become `{{placeholders}}`) or from selected DB users. Every attempt is recorded in the `emaillogs` collection with a status of `Done`, `Rejected`, or `Not email`.
9. **Analytics** — `GET /api/states/dashboard` aggregates MongoDB pipelines into KPIs: totals, college/year/position splits, top-5 most active members, latest signups, and registrations per activity.

## 2.3 Authentication & Authorization Model

### Token Flow

```
Register ──► OTP Email ──► Verify (auto-login) ──► jwt cookie set
Login ────────────────────────────────────────────► jwt cookie set
        ┌──────────────────────────────────────────┐
        │  Cookie: jwt=<HS256 JWT>, httpOnly,      │
        │  30-day expiry, Secure+SameSite=None in  │
        │  production (domain .ieeesha.org)        │
        └──────────────────────────────────────────┘
Every request → protect middleware → jwt.verify → req.user loaded
```

### Middleware

| Middleware | Behavior |
|------------|----------|
| `protect` | Reads `req.cookies.jwt`. Missing → `401 Not authorized, no token`. Invalid/expired → `401 Not authorized, token failed`. Valid → loads user onto `req.user`. |
| `authorize(...roles)` | Compares `req.user.role` against allowed roles. Failure → `403 User role <role> is not authorized to access this route`. |

### Role-Based Access Control (RBAC) Matrix

| Capability | `user` | `member` | `scanner` | `board` | `xcom` |
|---|:-:|:-:|:-:|:-:|:-:|
| Register / verify / login / logout | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit forms, view own profile/submission | ✅ | ✅ | ✅ | ✅ | ✅ |
| Scan tickets | ❌ | ✅ | ✅ | ✅ | ✅ |
| View members list / create / edit role | ❌ | ✅ | ✅ | ✅ | ✅ |
| Request committee position | ✅ | ✅ | ✅ | ✅ | ✅ (auto-accepted) |
| Manage activities, forms, crew | ❌ | ❌ | ❌ | ✅ | ✅ |
| View/export submissions & users | ❌ | ❌ | ❌ | ✅ | ✅ |
| Send bulk email / read email logs | ❌ | ❌ | ❌ | ✅ | ✅ |
| Create internal accounts (`create-internal`) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete any member | ❌ | ❌ | ❌ | ❌ | ✅ (others may delete **self**) |

## 2.4 Database Design (MongoDB Collections)

### `users`
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | required, trimmed |
| `email` | String | required, **unique**, lowercase, regex-validated |
| `password` | String | required, **select: false**, min 8 chars, bcrypt hash |
| `phone`, `age` | String / Number | age 15–99 |
| `position` | String | enum: `student`, `professional` |
| `role` | String | enum: `user` (default), `member`, `board`, `xcom`, `scanner` |
| `university`, `college`, `yearOfStudy` | String/String/Number | student-specific |
| `interests` | [String] | e.g. `["AI", "Robotics"]` |
| `organization`, `roleInOrganization`, `yearsOfExperience`, `reasonForRegistration` | — | professional-specific |
| `committee` | String | e.g. `HR`, `Technical`, `PR` |
| `isVerified` | Boolean | default `false` |
| `otp`, `otpExpires` | String / Date | **select: false**, 15-min validity |
| `resetPasswordToken`, `resetPasswordExpires` | String / Date | **select: false**, 1-hour validity |
| `optionalData` | Object | free-form extension bucket |
| `timestamps` | — | `createdAt`, `updatedAt` |

### `activities`
| Field | Type | Notes |
|-------|------|-------|
| `title` | String | required, trimmed |
| `content` | String | required, rich HTML (**sanitized** with allow-list) |
| `description` | String | default `""` |
| `type` | String | enum: `general`, `event`, `workshop`, `webinar` |
| `speakers` | [{name, title, image, bio}] | embedded array |
| `location` | String | required |
| `startDate`, `endDate` | Date | required |
| `registrationEnabled` | Boolean | default `true` |
| `coverImage`, `coverImagePublicId` | String | Cloudinary URL + deletion handle |

### `forms`
| Field | Type | Notes |
|-------|------|-------|
| `activityID` | ObjectId → Activity | optional link |
| `createdBy` | ObjectId → User | required |
| `title`, `description`, `type` | String | `type` drives ticket generation (`registration` ⇒ ticket) |
| `fields` | [fieldSchema] | dynamic builder fields |
| `status` | String | enum: `Active`, `Closed`, `Draft`, `upcoming` |
| `startDate`, `endDate` | Date | required |
| `maxSubmissions` | Number | defaults to unlimited (`MAX_SAFE_INTEGER`) |
| `requiresLogin` | Boolean | default `false` |
| `timestamps` | — | |

**fieldSchema:** `{ id, label, type: TextInput|TextArea|Dropdown|Checkbox|FileUpload, required: Boolean, options: [String] }` — `options` mandatory (≥1) for Dropdown/Checkbox. A `pre('save')` hook slugifies labels into machine-friendly ids (e.g. `"Full Name"` → `full_name`).

### `submissions`
| Field | Type | Notes |
|-------|------|-------|
| `formId` | ObjectId → Form | required |
| `userId` | ObjectId → User | required |
| `registrantEmail` | String | indexed denormalized copy for fast filtering |
| `answers` | Object | `{ field_id: value }`, validated against form fields on save |
| `status` | String | enum: `pending`, `approved`, `rejected`, `attended`, `not attended` |
| `ticketCode` | String | **unique, sparse** — `<formId>-<userId>-<nanoid6>` |
| `qrImage` | String | QR code as Data URL |
| `attended` | Boolean | default `false` |
| `attendedAt` | Date | set during scan |
| `timestamps` | — | |

**Indexes:** compound **unique** `{ formId: 1, userId: 1 }` → hard guarantee against duplicate submissions.

### `pendingrequests` (Committee Requests)
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId → User | required |
| `committee_position` | String | requested position |
| `request_status` | String | enum: `pending`, `approved`, `rejected` |

### `crews`
`{ name*, position*, image, bio }` — team members displayed on the public site.

### `featuredactivities`
Single document `{ activities: [ObjectId → Activity] }` — homepage carousel, capped at **2** items.

### `emaillogs`
| Field | Type | Notes |
|-------|------|-------|
| `sendBy` | ObjectId → User | required |
| `email` | String | required (recipient) |
| `status` | String | enum: `Done`, `Rejected`, `Not email` |
| `subject` | String | default `"Notification"` |
| `messageBody` | String | required |
| `sentAt` | Date | default now |

## 2.5 Cross-Cutting Concerns

### Error Handling Convention
All controllers wrap logic in `catchAsync`, forwarding rejections to `globalErrorHandler`:

```json
// Operational errors thrown via new AppError(message, statusCode)
{
  "status": "fail",        // "fail" for 4xx, "error" for 5xx
  "message": "Form not found"
}
```

Unmatched routes hit a dedicated catch-all returning **404** `{ "message": "This router is not exist" }`.

### File Upload Pipeline
```
Client (multipart/form-data)
   → Multer (memoryStorage, ≤ 10 MB/file)
      → Buffer streamed to Cloudinary
         • Activity covers → folder "activities"
         • Submission files → folder "submissions/<formId>"
      → resulting secure_url stored in Mongo
```

### Security Measures
- **helmet** security headers on every response.
- Strict **CORS whitelist** with `credentials: true`.
- **httpOnly** cookies (tokens unreachable from JS).
- **Role sanitization** on public registration.
- **Restricted-field blocklist** on profile update (email/password/role/OTP cannot self-modify).
- **HTML sanitization** (`sanitize-html` allow-list) for activity rich-text content.
- Passwords never returned by queries (schema-level `select: false`).

---

# Part 3 — API Documentation

## 3.0 Conventions

- **Base URL**
  - Development: `http://localhost:5000/api`
  - Production: `https://www.ieeesha.org/api`
- **Authentication** — via the **httpOnly `jwt` cookie** (set by login/verification). Clients must send `credentials: "include"` (or `withCredentials: true` in axios). Bearer headers are **not** used.
- **Content Types** — `application/json` for standard payloads; `multipart/form-data` where file uploads occur.
- **Standard Error Envelope**

```json
{ "status": "fail", "message": "<descriptive message>" }
```

| Code | Meaning in this API |
|------|---------------------|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created |
| `400 Bad Request` | Validation failure / business rule violated |
| `401 Unauthorized` | Missing or invalid auth cookie |
| `403 Forbidden` | Role not permitted / restricted action |
| `404 Not Found` | Resource or route doesn't exist |
| `500 Internal Server Error` | Unhandled server failure |

---

## Module Index

| Module | Prefix | Endpoints |
|--------|--------|-----------|
| [Health](#31-health-check) | `/` | 1 |
| [Auth & Users](#32-authentication--users) | `/api/users` | 19 |
| [Dashboard Stats](#33-dashboard-stats) | `/api/states` | 1 |
| [Activities](#34-activities) | `/api/activities` | 9 |
| [Forms](#35-forms) | `/api/form` | 6 |
| [Submissions](#36-submissions--ticketing) | `/api/submissions` | 7 |
| [Committee Requests](#37-committee-requests) | `/api/committee-requests` | 5 |
| [Crew](#38-crew-directory) | `/api/crew` | 4 |
| [Bulk Emails](#39-bulk-emails) | `/api/emails` | 3 |

---

## 3.1 Health Check

### `GET /`

Verifies the API is alive.

- **Auth:** No

**Success Response — `200 OK`**

```json
{ "message": "Welcome to the API" }
```

---

## 3.2 Authentication & Users

### 3.2.1 Register User

`POST /api/users/register`

Creates an unverified account and emails a 6-digit OTP (valid 15 minutes). Public sign-ups may only hold the `user` or `member` role — any other requested role is silently downgraded to `user`. Optionally queues a committee join request.

- **Auth:** No
- **Body:** `application/json`

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `name` | string | ✅ | |
| `email` | string | ✅ | Must be unique & valid |
| `password` | string | ✅ | Min 8 characters |
| `confirmPassword` | string | ✅ | Must equal `password` |
| `phone` | string | ➖ | |
| `age` | number | ➖ | 15–99 |
| `position` | string | ✅ | `"student"` \| `"professional"` |
| `university` | string | ⭕ | required if student |
| `college` | string | ⭕ | required if student |
| `yearOfStudy` | number | ⭕ | required if student |
| `interests` | [string] | ➖ | students |
| `organization` | string | 🔵 | required if professional |
| `roleInOrganization` | string | 🔵 | required if professional |
| `yearsOfExperience` | number | 🔵 | required if professional |
| `reasonForRegistration` | string | ➖ | professionals |
| `role` | string | ➖ | `"member"` honored; anything else → `user` |
| `committee` | string | ➖ | creates a `PendingRequest` if present |

⭕ = conditionally required (students) 🔵 = conditionally required (professionals)

**Request Example**

```json
{
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "password": "Str0ngPass!",
  "confirmPassword": "Str0ngPass!",
  "phone": "+201001234567",
  "age": 21,
  "position": "student",
  "university": "Helwan University",
  "college": "Computer Engineering",
  "yearOfStudy": 3,
  "interests": ["AI", "Web Development"]
}
```

**Success Response — `201 Created`**

```json
{
  "message": "Registration successful. Please check your email for the OTP.",
  "email": "ahmed@example.com"
}
```

**Error Responses**

```json
// 400 — validation failures (examples)
{ "error": "Passwords do not match" }
{ "error": "Position must be either \"student\" or \"professional\"" }
{ "error": "Students must provide university, college, and year of study" }
{ "error": "User already exists" }

// 500 — OTP email delivery failure
{ "error": "User registered, but failed to send OTP email." }
```

---

### 3.2.2 Verify Email (OTP)

`POST /api/users/verify-email`

Validates the emailed OTP, activates the account, clears the OTP, and **auto-logs the user in** by setting the `jwt` cookie.

- **Auth:** No
- **Body:** `application/json`

| Field | Type | Required |
|-------|------|:--------:|
| `email` | string | ✅ |
| `otp` | string | ✅ |

**Request Example**

```json
{ "email": "ahmed@example.com", "otp": "482913" }
```

**Success Response — `200 OK`** *(also sets `Set-Cookie: jwt=...`)*

```json
{
  "message": "Email verified successfully!",
  "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "role": "user",
  "committee": "no committee",
  "position": "student"
}
```

**Error Responses**

```json
// 400
{ "error": "Please provide email and OTP" }
{ "message": "Account is already verified" }
{ "error": "Invalid OTP" }
{ "error": "OTP has expired. Please request a new one." }

// 404
{ "error": "User not found" }
```

---

### 3.2.3 Login

`POST /api/users/login`

Authenticates credentials and sets the 30-day `jwt` httpOnly cookie.

- **Auth:** No
- **Body:** `application/json`

| Field | Type | Required |
|-------|------|:--------:|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Request Example**

```json
{ "email": "ahmed@example.com", "password": "Str0ngPass!" }
```

**Success Response — `200 OK`** *(also sets `Set-Cookie: jwt=<token>; HttpOnly`)*

```json
{
  "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "role": "user",
  "committee": "no committee",
  "position": "student"
}
```

**Error Responses**

```json
// 401
{ "message": "Invalid email or password" }

// 403 — account exists but OTP never verified
{ "message": "Account not verified. Please check your email for the OTP." }
```

---

### 3.2.4 Logout

`POST /api/users/logout`

Clears the `jwt` cookie.

- **Auth:** No

**Success Response — `200 OK`**

```json
{ "message": "Logged out" }
```

---

### 3.2.5 Forgot Password

`POST /api/users/forgot-password`

Emails a password-reset link containing a signed token (valid 1 hour).

- **Auth:** No
- **Body:** `application/json`

| Field | Type | Required |
|-------|------|:--------:|
| `email` | string | ✅ |

**Request Example**

```json
{ "email": "ahmed@example.com" }
```

**Success Response — `200 OK`**

```json
{ "success": true, "message": "Reset password email sent successfully" }
```

**Error Responses**

```json
// 400 — { "message": "Please provide your email address" }
// 404 — { "message": "User not found" }
// 500 — { "message": "Failed to send reset password email" }
```

---

### 3.2.6 Reset Password

`POST /api/users/reset-password?token=<resetToken>`

Consumes the emailed reset token and replaces the password.

- **Auth:** No
- **Query Params**

| Param | Type | Required |
|-------|------|:--------:|
| `token` | string | ✅ | 

- **Body:** `application/json`

| Field | Type | Required |
|-------|------|:--------:|
| `email` | string | ✅ |
| `newPassword` | string | ✅ |
| `confirmNewPassword` | string | ✅ |

**Request Example**

```json
{ "email": "ahmed@example.com", "newPassword": "N3wSecret!", "confirmNewPassword": "N3wSecret!" }
```

**Success Response — `200 OK`**

```json
{ "success": true, "message": "Password reset successfully" }
```

**Error Responses**

```json
// 400
{ "message": "Please provide all required fields" }
{ "message": "New password and confirm new password do not match" }
{ "message": "Invalid or expired reset token" }

// 404
{ "message": "User not found" }
```

---

### 3.2.7 Update Password (Logged-in)

`PUT /api/users/update-password/:id`

- **Auth:** Yes (`protect`)
- **Path Params:** `id` — user ID
- **Body:** `application/json`

| Field | Type | Required |
|-------|------|:--------:|
| `currentPassword` | string | ✅ |
| `newPassword` | string | ✅ |
| `confirmNewPassword` | string | ✅ |

**Request Example**

```json
{ "currentPassword": "Str0ngPass!", "newPassword": "Br4ndNew!", "confirmNewPassword": "Br4ndNew!" }
```

**Success Response — `200 OK`**

```json
{ "success": true, "message": "Password updated successfully" }
```

**Error Responses**

```json
// 400 — missing fields / mismatch / incorrect current password:
{ "message": "Current password is incorrect" }
// 404 — { "message": "User not found" }
```

---

### 3.2.8 Get My Profile

`GET /api/users/profile`

Returns the authenticated user plus their event history (split into attended/not attended).

- **Auth:** Yes (`protect`)

**Success Response — `200 OK`**

```json
{
  "success": true,
  "user": {
    "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "role": "user",
    "committee": "no committee",
    "phone": "+201001234567",
    "age": 21,
    "position": "student",
    "university": "Helwan University",
    "college": "Computer Engineering",
    "yearOfStudy": 3,
    "organization": null,
    "roleInOrganization": null,
    "yearsOfExperience": null,
    "reasonForRegistration": null,
    "interests": ["AI", "Web Development"],
    "optionalData": {},
    "createdAt": "2026-08-01T10:15:00.000Z",
    "submissions": {
      "attended": [],
      "notAttended": []
    }
  }
}
```

**Error Responses** — `404 { "message": "User not found" }`

---

### 3.2.9 Update My Profile

`PUT /api/users/profile/:id`

Self-service profile update. Only the owner may update their profile; sensitive fields are blocked.

- **Auth:** Yes (`protect`) — must match own ID
- **Allowed Fields:** `name`, `phone`, `age`, `university`, `college`, `yearOfStudy`, `organization`, `roleInOrganization`, `yearsOfExperience`, `reasonForRegistration`, `interests`, `committee`, `optionalData`
- **Blocked Fields (→ 403):** `email`, `password`, `role`, `position`, `isVerified`, `otp`, `otpExpires`, `resetPasswordToken`, `resetPasswordExpires`

**Request Example**

```json
{ "phone": "+201098765432", "interests": ["Robotics"] }
```

**Success Response — `200 OK`**

```json
{
  "success": true,
  "user": {
    "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "role": "user",
    "phone": "+201098765432",
    "interests": ["Robotics"]
  }
}
```

**Error Responses**

```json
// 403
{ "message": "HACKER : You can only update your own profile" }
{ "message": "You are not allowed to update restricted fields" }
// 404 — { "message": "User not found" }
```

---

### 3.2.10 Get Member Events

`GET /api/users/:id/events`

Returns all form submissions belonging to a member, with their linked form and activity populated.

- **Auth:** Yes (`protect`)
- **Path Params:** `id` — user ID

**Success Response — `200 OK`**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "67a0...",
      "formId": { "title": "IEEE Day 2026", "type": "registration", "activityID": { "title": "IEEE Day 2026" } },
      "registrantEmail": "ahmed@example.com",
      "ticketCode": "67a0...-66f1...-Vk3GhQ",
      "attended": true
    }
  ]
}
```

**Error Responses**

```json
// 400 — { "message": "No events found for this member" } | { "message": "User not found" }
```

---

### 3.2.11 List All Users (Advanced Filtering)

`GET /api/users/all`

Powerful filterable/paginated user query built for the admin dashboard and the email composer.

- **Auth:** Yes — roles: `xcom`, `board`
- **Query Params**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | `1` | Page number |
| `limit` | int | `1000` | Items per page |
| `sort` | string | `-createdAt` | Mongo sort syntax (comma-separated) |
| `fields` | string | excludes `password` | Field limiting |
| `search` | string | — | Case-insensitive regex over name/email |
| `role` | csv | — | e.g. `member,board` |
| `college` | csv | — | e.g. `Computer Engineering,EE` |
| `yearOfStudy` | csv | — | numeric years, e.g. `1,2` |
| `position` | csv | — | `student,professional` |
| `formId` | id | — | Restrict to users who registered in this form |
| `attendedOnly` | boolean | — | With `formId=true` → only scanned attendees |

Any other query key is applied as an exact-match Mongo filter.

**Success Response — `200 OK`**

```json
{
  "users": [
    {
      "_id": "66f1...",
      "name": "Ahmed Hassan",
      "email": "ahmed@example.com",
      "role": "user",
      "position": "student",
      "college": "Computer Engineering",
      "createdAt": "2026-08-01T10:15:00.000Z"
    }
  ],
  "total": 248,
  "allUsersCount": 250,
  "page": 1,
  "pages": 1
}
```

**Error Responses** — `500 { "message": "<db error>" }`

---

### 3.2.12 Create Internal Account (Privileged)

`POST /api/users/create-internal`

XCom-only endpoint for creating staff accounts (no OTP required).

- **Auth:** Yes — role: `xcom`
- **Body:** `application/json`

| Field | Type | Required | Allowed Values |
|-------|------|:--------:|----------------|
| `name` | string | ✅ | |
| `email` | string | ✅ | unique |
| `password` | string | ✅ | |
| `role` | string | ✅ | `board`, `xcom`, `scanner`, `member` |
| `committee` | string | ➖ | e.g. `Technical` |

**Request Example**

```json
{ "name": "Sara Ali", "email": "sara@ieeesha.org", "password": "Board!2026", "role": "board", "committee": "PR" }
```

**Success Response — `201 Created`**

```json
{ "message": "Success! Created new board.", "user": { "id": "67b2...", "name": "Sara Ali", "role": "board" } }
```

**Error Responses**

```json
// 400 — { "message": "User already exists" }
//        { "message": "Invalid role. Use register for normal users." }
```

---

### 3.2.13 Export Users to Excel

`GET /api/users/export`

Downloads an `.xlsx` of all users matching the same filters as §3.2.11 (no pagination).

- **Auth:** Yes — roles: `xcom`, `board`
- **Query Params:** identical filter set to §3.2.11

**Success Response — `200 OK`**

```
Binary spreadsheet (users_export.xlsx)
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Columns: Name, Email, Role, Position, Phone, University, College, Year,
         Organization, Role in Organization, Years of Experience,
         Reason for Registration, Committee
```

**Error Responses** — `500 { "message": "<error>" }`

### 3.2.14 Export Selected Users to Excel

`POST /api/users/export-specific`

Downloads an `.xlsx` limited to specific user IDs.

- **Auth:** Yes — roles: `xcom`, `board`
- **Body:** `application/json`

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `userIds` | [string] \| csv-string | ✅ | Array of ObjectIds (comma string accepted) |

**Request Example**

```json
{ "userIds": ["66f1a2b3c4d5e6f7a8b9c0d1", "67b2d4e5f6a7b8c9d0e1f2a3"] }
```

**Success Response — `200 OK`** — binary `.xlsx` (`selected_users_export.xlsx`)

**Error Responses**

```json
// 400 — { "message": "Please provide an array of userIds" } | { "message": "None of the provided IDs are valid." }
// 404 — { "message": "No users found with the provided IDs" }
```

---

### 3.2.15 List Members

`GET /api/users/members`

Returns every user (used by internal member-management screens).

- **Auth:** Yes — roles: `xcom`, `board`, `member`, `scanner`

**Success Response — `200 OK`**

```json
{ "dataLength": 250, "data": [ /* full user documents */ ] }
```

**Error Responses** — `400 { "message": "No users to show" }`

### 3.2.16 Create Member

`POST /api/users/members`

Directly creates any user with any valid schema role.

- **Auth:** Yes — roles: `xcom`, `board`, `member`, `scanner`
- **Body:** `application/json` — requires `name`, `email`, `password`, `role`; all other schema fields optional.

**Request Example**

```json
{ "name": "Omar Khaled", "email": "omar@ieee.org", "password": "Member#2026", "role": "member", "position": "student" }
```

**Success Response — `201 Created`**

```json
{ "status": "success", "message": "Member created successfly", "data": { /* created user */ } }
```

**Error Responses**

```json
// 400 — { "message": "Please Provide name, email, role and password" }
//        { "message": "Invalid role. Allowed roles are: user, member, board, xcom, scanner" }
//        { "message": "Member already exists" }
```

### 3.2.17 Get Single Member

`GET /api/users/members/:id` — **Auth:** Yes (`xcom`, `board`, `member`, `scanner`)

**Success Response — `200 OK`**

```json
{ "status": "success", "data": { /* user document */ } }
```

**Error Responses** — `400 { "message": "Member not found" }`

### 3.2.18 Upgrade Member Role

`PATCH /api/users/members/:id`

- **Auth:** Yes — roles: `xcom`, `board`, `member`, `scanner`
- **Body:** `{ "role": "<valid schema role>" }`

**Success Response — `200 OK`**

```json
{ "status": "success", "message": "Member role updated successfly", "data": { /* updated user */ } }
```

**Error Responses**

```json
// 400 — { "message": "Role is required" } | { "message": "Invalid role..." } | { "message": "Member not found" }
```

### 3.2.19 Delete Member

`DELETE /api/users/members/:id`

Deletes the member **plus** their submissions and pending requests. Only `xcom` may delete others; every user may delete themselves (account-closure feature).

- **Auth:** Yes (`protect`)

**Success Response — `200 OK`**

```json
{ "status": "success", "message": "Member deleted successfully", "deletedId": "66f1a2b3c4d5e6f7a8b9c0d1" }
```

**Error Responses**

```json
// 403 — { "message": "You can only delete your own account" }
// 400 — { "message": "Member not found" }
```

### 3.2.20 Search Members

`GET /api/users/search?keyword=<term>`

Case-insensitive search across name and email.

- **Auth:** Yes — roles: `xcom`, `board`
- **Query Params:** `keyword` (required)

**Success Response — `200 OK`**

```json
{ "status": "success", "dataLength": 2, "data": [ /* matched users */ ] }
```

**Error Responses**

```json
// 400 — { "message": "Search query is required" } | { "message": "No members found matching the search query" }
```

---

## 3.3 Dashboard Stats

### `GET /api/states/dashboard`

Aggregated analytics for the admin dashboard (MongoDB aggregation pipelines).

- **Auth:** Yes

**Success Response — `200 OK`**

```json
{
  "totalMembers": 250,
  "activeActivities": 4,
  "newRegistrations": 18,
  "collegeSplit": [
    { "college": "Computer Engineering", "count": 92 },
    { "college": "Electrical Engineering", "count": 61 }
  ],
  "positionSplit": [
    { "position": "student", "count": 220 },
    { "position": "professional", "count": 30 }
  ],
  "yearSplit": [
    { "yearOfStudy": 1, "count": 80 },
    { "yearOfStudy": 2, "count": 70 }
  ],
  "emailsSent": 1240,
  "topActiveMembers": [
    { "name": "Ahmed Hassan", "email": "ahmed@example.com", "activitiesAttended": 7 }
  ],
  "latestSignups": [
    {
      "_id": "67c1...",
      "name": "Mona Adel",
      "email": "mona@example.com",
      "position": "student",
      "college": "Computer Science",
      "yearOfStudy": 1,
      "organization": null,
      "createdAt": "2026-08-20T14:02:11.000Z"
    }
  ],
  "activityStatusSummary": [
    { "status": "upcoming", "count": 3 },
    { "status": "completed", "count": 11 }
  ],
  "registrationsPerActivity": [
    { "activityTitle": "IEEE Day 2026", "registrations": 140 }
  ]
}
```

---

## 3.4 Activities

### 3.4.1 Create Activity (+ Auto-Linked Form)

`POST /api/activities`

Creates an activity **and** automatically generates its registration form. Rich-text `content` is sanitized; optional `coverImage` streams to Cloudinary (`activities/` folder).

- **Auth:** Yes — roles: `xcom`, `board`
- **Headers:** `Content-Type: multipart/form-data`
- **Form-Data Fields**

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `title` | text | ✅ | |
| `content` | text (HTML) | ✅ | Sanitized against allow-list |
| `location` | text | ✅ | |
| `description` | text | ➖ | |
| `type` | text | ➖ | `general` \| `event` \| `workshop` \| `webinar` |
| `speakers` | JSON array | ➖ | `[{ "name", "title", "image", "bio" }]` |
| `startDate` | date | ➖ | default: now |
| `endDate` | date | ➖ | default: now + 7 days |
| `registrationEnabled` | boolean | ➖ | |
| `coverImage` | **file** | ➖ | image binary |
| `fields` | JSON array | ➖ | custom form fields; defaults to Name+Email |
| `maxSubmissions` | number | ➖ | capacity cap for the generated form |
| `formStatus` | text | ➖ | initial form status (default `Active`) |

**Request Example (multipart)**

```
title:        IEEE Day 2026
content:      <h1>Join us!</h1><p>A day of tech talks...</p>
location:      Main Auditorium, Helwan University
type:         event
startDate:    2026-10-05T09:00:00Z
endDate:      2026-10-05T16:00:00Z
coverImage:   (binary file)
fields:       [{"label":"Full Name","type":"TextInput","required":true},
               {"label":"T-Shirt Size","type":"Dropdown","required":true,"options":["S","M","L"]}]
```

**Success Response — `201 Created`**

```json
{
  "success": true,
  "message": "Activity created with associated form",
  "activity": {
    "_id": "67d0a1b2c3d4e5f6a7b8c9d0",
    "title": "IEEE Day 2026",
    "content": "<h1>Join us!</h1><p>A day of tech talks...</p>",
    "type": "event",
    "location": "Main Auditorium, Helwan University",
    "startDate": "2026-10-05T09:00:00.000Z",
    "endDate": "2026-10-05T16:00:00.000Z",
    "coverImage": "https://res.cloudinary.com/demo/image/upload/v1/activities/xyz.jpg",
    "registrationEnabled": true
  },
  "form": {
    "_id": "67d0a1b2c3d4e5f6a7b8c9d1",
    "title": "IEEE Day 2026",
    "activityID": "67d0a1b2c3d4e5f6a7b8c9d0",
    "status": "Active",
    "type": "registration",
    "fields": [
      { "id": "full_name", "label": "Full Name", "type": "TextInput", "required": true }
    ]
  }
}
```

**Error Responses** — `400 { "message": "Title, content, and location are required" }`

---

### 3.4.2 List Activities (Public)

`GET /api/activities?page=1&limit=10`

Paginated public feed; each item carries a computed registration `status` and its `formID`.

- **Auth:** No

**Success Response — `200 OK`**

```json
{
  "success": true,
  "pagination": { "totalItems": 12, "totalPages": 2, "currentPage": 1, "itemsPerPage": 10 },
  "activities": [
    {
      "_id": "67d0a1b2c3d4e5f6a7b8c9d0",
      "title": "IEEE Day 2026",
      "content": "<h1>Join us!</h1>...",
      "description": "",
      "type": "event",
      "speakers": [],
      "location": "Main Auditorium, Helwan University",
      "startDate": "2026-10-05T09:00:00.000Z",
      "endDate": "2026-10-05T16:00:00.000Z",
      "createdAt": "2026-08-10T12:00:00.000Z",
      "coverImage": "https://res.cloudinary.com/...jpg",
      "registrationEnabled": true,
      "status": "Active",
      "formID": "67d0a1b2c3d4e5f6a7b8c9d1"
    }
  ]
}
```

### 3.4.3 Get Single Activity (Public)

`GET /api/activities/:id`

- **Auth:** No

**Success Response — `200 OK`**

```json
{ "success": true, "activity": { /* full activity */ }, "form": { /* linked form or null */ } }
```

**Error Responses** — `404 { "message": "Activity not found" }`

### 3.4.4 Update Activity

`PUT /api/activities/:id`

Partial update; accepts a new `coverImage` (old one deleted from Cloudinary first). Sending `coverImage: ""` removes the existing cover.

- **Auth:** Yes — roles: `xcom`, `board`
- **Headers:** `multipart/form-data` (or JSON for text-only edits)
- **Validation:** `startDate` cannot be after `endDate`

**Request Example (JSON)**

```json
{ "title": "IEEE Day 2026 — Extended", "location": "Hall B" }
```

**Success Response — `200 OK`**

```json
{ "success": true, "activity": { /* updated document */ } }
```

**Error Responses**

```json
// 400 — { "message": "Start date cannot be after end date" }
// 404 — { "message": "Activity not found" }
```

### 3.4.5 Delete Activity

`DELETE /api/activities/:id`

Cascade-deletes the activity, its linked form, and **all** related submissions.

- **Auth:** Yes — roles: `xcom`, `board`

**Success Response — `200 OK`**

```json
{ "success": true, "message": "Activity + related form + submissions deleted" }
```

**Error Responses** — `404 { "message": "Activity not found" }`

### 3.4.6 Featured Activities

Homepage showcase — a single document holding up to **2** activity references.

#### Add to Featured

`POST /api/activities/:id/add-featured`

- **Auth:** Yes — roles: `xcom`, `board`

**Success Response — `200 OK`**

```json
{
  "message": "Activity added to featured list successfully",
  "data": ["67d0a1b2c3d4e5f6a7b8c9d0", "67d0a1b2c3d4e5f6a7b8c9dd"]
}
```

**Error Responses**

```json
// 400 — { "message": "You can only display up to 2 activities. Please remove one first." }
//        { "message": "This activity is already featured." }
//        { "message": "Invalid Activity ID format" }
```

#### Remove from Featured

`DELETE /api/activities/:id/remove-featured`

- **Auth:** Yes — roles: `xcom`, `board`

**Success Response — `200 OK`**

```json
{ "message": "Activity removed from featured list successfully", "data": [] }
```

**Error Responses** — `404 { "message": "No featured activities list found." }`

#### Swap Featured Order

`POST /api/activities/swap-featured`

Reverses display order of the two featured items.

- **Auth:** Yes — roles: `xcom`, `board`

**Success Response — `200 OK`**

```json
{ "message": "Featured activities swapped successfully", "data": ["67d0...d9dd", "67d0...c9d0"] }
```

**Error Responses** — `400 { "message": "Need exactly 2 featured activities to swap." }`

#### Get Featured Activities

`GET /api/activities/featured`

- **Auth:** No

**Success Response — `200 OK`**

```json
{
  "success": true,
  "activities": [
    {
      "_id": "67d0a1b2c3d4e5f6a7b8c9d0",
      "title": "IEEE Day 2026",
      "coverImage": "https://res.cloudinary.com/...jpg",
      "status": "Active",
      "formID": "67d0a1b2c3d4e5f6a7b8c9d1"
    }
  ]
}
```

---

## 3.5 Forms

### 3.5.1 Create Standalone Form

`POST /api/form`

Creates a form not necessarily tied to an activity (surveys, volunteer applications…).

- **Auth:** Yes — roles: `xcom`, `board`
- **Body:** `application/json`

| Field | Type | Required | Default |
|-------|------|:--------:|---------|
| `title` | string | ✅ | |
| `type` | string | ✅ | — (use `"registration"` for ticketed events) |
| `description` | string | ➖ | |
| `fields` | [field] | ➖ | `[{ label: "Full Name", type: "text", required: true }]` |
| `startDate` | date | ➖ | now |
| `endDate` | date | ➖ | now + 7 days |
| `maxSubmissions` | number | ➖ | unlimited |

**Request Example**

```json
{
  "title": "Volunteer Application",
  "type": "volunteer",
  "description": "Join our organizing team",
  "fields": [
    { "label": "Full Name", "type": "TextInput", "required": true },
    { "label": "Preferred Committee", "type": "Dropdown", "required": true, "options": ["Technical", "HR", "PR"] },
    { "label": "Skills", "type": "Checkbox", "required": false, "options": ["Design", "Public Speaking", "Logistics"] },
    { "label": "Resume", "type": "FileUpload", "required": true }
  ],
  "endDate": "2026-09-30T23:59:59Z"
}
```

**Success Response — `201 Created`**

```json
{
  "_id": "67e0f1a2b3c4d5e6f7a8b9c0d",
  "title": "Volunteer Application",
  "type": "volunteer",
  "status": "Draft",
  "createdBy": "67b2d4e5f6a7b8c9d0e1f2a3",
  "fields": [
    { "id": "full_name", "label": "Full Name", "type": "TextInput", "required": true },
    { "id": "preferred_committee", "label": "Preferred Committee", "type": "Dropdown", "required": true, "options": ["Technical", "HR", "PR"] }
  ],
  "startDate": "2026-08-24T00:00:00.000Z",
  "endDate": "2026-09-30T23:59:59.000Z",
  "maxSubmissions": 9007199254740991,
  "requiresLogin": false
}
```

**Error Responses** — `400 { "message": "Title and Type are required" }`

### 3.5.2 Get Single Form (Public)

`GET /api/form/:id`

Public renderer endpoint. Returns the form **only while it is `Active` and before its end date**.

- **Auth:** No

**Success Response — `200 OK`**

```json
{
  "_id": "67d0a1b2c3d4e5f6a7b8c9d1",
  "title": "IEEE Day 2026",
  "type": "registration",
  "status": "Active",
  "fields": [
    { "id": "full_name", "label": "Full Name", "type": "TextInput", "required": true },
    { "id": "tshirt_size", "label": "T-Shirt Size", "type": "Dropdown", "required": true, "options": ["S", "M", "L"] }
  ],
  "requiresLogin": false
}
```

**Error Responses**

```json
// 400 — { "message": "This form is currently closed." }
// 404 — { "message": "Form not found" }
```

### 3.5.3 List All Forms

`GET /api/form?page=1&limit=10`

Returns forms plus live status counters.

- **Auth:** No *(mounted before the guard in current routing)*

**Success Response — `200 OK`**

```json
{
  "count": 14,
  "draftCount": 3,
  "closedCount": 6,
  "activeCount": 5,
  "forms": [ /* newest-first form documents */ ],
  "pagination": { "totalItems": 14, "totalPages": 2, "currentPage": 1, "itemsPerPage": 10 }
}
```

### 3.5.4 Delete Form

`DELETE /api/form/:id`

- **Auth:** Yes — roles: `xcom`, `board`

**Success Response — `200 OK`**

```json
{ "message": "Form removed" }
```

**Error Responses** — `404 { "message": "Form not found" }`

### 3.5.5 Toggle Form Status

`PUT /api/form/:id/toggle`

Flips between `Active` ⇄ `Closed`.

- **Auth:** Yes — roles: `xcom`, `board`

**Success Response — `200 OK`**

```json
{ "message": "Form is now Closed" }
```

**Error Responses** — `404 { "message": "Form not found" }`

### 3.5.6 Update Form Settings

`PUT /api/form/:id/settings`

Updates scheduling/capacity settings.

- **Auth:** Yes — roles: `xcom`, `board`
- **Body:** `application/json` — any subset of:

| Field | Type | Notes |
|-------|------|-------|
| `startDate` | date | must precede `endDate` |
| `endDate` | date | |
| `maxSubmissions` | number | |

**Request Example**

```json
{ "endDate": "2026-11-01T23:59:59Z", "maxSubmissions": 300 }
```

**Success Response — `200 OK`**

```json
{ "message": "Form settings updated successfully", "form": { /* updated document */ } }
```

**Error Responses**

```json
// 400 — { "message": "startDate must be before endDate" }
// 404 — { "message": "Form not found" }
// 500 — { "message": "Internal server error", "error": "<detail>" }
```

---

## 3.6 Submissions & Ticketing

### 3.6.1 Submit a Form

`POST /api/submissions`

Submits answers to a form. One submission per user per form (DB-enforced). For `registration`-type forms, a **ticket code + QR image** is generated and the ticket is emailed asynchronously. Uploaded files go to Cloudinary and their URLs replace/add the corresponding answer keys.

- **Auth:** Yes (any logged-in user)
- **Headers:** `multipart/form-data` when uploading files (otherwise JSON works)
- **Fields**

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `formId` | string | ✅ | Target form |
| `answers` | JSON object *or* JSON string | ✅ | Keys = form field ids |
| `files` | binary (any field names) | ➖ | Each `fieldname` maps to a `FileUpload` field id |

**Request Example (JSON)**

```json
{
  "formId": "67d0a1b2c3d4e5f6a7b8c9d1",
  "answers": {
    "full_name": "Ahmed Hassan",
    "tshirt_size": "L"
  }
}
```

**Server-side Validation (per form schema):** required fields present; dropdown/checkbox answers ∈ options; text fields are strings; file-upload answers are URLs; duplicate submissions rejected; form must be `Active` and unexpired; `maxSubmissions` respected.

**Success Response — `201 Created`**

```json
{
  "status": "success",
  "message": "Submitted successfully",
  "ticketCode": "67d0a1b2c3d4e5f6a7b8c9d1-66f1a2b3c4d5e6f7a8b9c0d1-Vk3GhQ",
  "data": {
    "_id": "67f0aa11bb22cc33dd44ee55",
    "formId": "67d0a1b2c3d4e5f6a7b8c9d1",
    "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
    "registrantEmail": "ahmed@example.com",
    "answers": { "full_name": "Ahmed Hassan", "tshirt_size": "L" },
    "ticketCode": "67d0a1b2c3d4e5f6a7b8c9d1-66f1a2b3c4d5e6f7a8b9c0d1-Vk3GhQ",
    "qrImage": "data:image/png;base64,iVBORw0KGgo...",
    "status": "pending",
    "attended": false
  }
}
```

*(Non-registration forms omit `ticketCode`.)*

**Error Responses**

```json
// 400
{ "message": "Form ID and answers are required" }
{ "message": "This form is currently closed" }
{ "message": "Maximum submissions reached" }
{ "message": "You already submitted this form" }
{ "message": "Submission failed validation: Field 'Full Name' is required." }

// 404
{ "message": "Form not found" }
```

---

### 3.6.2 Scan Ticket (Check-In)

`POST /api/submissions/scan`

Gatekeeper endpoint for event entry. Marks the ticket as attended (once!).

- **Auth:** Yes — roles: `xcom`, `scanner`, `board`, `member`
- **Body:** `application/json`

| Field | Type | Required |
|-------|------|:--------:|
| `code` | string | ✅ | full ticket code decoded from the QR |

**Request Example**

```json
{ "code": "67d0a1b2c3d4e5f6a7b8c9d1-66f1a2b3c4d5e6f7a8b9c0d1-Vk3GhQ" }
```

**Success Response — `200 OK`**

```json
{
  "success": true,
  "message": "Welcome, Ahmed Hassan!",
  "registrant": "Ahmed Hassan"
}
```

**Error Responses**

```json
// 404 — { "message": "Invalid Ticket!" }
// 400 — { "message": "Already Scanned!" }
```

---

### 3.6.3 Get My Submission

`GET /api/submissions/:userid/:formid`

Fetches one user's submission for a given form (used to re-display a ticket).

- **Auth:** Yes
- **Path Params:** `userid`, `formid`

**Success Response — `200 OK`**

```json
{
  "_id": "67f0aa11bb22cc33dd44ee55",
  "formId": "67d0a1b2c3d4e5f6a7b8c9d1",
  "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "registrantEmail": "ahmed@example.com",
  "answers": { "full_name": "Ahmed Hassan", "tshirt_size": "L" },
  "status": "pending",
  "ticketCode": "67d0...-66f1...-Vk3GhQ",
  "qrImage": "data:image/png;base64,...",
  "attended": true,
  "attendedAt": "2026-10-05T09:12:44.000Z"
}
```

**Error Responses** — `404 { "message": "Submission not found" }`

### 3.6.4 List All Submissions (Admin)

`GET /api/submissions`

Returns all submissions with aggregate counters.

- **Auth:** Yes — roles: `xcom`, `board`

**Success Response — `200 OK`**

```json
{
  "totalCount": 512,
  "pendingCount": 300,
  "approvedCount": 90,
  "rejectedCount": 12,
  "attendedCount": 110,
  "submissions": [ /* submission documents */ ]
}
```

### 3.6.5 Submissions for One Form (Admin)

`GET /api/submissions/form/:formId`

- **Auth:** Yes — roles: `xcom`, `board`

**Success Response — `200 OK`**

```json
{ "total": 140, "submissions": [ /* populated with userId name/email */ ] }
```

### 3.6.6 Export Submissions to Excel

`GET /api/submissions/export/:formId`

Styled multi-sheet workbook: user-info columns + one column per dynamic form question, with section header bands.

- **Auth:** Yes — roles: `xcom`, `board`

**Success Response — `200 OK`** — binary `.xlsx` (`responses_<formId>.xlsx`)

**Error Responses**

```json
// 400 — { "message": "Form ID is required" }
// 404 — { "message": "Form not found in database" } | { "message": "No submissions found for this form" }
```

### 3.6.7 Download Submitted File

`GET /api/submissions/download?url=<encoded cloudinary url>`

Proxies a stored submission file back to admins as an attachment.

- **Auth:** Yes — roles: `xcom`, `board`
- **Query Params:** `url` (required, URI-encoded)

**Success Response — `200 OK`** — binary file stream with original content-type.

**Error Responses**

```json
// 400 — { "message": "URL is required" }
// 404 — { "message": "File not found" }
```

---

## 3.7 Committee Requests

Workflow: a user requests a committee position → `PendingRequest` created → `xcom`/`board` approve or reject → approval assigns `user.committee` and emails the decision. XCom/board requests bypass review (auto-accepted).

### 3.7.1 Create Committee Request

`POST /api/committee-requests`

- **Auth:** Yes (any logged-in user)
- **Body:** `application/json`

| Field | Type | Required |
|-------|------|:--------:|
| `committee_position` | string | ✅ |

**Request Example**

```json
{ "committee_position": "Technical" }
```

**Success Response — `201 Created`** *(regular user)*

```json
{
  "success": true,
  "message": "Committee request submitted successfully",
  "data": {
    "_id": "68a1b2c3d4e5f6a7b8c9d0e1",
    "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
    "committee_position": "Technical",
    "request_status": "pending"
  }
}
```

*(XCom/board callers receive:* `"Committee request submitted and accepted automatically"` *)*

**Error Responses**

```json
// 400 — { "message": "Committee position is required" }
//        { "message": "You already have a pending committee request. Please wait for it to be reviewed." }
//        { "message": "User already has this committee position" }
// 404 — { "message": "User not found" }
```

### 3.7.2 My Requests

`GET /api/committee-requests/my`

- **Auth:** Yes

**Success Response — `200 OK`**

```json
{
  "success": true,
  "data": [
    { "_id": "68a1...", "committee_position": "Technical", "request_status": "pending", "createdAt": "2026-08-20T09:30:00.000Z" }
  ]
}
```

### 3.7.3 All Requests (Admin)

`GET /api/committee-requests?status=pending&committee_position=Technical&page=1&limit=10`

- **Auth:** Yes — roles: `xcom`, `board`
- **Query Params:** `status` (`pending|approved|rejected`), `committee_position`, `page`, `limit`

**Success Response — `200 OK`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "68a1...",
      "committee_position": "Technical",
      "request_status": "pending",
      "userId": {
        "_id": "66f1...",
        "name": "Ahmed Hassan",
        "email": "ahmed@example.com",
        "position": "student",
        "university": "Helwan University"
      }
    }
  ],
  "pagination": { "totalItems": 9, "totalPages": 1, "currentPage": 1, "itemsPerPage": 10 }
}
```

### 3.7.4 Approve / Reject Request

`PUT /api/committee-requests/:requestId/status`

Processes a pending request. Approval assigns the position and emails acceptance; rejection emails a decline. Either way the request document is removed after processing.

- **Auth:** Yes — roles: `xcom`, `board`
- **Body:** `application/json` — `{ "status": "approved" | "rejected" }` (required)

**Success Response — `200 OK`**

```json
{ "success": true, "message": "Request approved successfully", "data": { /* updated user */ } }
```

**Error Responses**

```json
// 400 — { "message": "Status must be either approved or rejected" }
//        { "message": "Request has already been processed" }
// 404 — { "message": "Request not found" } | { "message": "User not found" }
```

### 3.7.5 Change User Committee Directly

`PUT /api/committee-requests/:userId/position`

Admin override to reassign a user's committee without a request.

- **Auth:** Yes — roles: `xcom`, `board`
- **Body:** `{ "committee_position": "HR" }`

**Success Response — `200 OK`**

```json
{ "success": true, "message": "Committee position changed successfully", "data": { /* updated user */ } }
```

**Error Responses**

```json
// 400 — { "message": "User already has this committee position" }
// 404 — { "message": "User not found" }
```

---

## 3.8 Crew Directory

Public team roster displayed on the website; writable by admins only.

### 3.8.1 List Crew (Public)

`GET /api/crew`

**Success Response — `200 OK`**

```json
{
  "success": true,
  "results": 2,
  "data": [
    {
      "_id": "69b1c2d3e4f5a6b7c8d9e0f1",
      "name": "Sara Ali",
      "position": "Chairperson",
      "image": "https://res.cloudinary.com/.../sara.jpg",
      "bio": "Leading the SHA branch..."
    }
  ]
}
```

### 3.8.2 Create Crew Member

`POST /api/crew` — **Auth:** Yes — roles: `xcom`, `board`

```json
// Request
{ "name": "Omar Khaled", "position": "Technical Lead", "image": "https://...", "bio": "..." }

// 201 Created
{ "success": true, "data": { "_id": "...", "name": "Omar Khaled", "position": "Technical Lead" } }
```

### 3.8.3 Update Crew Member

`PUT /api/crew/:id` — **Auth:** Yes — roles: `xcom`, `board`

```json
// Request
{ "position": "Vice Chairperson" }

// 200 OK
{ "success": true, "data": { /* updated crew member */ } }
```

**Error Responses** — `404 { "message": "Crew member not found" }`

### 3.8.4 Delete Crew Member

`DELETE /api/crew/:id` — **Auth:** Yes — roles: `xcom`, `board`

```json
// 200 OK
{ "success": true, "message": "Crew member deleted successfully" }
```

**Error Responses** — `404 { "message": "Crew member not found" }`

---

## 3.9 Bulk Emails

Campaign engine backed by **Brevo**. Both send endpoints respond with a **chunked NDJSON stream** — one JSON line per recipient result — enabling live progress in the UI. Every outcome is persisted to `emaillogs` with status `Done`, `Rejected`, or `Not email`. Message bodies support `{{placeholder}}` tokens filled from recipient data.

### 3.9.1 Bulk Send from Excel Upload

`POST /api/emails/bulk-send`

Reads an Excel file whose **first column contains recipient emails**; remaining columns become merge-data placeholders.

- **Auth:** Yes — roles: `xcom`, `board`
- **Headers:** `multipart/form-data`
- **Fields**

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `excelFile` | **file** (.xlsx) | ✅ | Row 1 = headers; col A = email |
| `email` | text | ✅ | Message body (`{{HeaderName}}` tokens allowed) |
| `subject` | text | ➖ | Defaults to `"Notification"` |
| `attachments` | file(s) | ➖ | Sent with every email (≤ 10 MB each) |

**Example Excel**

| Email | Name | Event |
|-------|------|-------|
| ahmed@example.com | Ahmed | IEEE Day |

With body `Hello {{Name}}, you're invited to {{Event}}!`

**Success Response — `200 OK`** *(chunked, `Transfer-Encoding: chunked`)*

```
{"email":"ahmed@example.com","status":"Done"}
{"email":"not-an-email","status":"Not email"}
{"message":"Process Completed"}
```

**Error Responses**

```json
// 400 — { "error": "File and message body are required" }
// 401 — { "error": "Unauthorized user" }
// 500 — { "error": "Internal server error" }
//        (mid-stream failures emit: {"error":"Process interrupted due to server error"})
```

### 3.9.2 Bulk Send from Database

`POST /api/emails/bulk-send-db`

Targets registered users by IDs and/or emails — no spreadsheet needed.

- **Auth:** Yes — roles: `xcom`, `board`
- **Headers:** `multipart/form-data`
- **Fields**

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `email` | text | ✅ | Message body |
| `subject` | text | ➖ | |
| `userIds` | JSON array (as text) | ➖ | e.g. `["66f1...","67b2..."]` |
| `emails` | JSON array (as text) | ➖ | e.g. `["a@x.com","b@y.com"]` |
| `attachments` | file(s) | ➖ | |

**Request Example (multipart text fields)**

```
email:    "Reminder: IEEE Day starts tomorrow at 9 AM!"
subject:  "Event Reminder"
userIds:  ["66f1a2b3c4d5e6f7a8b9c0d1"]
emails:   ["mona@example.com"]
```

**Success Response — `200 OK`** *(chunked NDJSON, same shape as §3.9.1)*

```
{"email":"ID: 999...","status":"Invalid ID Format"}
{"email":"ghost@example.com","status":"Not found in DB"}
{"email":"ahmed@example.com","status":"Done"}
{"email":"mona@example.com","status":"Done"}
{"message":"Process Completed"}
```

**Error Responses**

```json
// 400 — { "error": "Message body is required" }
//        { "error": "Invalid format for userIds or emails. Must be a JSON array." }
//        { "error": "No valid userIds or emails provided to search." }
```

### 3.9.3 Email Logs

`GET /api/emails/logs?page=1&limit=10&status=Done`

Paginated delivery log with aggregate statistics.

- **Auth:** Yes — roles: `xcom`, `board`
- **Query Params**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | int | `1` | |
| `limit` | int | `10` | |
| `status` | string | — | `Done` \| `Rejected` \| `Not email` (case-insensitive) |

**Success Response — `200 OK`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "70c1d2e3f4a5b6c7d8e9f0a1",
      "sendBy": "67b2d4e5f6a7b8c9d0e1f2a3",
      "email": "ahmed@example.com",
      "status": "Done",
      "subject": "Event Reminder",
      "messageBody": "Reminder: IEEE Day...",
      "sentAt": "2026-08-22T18:04:33.000Z"
    }
  ],
  "pagination": { "totalItems": 1240, "totalPages": 124, "currentPage": 1, "itemsPerPage": 10 },
  "stats": { "totalAll": 1240, "totalDone": 1180, "totalRejected": 42, "totalNotEmail": 18 }
}
```

**Error Responses** — `500 { "error": "Failed to fetch emails" }`

---

## Appendix A — Global Error Reference

| Scenario | Code | Body |
|----------|:----:|------|
| Unknown route | 404 | `{ "message": "This router is not exist" }` |
| No auth cookie | 401 | `{ "message": "Not authorized, no token" }` |
| Bad/expired cookie | 401 | `{ "message": "Not authorized, token failed" }` |
| Insufficient role | 403 | `{ "message": "User role <role> is not authorized to access this route" }` |
| Any `AppError` | 4xx | `{ "status": "fail", "message": "<msg>" }` |
| Unhandled exception | 500 | `{ "status": "error", "message": "<msg>" }` |

## Appendix B — Quick Test Flow (Postman/cURL)

```bash
BASE=http://localhost:5000

# 1. Health
curl $BASE/

# 2. Register (then fetch OTP from inbox)
curl -X POST $BASE/api/users/register -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Passw0rd!","confirmPassword":"Passw0rd!","position":"student","university":"HU","college":"CE","yearOfStudy":2}'

# 3. Verify OTP (stores auth cookie in cookies.txt)
curl -c cookies.txt -X POST $BASE/api/users/verify-email -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'

# 4. Fetch a form and submit
curl -b cookies.txt $BASE/api/form/<FORM_ID>
curl -b cookies.txt -X POST $BASE/api/submissions -H "Content-Type: application/json" \
  -d '{"formId":"<FORM_ID>","answers":{"full_name":"Test User"}}'
```

---

*Document generated for the IEEE SHA – SB backend (`server/`). Last updated: August 2026.*
