# KaryaDhara (कार्यधारा) — Flow of Tasks 

> A scalable, API-first task planner built for seamless integration with your entire tool stack.

## What is KaryaDhara?

KaryaDhara combines the best of Todoist, TickTick, Linear, Asana & Microsoft To Do into one open-source, developer-friendly task planner with a public API.

## Key Features

- **4 Views** — List, Kanban, Calendar, Timeline/Gantt
- **Smart Task Engine** — Natural language dates, subtasks, dependencies, recurring tasks
- **My Day** — Daily focus view with AI-powered suggestions
- **Pomodoro Timer** — Built-in focus timer per task
- **Command Palette** — Ctrl+K for everything (Linear-inspired)
- **Public REST API** — Full CRUD, webhooks, OAuth2, Swagger docs
- **Integrations** — Google Calendar, Slack, GitHub, Zapier, Email
- **Dark/Light Mode** — System preference detection

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| State | Zustand |
| Auth | NextAuth.js |
| Database | Railway PostgreSQL |
| ORM | Prisma |
| Deploy | Vercel + Railway |

## Quick Start

```bash
git clone https://github.com/ganeshgowri-ASA/KaryaDhara.git
cd KaryaDhara
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Project Structure

```
KaryaDhara/
├── PRD.md          # Product Requirements Document
├── AGENTS.md       # Claude Code session plans (4 waves, 9 sessions)
├── app/            # Next.js App Router pages
├── components/     # shadcn/ui components
├── lib/            # Utilities, API helpers
├── prisma/         # Schema & migrations
└── types/          # TypeScript types
```

## Development Workflow (Srishti सृष्टि)

| Wave | Sessions | Focus |
|------|----------|-------|
| Wave 1 | S1.1-S1.3 | Foundation: Scaffold, DB Schema, Auth |
| Wave 2 | S2.1-S2.3 | Core: Task CRUD, Views, Smart Features |
| Wave 3 | S3.1-S3.2 | API & Integrations |
| Wave 4 | S4.1 | Polish, AI, PWA & Deploy |

## Links

- **Vercel:** [karya-dhara.vercel.app](https://karya-dhara.vercel.app)
- **PRD:** [PRD.md](./PRD.md)
- **Session Plans:** [AGENTS.md](./AGENTS.md)

## License

MIT


> Live: https://karya-dhara.vercel.app
