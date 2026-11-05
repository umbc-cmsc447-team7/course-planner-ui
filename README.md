# Course Prerequisite Planner — Team 7

A web application for UMBC students to browse courses, view prerequisites, and plan their academic schedules.

Built with **React, JavaScript, and Vite** on the frontend and **Python FastAPI** on the backend. The React app never talks to Supabase directly; it calls the FastAPI endpoints under `/api`, and FastAPI reads the data from Supabase.

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

**2. Set up and start the backend (FastAPI)**

Requires Python 3.12+.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then fill in SUPABASE_URL and SUPABASE_ANON_KEY
uvicorn app.main:app --reload --port 8000
```

The API runs at `http://localhost:8000`. Interactive docs are at `http://localhost:8000/docs`.

| Endpoint | Description |
| --- | --- |
| `GET /api/health` | Health check |
| `GET /api/courses?search=&page=` | Paginated course search (20 per page) |
| `GET /api/courses/{course_identifier}` | One course, or 404 |
| `GET /api/courses/{course_id}/prerequisites` | Prerequisite groups and the courses they reference |

**3. Set up and start the frontend**

In a second terminal, from the repo root:

```bash
npm install
cp .env.example .env
npm run dev
```

Open the localhost URL displayed in your terminal (usually `http://localhost:5173`). In development, Vite forwards `/api` requests to the backend on port 8000, so keep both servers running. For a deployed backend, set `VITE_API_URL` in `.env` to its URL.

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
