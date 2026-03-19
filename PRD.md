# KaryaDhara (कार्यधारा) — Product Requirements Document

> **"Flow of Tasks"** — A scalable, API-first task planner built for integration

## 1. Vision & Overview

KaryaDhara is a modern, scalable task planner designed with an API-first architecture, enabling seamless integration with external apps (Slack, Google Calendar, Notion, Zapier, etc.). Inspired by the best features of Todoist, TickTick, Linear, Asana, and Microsoft To Do.

**Target Users:** Solo developers, small teams, freelancers, and power users who need a task system that talks to their entire tool stack.

## 2. Reference Apps & Key Inspirations

| App | Key Takeaway |
|-----|-------------|
| Todoist | Natural language input, 200+ integrations, labels/filters |
| TickTick | Built-in calendar, Pomodoro timer, habit tracker |
| Linear | Keyboard-first UX, cycles/sprints, developer-grade API |
| Asana | Multi-view (list/board/timeline/calendar), team workspaces |
| Microsoft To Do | My Day focus, Outlook/M365 sync, smart suggestions |

## 3. Tech Stack (Srishti Workflow Standard)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| UI Components | shadcn/ui + Tailwind CSS |
| State Management | Zustand |
| Auth | NextAuth.js (Google, GitHub, Email) |
| Database | Railway PostgreSQL |
| ORM | Prisma |
| Deployment | Vercel (frontend) + Railway (DB) |
| API | REST + tRPC (internal), Public REST API v1 |
| Real-time | Server-Sent Events / WebSocket |
| AI | OpenAI GPT-4 for smart suggestions |

## 4. Core Features (MVP — Phase 1)

### 4.1 Authentication & User Management
- Google, GitHub, Email/Password sign-in via NextAuth.js
- User profile with avatar, timezone, preferences
- Role-based access: Owner, Admin, Member, Viewer

### 4.2 Task Management (Core)
- Create, edit, delete, archive tasks
- Title, description (rich text), due date, priority (P1-P4)
- Labels/Tags (color-coded, unlimited)
- Subtasks (nested, unlimited depth)
- Recurring tasks (daily, weekly, monthly, custom cron)
- Task dependencies (blocked-by / blocks)
- Drag-and-drop reordering
- Natural language date parsing ("tomorrow 3pm", "every monday")

### 4.3 Views
- **List View** — Default, sortable by date/priority/label
- **Kanban Board** — Drag between columns (To Do, In Progress, Done, custom)
- **Calendar View** — Monthly/weekly with task blocks
- **Timeline/Gantt** — For project planning with dependencies

### 4.4 Projects & Workspaces
- Workspaces (personal + team)
- Projects within workspaces
- Sections within projects
- Project templates (sprint, GTD, Eisenhower matrix)

### 4.5 Smart Features
- **My Day** — Daily focus view (inspired by Microsoft To Do)
- **Smart Suggestions** — AI-powered task prioritization
- **Pomodoro Timer** — Built-in focus timer per task
- **Quick Add** — Global keyboard shortcut (Ctrl+K) command palette
- **Filters & Saved Views** — Custom filter combinations

## 5. Integration & API Layer (Phase 2)

### 5.1 Public REST API v1
- Full CRUD for tasks, projects, labels, comments
- Webhook support (task.created, task.completed, etc.)
- API key + OAuth2 authentication
- Rate limiting (1000 req/min)
- OpenAPI/Swagger documentation

### 5.2 Built-in Integrations
- **Google Calendar** — 2-way sync
- **Slack** — Create tasks from messages, notifications
- **GitHub** — Link tasks to issues/PRs, auto-close on merge
- **Zapier/Make** — Trigger/action support
- **Email** — Forward emails to create tasks
- **Notion** — Sync databases

### 5.3 Webhooks
- Configurable webhook endpoints per workspace
- Events: task.created, task.updated, task.completed, task.deleted
- Retry logic with exponential backoff

## 6. Database Schema (Key Models)

```
User, Workspace, WorkspaceMember, Project, Section,
Task, Subtask, Label, TaskLabel, Comment,
ApiKey, Webhook, Integration, Activity, Timer
```

## 7. UI/UX Principles
- Keyboard-first (Linear-inspired shortcuts)
- Dark/Light mode with system preference detection
- Responsive: Desktop-first, mobile-friendly
- Minimal clicks: Inline editing everywhere
- Animations: Framer Motion for smooth transitions
- Command Palette: Ctrl+K for everything

## 8. Non-Functional Requirements
- **Performance:** < 200ms API response, < 2s initial load
- **Scalability:** Support 10K+ concurrent users
- **Security:** OWASP top 10, CSRF, XSS protection
- **Uptime:** 99.9% SLA target
- **Accessibility:** WCAG 2.1 AA compliant

## 9. Phased Rollout

| Phase | Scope | Timeline |
|-------|-------|----------|
| Phase 1 (MVP) | Auth, Tasks, Projects, 4 Views, My Day, Pomodoro | Week 1-2 |
| Phase 2 | Public API, Webhooks, Google Cal sync, Slack | Week 3-4 |
| Phase 3 | AI suggestions, GitHub integration, Templates | Week 5-6 |
| Phase 4 | Team workspaces, Activity feed, Mobile PWA | Week 7-8 |

## 10. Success Metrics
- Task creation to completion ratio > 70%
- API adoption: 50+ external integrations within 3 months
- User retention: 40% DAU/MAU
- Page load: < 1.5s on 3G
- API uptime: 99.9%

---

**Repo:** github.com/ganeshgowri-ASA/KaryaDhara
**Stack:** Next.js 14 | Prisma | Railway PostgreSQL | shadcn/ui | Vercel
**Workflow:** Srishti (सृष्टि) — Research → PRD → GitHub → Claude Code → QA → Merge → Deploy
