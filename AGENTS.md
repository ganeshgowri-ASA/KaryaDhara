# AGENTS.md — KaryaDhara Claude Code Session Plan

> Sacred Principles: Test before declaring success | Systematic error resolution | Rollback to last working state | Never break existing functionality

## Session Configuration
- **Auto-accept edits:** ON
- **Complex sessions:** Opus 4.6
- **Simple/parallel sessions:** Sonnet 4.6
- **Branch strategy:** feat/S{wave}.{session}-description
- **Commit style:** Conventional commits (feat:, fix:, docs:, chore:)

---

## Wave 1 — Foundation (Sessions 1-3, Parallel)

### Session 1: `feat/S1.1-nextjs-scaffold` (Sonnet 4.6)
**Branch:** feat/S1.1-nextjs-scaffold
**Scope:**
- Initialize Next.js 14 App Router project
- Install & configure: Tailwind CSS, shadcn/ui, Prisma, Zustand
- Set up folder structure: /app, /components, /lib, /prisma, /types
- Configure ESLint, Prettier, tsconfig paths
- Create layout.tsx with dark/light mode (next-themes)
- Add command palette skeleton (Ctrl+K)
- Verify: `npm run build` passes with zero errors

### Session 2: `feat/S1.2-prisma-schema` (Sonnet 4.6)
**Branch:** feat/S1.2-prisma-schema
**Scope:**
- Design complete Prisma schema:
  - User, Account, Session (NextAuth tables)
  - Workspace, WorkspaceMember
  - Project, Section
  - Task (title, description, dueDate, priority, status, position, parentId)
  - Label, TaskLabel (many-to-many)
  - Comment, Activity, Timer
  - ApiKey, Webhook, Integration
- Add indexes for performance (userId, workspaceId, dueDate, status)
- Generate migration, seed script with demo data
- Verify: `npx prisma migrate dev` + `npx prisma db seed` pass

### Session 3: `feat/S1.3-auth-system` (Opus 4.6)
**Branch:** feat/S1.3-auth-system
**Scope:**
- NextAuth.js with Prisma adapter
- Google + GitHub + Credentials providers
- Sign in / Sign up pages (shadcn/ui forms)
- Protected route middleware
- User profile page with avatar upload
- RBAC: Owner, Admin, Member, Viewer roles
- Session management with JWT
- Verify: Login flow works end-to-end, protected routes redirect

---

## Wave 2 — Core Task Engine (Sessions 4-6, Parallel)

### Session 4: `feat/S2.1-task-crud` (Opus 4.6)
**Branch:** feat/S2.1-task-crud
**Scope:**
- Task CRUD API routes (/api/tasks)
- Inline task creation with natural language date parsing (chrono-node)
- Rich text description (Tiptap editor)
- Priority selector (P1-P4 with color badges)
- Labels/tags CRUD with color picker
- Subtasks (nested, collapsible)
- Recurring task engine (rrule library)
- Task dependencies (blocked-by / blocks)
- Drag-and-drop reorder (dnd-kit)
- Verify: Create task with subtasks, labels, due date, recurrence

### Session 5: `feat/S2.2-views-engine` (Opus 4.6)
**Branch:** feat/S2.2-views-engine
**Scope:**
- List View with sorting (date, priority, label, custom)
- Kanban Board (react-beautiful-dnd or dnd-kit)
  - Default columns: To Do, In Progress, Review, Done
  - Custom columns per project
- Calendar View (react-big-calendar or custom)
- Timeline/Gantt View (basic, with dependencies)
- View switcher component
- Saved filters & custom views
- Verify: All 4 views render correctly, drag works in Kanban

### Session 6: `feat/S2.3-smart-features` (Sonnet 4.6)
**Branch:** feat/S2.3-smart-features
**Scope:**
- My Day view (daily focus, add/remove tasks)
- Pomodoro Timer (25/5/15 min, per-task tracking)
- Command Palette (Ctrl+K) with cmdk library
  - Quick add task, navigate, search, switch view
- Keyboard shortcuts (j/k navigate, x complete, e edit, d delete)
- Global search with fuzzy matching
- Verify: My Day works, Pomodoro tracks time, Cmd+K palette functional

---

## Wave 3 — API & Integrations (Sessions 7-8, Parallel)

### Session 7: `feat/S3.1-public-api` (Opus 4.6)
**Branch:** feat/S3.1-public-api
**Scope:**
- REST API v1 (/api/v1/tasks, /projects, /labels, /comments)
- API key generation & management UI
- OAuth2 token flow for third-party apps
- Rate limiting middleware (1000 req/min)
- OpenAPI/Swagger auto-generated docs (/api/docs)
- Webhook system (configurable endpoints, events, retry)
- Verify: API docs accessible, CRUD via Postman/curl works

### Session 8: `feat/S3.2-integrations` (Sonnet 4.6)
**Branch:** feat/S3.2-integrations
**Scope:**
- Google Calendar 2-way sync (OAuth + Calendar API)
- Slack app (create task from message, notifications)
- GitHub integration (link tasks to issues, auto-close)
- Email-to-task (inbound email parsing)
- Zapier/Make webhook triggers
- Verify: Google Cal sync works, Slack creates tasks

---

## Wave 4 — Polish & Deploy (Session 9)

### Session 9: `feat/S4.1-polish-deploy` (Opus 4.6)
**Branch:** feat/S4.1-polish-deploy
**Scope:**
- AI smart suggestions (OpenAI GPT-4 for task prioritization)
- Activity feed & notifications (in-app)
- Team workspace management
- Project templates (Sprint, GTD, Eisenhower)
- PWA manifest + service worker
- Performance optimization (React.memo, lazy loading, ISR)
- Error boundaries, loading states, empty states
- SEO meta tags, OG images
- Final QA: All features tested
- Verify: Lighthouse > 90, zero console errors, all flows work

---

## Deployment Checklist
- [ ] Railway PostgreSQL provisioned, DATABASE_URL set
- [ ] Vercel project linked to ganeshgowri-ASA/KaryaDhara
- [ ] Environment variables configured (NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, etc.)
- [ ] Prisma migrations run on production DB
- [ ] Domain configured (karyadhara.vercel.app)
- [ ] All branches merged to main via PR
- [ ] Lighthouse score > 90
- [ ] API docs live at /api/docs

---

## Quick Start for Claude Code IDE

```bash
git clone https://github.com/ganeshgowri-ASA/KaryaDhara.git
cd KaryaDhara
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Session Launch Template (Copy-paste into Claude Code)

```
You are working on KaryaDhara, a scalable task planner app.
Repo: github.com/ganeshgowri-ASA/KaryaDhara
PRD: See PRD.md in repo root
Branch: feat/S{X}.{Y}-{description}
Stack: Next.js 14, Prisma, PostgreSQL, shadcn/ui, Zustand, NextAuth.js
Rules: Test before success, systematic error resolution, rollback option, never break existing
Auto-accept: ON
Start coding now.
```
