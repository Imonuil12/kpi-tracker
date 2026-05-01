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
- **Persistent Storage** — PostgreSQL via Drizzle ORM

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Routing | Wouter (hash-based) |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express |
| Database | PostgreSQL (`pg`) + Drizzle ORM |
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
│   └── db.ts                # Drizzle + PostgreSQL connection
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
- **Goal** — superclass table joined to ISA subclass tables `CompanyGoal`, `DepartmentGoal`, `TeamGoal`, and `EmployeeGoal`

---

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Imonuil12/kpi-tracker.git
cd kpi-tracker

# 2. Install project dependencies
npm install

# 3. Start PostgreSQL locally
# Make sure PostgreSQL is installed and running before creating the database.

brew services start postgresql
# If your PostgreSQL installation is versioned, you may need something like:
brew services start postgresql@16

# To stop postgres use
brew services stop postgresql


# 4. Create a local PostgreSQL database
createdb -h localhost -p 5432 kpidb

# 5. Verify that the database was created successfully
psql -h localhost -p 5432 -d kpidb

# If the connection works, you should see a prompt like:
# kpidb=#
#
# To exit psql, run:
# \q

# 6. Set the PostgreSQL connection string
# General format:
export DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DB_NAME"

# Local macOS example, if your PostgreSQL username is your macOS username
# and you do not use a local database password:
export DATABASE_URL="postgres://$(whoami)@localhost:5432/kpidb"

# Alec's local example:
# export DATABASE_URL="postgres://alecfishbach@localhost:5432/kpidb"

# If your local PostgreSQL user has a password, use:
# export DATABASE_URL="postgres://USER:PASSWORD@localhost:5432/kpidb"

# 7. Push the database schema
npm run db:push

# This creates the required database tables.

# 8. Start the development server
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
| `npm run db:push` | Push schema changes to the PostgreSQL database |

---

## Deployment (Render)

The app is configured to auto-deploy on every push to `main` via `render.yaml`.

**Build command:** `npm install && npm run build && npm run db:push`  
**Start command:** `npm start`  
**Environment variables:** `NODE_ENV=production`, `DATABASE_URL=...`


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
| Phase 1 | Complete | ER Diagram + Application Requirements |
| Phase 2 | Complete | Database schema, DDL, seed data, demo queries |
| Phase 3 | Complete | Full-stack web prototype (React + Express + PostgreSQL) |
| Future | In progress | Present our prototype to potential users |
