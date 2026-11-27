# Course Prerequisite Planner — Team 7

A web application for UMBC students to browse courses, view prerequisites, and plan their academic schedules.

Built with **React, JavaScript, and Vite**. Course data and prerequisite graphs come from Team B’s deployed API ([course-prereq-team3](https://course-prereq-team3.fastapicloud.dev/docs)). This app does not run its own backend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20.19+ or v22.12+)
- Git
- VS Code (recommended)

## Installation & Setup

**1. Clone the repository**

```bash
git clone https://github.com/umbc-cmsc447-team7/course-planner-ui.git
cd course-planner-ui
```

**2. Set up and start the frontend**

```bash
npm install
cp .env.example .env
npm run dev
```

Open the localhost URL displayed in your terminal (usually `http://localhost:5173`). Leave `VITE_API_URL` empty. The browser calls `/courses` and `/prereq-graph` on this app, and Vite forwards those to Team B. Their API does not send CORS headers, so do not point `VITE_API_URL` at their host.

Deploy the frontend only. `vercel.json` rewrites the same two paths to Team B, then falls back to `index.html` for the app routes. Do not set `VITE_API_URL` in the Vercel project.

## Login, roles and mock data

Sign in with one of Team A's demo accounts (student, counselor or admin). Each role sees only its own screens, following Team A's permission matrix (`src/auth/permissions.js`).

Some features wait on Team B endpoints that are not live yet. Until then they use mock data, switched in `src/api/config.js`:

| Feature | Endpoint requested from Team B | Mock behavior |
| --- | --- | --- |
| Login | `POST /auth/login` | Looks the email up in `GET /users`; the password is not checked |
| Term names | `GET /terms` | Fixed list in `src/api/termAPI.js` |
| Create / save plans | `/plans` (GET, POST, PUT, DELETE) | Stored in this browser's `localStorage` |

Set a flag to `false` once the endpoint is live. Edit actions for admins and counselors show as "Coming soon" until Team B adds write endpoints.

## Other Commands

```bash
npm run build    # Build for production
npm run lint     # Check code quality
```

## Team Collaboration

Before starting work:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

After making changes:

```bash
git add .
git commit -m "Describe your changes"
git push -u origin feature/your-feature-name
```

Create a **Pull Request** on GitHub for review before merging into `main`.

## Notes

- Run `npm install` after pulling changes that update dependencies.
- Never commit passwords, Supabase secret keys, or `.env` files containing credentials.
- Coordinate API and database integration with Teams A and B.
