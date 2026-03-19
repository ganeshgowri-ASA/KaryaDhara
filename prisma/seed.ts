import { PrismaClient, TaskPriority, TaskStatus, WorkspaceRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding KaryaDhara database...");

  // ── Demo User ──────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: "demo@karyadhara.dev" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@karyadhara.dev",
      timezone: "Asia/Kolkata",
      preferences: {
        theme: "system",
        defaultView: "list",
        pomodoroLength: 25,
      },
    },
  });

  const teamUser = await prisma.user.upsert({
    where: { email: "priya@karyadhara.dev" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "priya@karyadhara.dev",
      timezone: "Asia/Kolkata",
      preferences: {},
    },
  });

  console.log(`  ✓ Users: ${user.email}, ${teamUser.email}`);

  // ── Workspace ──────────────────────────────────────────────
  const workspace = await prisma.workspace.upsert({
    where: { slug: "karyadhara-demo" },
    update: {},
    create: {
      name: "KaryaDhara Demo",
      slug: "karyadhara-demo",
      description: "Demo workspace for exploring KaryaDhara features",
      ownerId: user.id,
      settings: {
        defaultTaskView: "list",
        allowPublicProjects: false,
        weekStartDay: 1,
      },
    },
  });

  // ── Workspace Members ──────────────────────────────────────
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: WorkspaceRole.OWNER,
    },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: teamUser.id } },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: teamUser.id,
      role: WorkspaceRole.MEMBER,
    },
  });

  console.log(`  ✓ Workspace: ${workspace.name}`);

  // ── Labels ─────────────────────────────────────────────────
  const labelDefs = [
    { name: "Bug", color: "#ef4444" },
    { name: "Feature", color: "#6366f1" },
    { name: "Design", color: "#ec4899" },
    { name: "Backend", color: "#f59e0b" },
    { name: "Frontend", color: "#06b6d4" },
    { name: "Docs", color: "#10b981" },
    { name: "Urgent", color: "#dc2626" },
    { name: "Nice-to-have", color: "#94a3b8" },
  ];

  const labels: Record<string, { id: string }> = {};
  for (const def of labelDefs) {
    const label = await prisma.label.upsert({
      where: { workspaceId_name: { workspaceId: workspace.id, name: def.name } },
      update: {},
      create: { workspaceId: workspace.id, ...def },
    });
    labels[def.name] = label;
  }

  console.log(`  ✓ Labels: ${Object.keys(labels).join(", ")}`);

  // ── Project: KaryaDhara MVP ────────────────────────────────
  const project = await prisma.project.upsert({
    where: { id: "proj-karyadhara-mvp" },
    update: {},
    create: {
      id: "proj-karyadhara-mvp",
      workspaceId: workspace.id,
      name: "KaryaDhara MVP",
      description: "Build and ship the KaryaDhara v1.0 task planner",
      color: "#6366f1",
      icon: "🚀",
      position: 1,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-06-30"),
    },
  });

  // ── Project: Design System ──────────────────────────────────
  const project2 = await prisma.project.upsert({
    where: { id: "proj-design-system" },
    update: {},
    create: {
      id: "proj-design-system",
      workspaceId: workspace.id,
      name: "Design System",
      description: "Component library and design tokens for KaryaDhara UI",
      color: "#ec4899",
      icon: "🎨",
      position: 2,
    },
  });

  // ── Project: API Integrations ──────────────────────────────
  const project3 = await prisma.project.upsert({
    where: { id: "proj-api-integrations" },
    update: {},
    create: {
      id: "proj-api-integrations",
      workspaceId: workspace.id,
      name: "API Integrations",
      description: "Third-party integrations - Slack, Google Calendar, GitHub",
      color: "#f59e0b",
      icon: "🔌",
      position: 3,
    },
  });

  console.log(`  ✓ Projects: ${project.name}, ${project2.name}, ${project3.name}`);

  // ── Sections ───────────────────────────────────────────────
  const sectionDefs = [
    { name: "Backlog", position: 0 },
    { name: "In Sprint", position: 1 },
    { name: "In Review", position: 2 },
    { name: "Done", position: 3 },
  ];

  const sections: Record<string, { id: string }> = {};
  for (const def of sectionDefs) {
    const section = await prisma.section.upsert({
      where: { id: `sec-${def.name.toLowerCase().replace(/ /g, "-")}` },
      update: {},
      create: {
        id: `sec-${def.name.toLowerCase().replace(/ /g, "-")}`,
        projectId: project.id,
        ...def,
      },
    });
    sections[def.name] = section;
  }

  console.log(`  ✓ Sections: ${Object.keys(sections).join(", ")}`);

  // ── Tasks ──────────────────────────────────────────────────
  const now = new Date();
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

  const taskDefs = [
    // Backlog
    {
      id: "task-001",
      title: "Design Prisma schema for all core models",
      description:
        "Create a comprehensive Prisma schema covering User, Workspace, Project, Section, Task, Label, Comment, Activity, Timer, ApiKey, Webhook, and Integration models with proper indexes.",
      status: TaskStatus.DONE,
      priority: TaskPriority.P1,
      sectionId: sections["Done"].id,
      position: 1,
      dueDate: daysFromNow(-5),
      completedAt: daysFromNow(-3),
      labelNames: ["Backend", "Feature"],
    },
    {
      id: "task-002",
      title: "Set up Next.js 14 project with App Router",
      description:
        "Initialize Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui, and ESLint. Configure path aliases and project structure.",
      status: TaskStatus.DONE,
      priority: TaskPriority.P1,
      sectionId: sections["Done"].id,
      position: 2,
      dueDate: daysFromNow(-4),
      completedAt: daysFromNow(-2),
      labelNames: ["Frontend", "Feature"],
    },
    {
      id: "task-003",
      title: "Implement NextAuth.js authentication",
      description:
        "Configure Google, GitHub, and Email/Password providers. Set up session handling and protected routes.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.P1,
      sectionId: sections["In Sprint"].id,
      assigneeId: user.id,
      position: 1,
      dueDate: daysFromNow(2),
      labelNames: ["Backend", "Feature"],
    },
    {
      id: "task-004",
      title: "Build task creation and listing API",
      description:
        "Implement tRPC procedures for CRUD operations on tasks. Include filtering by status, priority, assignee, and due date.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.P1,
      sectionId: sections["In Sprint"].id,
      assigneeId: teamUser.id,
      position: 2,
      dueDate: daysFromNow(3),
      labelNames: ["Backend", "Feature"],
    },
    {
      id: "task-005",
      title: "Design Task List view UI",
      description:
        "Create the main task list view with sorting, grouping, and inline editing. Use shadcn/ui components.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P2,
      sectionId: sections["In Sprint"].id,
      assigneeId: teamUser.id,
      position: 3,
      dueDate: daysFromNow(5),
      labelNames: ["Frontend", "Design"],
    },
    {
      id: "task-006",
      title: "Implement Kanban board view",
      description:
        "Build drag-and-drop Kanban board with customizable columns. Use @dnd-kit for drag interactions.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P2,
      sectionId: sections["Backlog"].id,
      position: 1,
      dueDate: daysFromNow(10),
      labelNames: ["Frontend", "Feature"],
    },
    {
      id: "task-007",
      title: "Add label management system",
      description:
        "Allow users to create, edit, and delete labels. Support color picker and apply multiple labels to tasks.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P3,
      sectionId: sections["Backlog"].id,
      position: 2,
      dueDate: daysFromNow(12),
      labelNames: ["Frontend", "Backend"],
    },
    {
      id: "task-008",
      title: "Implement Pomodoro timer",
      description:
        "Build a per-task Pomodoro timer with 25/5 minute work/break cycles. Store sessions in the Timer table.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P3,
      sectionId: sections["Backlog"].id,
      position: 3,
      dueDate: daysFromNow(15),
      labelNames: ["Feature"],
    },
    {
      id: "task-009",
      title: "Design and implement Public REST API v1",
      description:
        "Build public REST API with full CRUD for tasks, projects, and labels. Include OpenAPI/Swagger docs.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P2,
      sectionId: sections["Backlog"].id,
      position: 4,
      dueDate: daysFromNow(20),
      labelNames: ["Backend", "Feature"],
    },
    {
      id: "task-010",
      title: "Set up webhook delivery system",
      description:
        "Implement webhook event dispatching with retry logic and exponential backoff. Store delivery logs in WebhookDelivery.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P2,
      sectionId: sections["Backlog"].id,
      position: 5,
      dueDate: daysFromNow(22),
      labelNames: ["Backend", "Feature"],
    },
    {
      id: "task-011",
      title: "Fix task reorder race condition",
      description:
        "When two users reorder tasks simultaneously, positions can conflict. Implement optimistic locking or server-side ordering.",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.P1,
      sectionId: sections["In Review"].id,
      assigneeId: user.id,
      position: 1,
      dueDate: daysFromNow(1),
      labelNames: ["Bug", "Backend"],
    },
    {
      id: "task-012",
      title: "Write API documentation",
      description: "Document all public API endpoints with request/response examples using OpenAPI 3.1.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P4,
      sectionId: sections["Backlog"].id,
      position: 6,
      dueDate: daysFromNow(25),
      labelNames: ["Docs"],
    },
    {
      id: "task-013",
      title: "Add dark mode support to all components",
      description: "Ensure every component respects the dark/light theme toggle using CSS variables.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.P2,
      sectionId: sections["In Sprint"].id,
      assigneeId: teamUser.id,
      position: 4,
      dueDate: daysFromNow(4),
      labelNames: ["Frontend", "Design"],
    },
    {
      id: "task-014",
      title: "Implement command palette (Ctrl+K)",
      description: "Build global command palette using cmdk library. Support quick task creation, navigation, and search.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P2,
      sectionId: sections["Backlog"].id,
      position: 7,
      dueDate: daysFromNow(8),
      labelNames: ["Frontend", "Feature"],
    },
    {
      id: "task-015",
      title: "Set up recurring task engine with rrule",
      description: "Parse and generate recurring task instances from rrule patterns. Support daily, weekly, monthly, and custom recurrence.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P3,
      sectionId: sections["Backlog"].id,
      position: 8,
      dueDate: daysFromNow(18),
      labelNames: ["Backend", "Feature"],
    },
    {
      id: "task-016",
      title: "Natural language date parsing",
      description: "Integrate chrono-node for parsing inputs like 'tomorrow 3pm' and 'next friday' into ISO dates.",
      status: TaskStatus.DONE,
      priority: TaskPriority.P2,
      sectionId: sections["Done"].id,
      position: 3,
      dueDate: daysFromNow(-2),
      completedAt: daysFromNow(-1),
      labelNames: ["Frontend", "Feature"],
    },
    {
      id: "task-017",
      title: "Build My Day view",
      description: "Create a daily focus view inspired by Microsoft To Do. Allow users to pick tasks for today with AI-suggested prioritization.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P2,
      sectionId: sections["Backlog"].id,
      position: 9,
      dueDate: daysFromNow(14),
      labelNames: ["Frontend", "Feature"],
    },
    {
      id: "task-018",
      title: "Add keyboard shortcuts (j/k/x/e/d/n)",
      description: "Implement vim-style navigation and action shortcuts for power users.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P3,
      sectionId: sections["Backlog"].id,
      position: 10,
      dueDate: daysFromNow(16),
      labelNames: ["Frontend"],
    },
    {
      id: "task-019",
      title: "Fix mobile responsive layout",
      description: "Sidebar should collapse to hamburger menu on mobile. Task cards need touch-friendly hit targets.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P3,
      sectionId: sections["Backlog"].id,
      position: 11,
      dueDate: daysFromNow(20),
      labelNames: ["Bug", "Frontend"],
    },
    {
      id: "task-020",
      title: "Implement task dependencies (blocked-by/blocks)",
      description: "Allow linking tasks with dependency relationships. Prevent completing blocked tasks.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P3,
      sectionId: sections["Backlog"].id,
      position: 12,
      dueDate: daysFromNow(22),
      labelNames: ["Backend", "Feature"],
    },
    {
      id: "task-021",
      title: "Performance audit and optimization",
      description: "Profile React renders, optimize Prisma queries, add proper indexes. Target < 200ms API response.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P4,
      sectionId: sections["Backlog"].id,
      position: 13,
      dueDate: daysFromNow(28),
      labelNames: ["Nice-to-have"],
    },
    {
      id: "task-022",
      title: "Add activity log to task detail panel",
      description: "Show a timeline of all changes made to a task: status changes, assignee changes, comments, etc.",
      status: TaskStatus.TODO,
      priority: TaskPriority.P3,
      sectionId: sections["Backlog"].id,
      position: 14,
      dueDate: daysFromNow(17),
      labelNames: ["Frontend", "Feature"],
    },
  ];

  const createdTasks: Record<string, { id: string }> = {};

  for (const def of taskDefs) {
    const { labelNames, ...taskData } = def;
    const task = await prisma.task.upsert({
      where: { id: def.id },
      update: {},
      create: {
        ...taskData,
        projectId: project.id,
        creatorId: user.id,
      },
    });
    createdTasks[def.id] = task;

    // Attach labels
    for (const labelName of labelNames) {
      const label = labels[labelName];
      if (label) {
        await prisma.taskLabel.upsert({
          where: { taskId_labelId: { taskId: task.id, labelId: label.id } },
          update: {},
          create: { taskId: task.id, labelId: label.id },
        });
      }
    }
  }

  console.log(`  ✓ Tasks: ${taskDefs.length} created`);

  // ── Subtasks ───────────────────────────────────────────────
  const subtaskDefs = [
    {
      id: "task-003-a",
      title: "Configure Google OAuth provider",
      status: TaskStatus.DONE,
      priority: TaskPriority.P1,
      parentId: "task-003",
      creatorId: user.id,
      position: 1,
      completedAt: daysFromNow(-1),
    },
    {
      id: "task-003-b",
      title: "Configure GitHub OAuth provider",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.P1,
      parentId: "task-003",
      creatorId: user.id,
      position: 2,
    },
    {
      id: "task-003-c",
      title: "Implement email/password sign-in with bcrypt",
      status: TaskStatus.TODO,
      priority: TaskPriority.P2,
      parentId: "task-003",
      creatorId: user.id,
      position: 3,
    },
    {
      id: "task-004-a",
      title: "Create task.create tRPC procedure",
      status: TaskStatus.DONE,
      priority: TaskPriority.P1,
      parentId: "task-004",
      creatorId: teamUser.id,
      position: 1,
      completedAt: daysFromNow(-1),
    },
    {
      id: "task-004-b",
      title: "Create task.list with filters tRPC procedure",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.P1,
      parentId: "task-004",
      creatorId: teamUser.id,
      position: 2,
    },
    {
      id: "task-004-c",
      title: "Create task.update and task.delete procedures",
      status: TaskStatus.TODO,
      priority: TaskPriority.P2,
      parentId: "task-004",
      creatorId: teamUser.id,
      position: 3,
    },
  ];

  for (const def of subtaskDefs) {
    await prisma.task.upsert({
      where: { id: def.id },
      update: {},
      create: {
        ...def,
        projectId: project.id,
        sectionId: createdTasks[def.parentId]
          ? (
              await prisma.task.findUnique({
                where: { id: def.parentId },
                select: { sectionId: true },
              })
            )?.sectionId ?? null
          : null,
      },
    });
  }

  console.log(`  ✓ Subtasks: ${subtaskDefs.length} created`);

  // ── Comments ───────────────────────────────────────────────
  await prisma.comment.upsert({
    where: { id: "comment-001" },
    update: {},
    create: {
      id: "comment-001",
      taskId: "task-003",
      userId: user.id,
      content:
        "Google OAuth is working in dev. Need to add the production redirect URI in Google Cloud Console before we ship.",
    },
  });

  await prisma.comment.upsert({
    where: { id: "comment-002" },
    update: {},
    create: {
      id: "comment-002",
      taskId: "task-003",
      userId: teamUser.id,
      content: "On it! Will add the redirect URI and test the full auth flow end-to-end.",
    },
  });

  await prisma.comment.upsert({
    where: { id: "comment-003" },
    update: {},
    create: {
      id: "comment-003",
      taskId: "task-011",
      userId: user.id,
      content:
        "Reproduced the race condition locally. Proposing we use a fractional indexing strategy (e.g. like Linear does) instead of sequential integers.",
    },
  });

  console.log("  ✓ Comments: 3 created");

  // ── Task Dependencies ────────────────────────────────────────
  const depDefs = [
    { blockingId: "task-003", blockedId: "task-004" }, // Auth blocks Task API
    { blockingId: "task-004", blockedId: "task-009" }, // Task API blocks Public API
    { blockingId: "task-005", blockedId: "task-006" }, // List view blocks Kanban
  ];

  for (const dep of depDefs) {
    await prisma.taskDependency.upsert({
      where: {
        blockingId_blockedId: {
          blockingId: dep.blockingId,
          blockedId: dep.blockedId,
        },
      },
      update: {},
      create: dep,
    });
  }

  console.log(`  ✓ Dependencies: ${depDefs.length} created`);

  // ── Activity ───────────────────────────────────────────────
  await prisma.activity.createMany({
    data: [
      {
        type: "PROJECT_CREATED",
        userId: user.id,
        workspaceId: workspace.id,
        projectId: project.id,
        meta: { name: project.name },
      },
      {
        type: "TASK_CREATED",
        userId: user.id,
        workspaceId: workspace.id,
        projectId: project.id,
        taskId: "task-003",
        meta: { title: "Implement NextAuth.js authentication" },
      },
      {
        type: "STATUS_CHANGED",
        userId: user.id,
        workspaceId: workspace.id,
        projectId: project.id,
        taskId: "task-001",
        meta: { from: "IN_PROGRESS", to: "DONE" },
      },
      {
        type: "MEMBER_ADDED",
        userId: user.id,
        workspaceId: workspace.id,
        meta: { memberEmail: teamUser.email, role: "MEMBER" },
      },
    ],
    skipDuplicates: true,
  });

  console.log("  ✓ Activities: 4 created");

  // ── Webhook (demo) ─────────────────────────────────────────
  await prisma.webhook.upsert({
    where: { id: "webhook-001" },
    update: {},
    create: {
      id: "webhook-001",
      workspaceId: workspace.id,
      name: "Slack Notifications",
      url: "https://hooks.slack.com/services/DEMO/DEMO/DEMO",
      events: ["TASK_CREATED", "TASK_COMPLETED", "COMMENT_ADDED"],
      isActive: false, // disabled in demo
    },
  });

  console.log("  ✓ Webhook: demo Slack webhook created (inactive)");

  console.log("\n✅ Seed complete!");
  console.log(`\n   Workspace : ${workspace.name} (${workspace.slug})`);
  console.log(`   Project   : ${project.name}`);
  console.log(`   Users     : demo@karyadhara.dev, priya@karyadhara.dev`);
  console.log(`   Tasks     : ${taskDefs.length} tasks, ${subtaskDefs.length} subtasks`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
