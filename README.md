# Course Prerequisite Planner — Team 7

A web application for UMBC students to browse courses, view prerequisites, and plan their academic schedules.

Built with **React, JavaScript, and Vite**.

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

**2. Install dependencies**

```bash
npm install
```

**3. Start the development server**

```bash
npm run dev
```

Open the localhost URL displayed in your terminal (usually `http://localhost:5173`).

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
