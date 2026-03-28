# KPI Tracker

A full-stack web application for goal and KPI tracking across an organization. Managers and teams can define high-level goals, break them into sub-goals, assign them to departments/teams/employees, and track progress with clear metrics.

**Live Demo:** https://kpi-tracker-euw1.onrender.com

---

## Features

- **Goal Hierarchy** — Goals organized at four levels: Company → Department → Team → Employee
- **Dashboard** — At-a-glance overview of all goals by status (Achieved, On Track, In Progress, Behind, Not Started)
- **Goal Detail View** — Full drill-down per goal with progress bar, timeline, unit of measure, and level-specific fields (strategy, budget, SMART goal description)
- **Full CRUD** — Create, edit, and delete goals at any level via a form dialog
- **Organization Tree** — Collapsible hierarchy view of companies, departments, teams, and employees with add/delete support
- **Dark Mode** — Toggle in the sidebar footer
- **Persistent Storage** — SQLite database via Drizzle ORM; data survives server restarts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Routing | Wouter (hash-based) |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) + Drizzle ORM |
| Build Tool | Vite |
| Hosting | Render (free tier) |

---

## Project Structure

```
kpi-tracker/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       │   ├── Layout.tsx       # Sidebar + nav shell
│       │   ├── GoalCard.tsx     # Goal preview card
│       │   └── GoalFormDialog.tsx  # Create/Edit goal modal
│       ├── pages/           # Route-level pages
│       │   ├── Dashboard.tsx    # KPI overview dashboard
│       │   ├── GoalsPage.tsx    # All goals list + filters
│       │   ├── GoalDetailPage.tsx  # Single goal detail view
│       │   └── OrgPage.tsx      # Organization tree
│       └── lib/
│           └── api.ts           # API helper functions + color utils
├── server/                  # Express backend
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # All API routes + seed data
│   ├── storage.ts           # Database access layer (IStorage interface)
│   └── db.ts                # Drizzle + SQLite connection
├── shared/
│   └── schema.ts            # Drizzle schema + Zod types (shared by front and back)
├── render.yaml              # Render deployment config
└── package.json
```

---

## Database Schema

The schema mirrors the original ER diagram from Phase 1:

- **Company** — top-level org unit
- **Department** — belongs to a Company
- **Team** — belongs to a Department
- **Employee** — belongs to a Team
- **Goal** — superclass with ISA subclasses (CompanyGoal, DepartmentGoal, TeamGoal, EmployeeGoal) collapsed into a single table with a `level` discriminator field

---

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/Imonuil12/kpi-tracker.git
cd kpi-tracker

# 2. Install dependencies
npm install

# 3. Push the database schema (creates data.db locally)
npm run db:push

# 4. Start the dev server
npm run dev
```

The app will be running at **http://localhost:5000**

The dev server runs Express (backend) and Vite (frontend with HMR) on the same port.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build frontend + bundle backend for production |
| `npm run start` | Run the production build |
| `npm run db:push` | Push schema changes to the SQLite database |

---

## Deployment (Render)

The app is configured to auto-deploy on every push to `main` via `render.yaml`.

**Build command:** `npm install && npm run build && npm run db:push`  
**Start command:** `npm start`  
**Environment variable:** `NODE_ENV=production`

> ⚠️ Note: Render's free tier uses an ephemeral disk — the SQLite database resets on each new deploy. For persistent data across deploys, consider upgrading to a paid Render plan or migrating to a hosted PostgreSQL instance (e.g. [Neon](https://neon.tech) — free tier available).

---

## Making Changes

1. Fork or clone the repo
2. Create a new branch: `git checkout -b feature/my-change`
3. Make your changes
4. Test locally with `npm run dev`
5. Push and open a pull request to `main`

Any merged PR to `main` will automatically trigger a redeploy on Render.

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| Phase 1 | ✅ Done | ER Diagram + Application Requirements |
| Phase 2 | ✅ Done | Database schema, DDL, seed data, demo queries |
| Phase 3 | 🚧 This app | Full-stack web prototype (React + Express + SQLite) |
| Future | 📋 Planned | Auth/roles, PostgreSQL on AWS, Vercel frontend hosting |
