import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/seed - Create sample data for demo
// DELETE /api/seed - Clear all sample data (admin only)
export async function POST() {
  try {
    // Find or create the test user
    let user = await prisma.user.findFirst({ where: { email: "test@karyadhara.app" } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Test User",
          email: "test@karyadhara.app",
          role: "OWNER",
          timezone: "Asia/Kolkata",
        },
      });
    }

    // Create workspace
    let workspace = await prisma.workspace.findFirst({ where: { slug: "karyadhara-demo" } });
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "KaryaDhara Demo",
          slug: "karyadhara-demo",
          description: "Sample workspace for demonstration",
          ownerId: user.id,
          members: { create: { userId: user.id, role: "OWNER" } },
        },
      });
    }

    // Create labels
    const labelData = [
      { name: "Bug", color: "#ef4444" },
      { name: "Feature", color: "#3b82f6" },
      { name: "Enhancement", color: "#8b5cf6" },
      { name: "Documentation", color: "#06b6d4" },
      { name: "Urgent", color: "#f59e0b" },
      { name: "Design", color: "#ec4899" },
    ];
    const labels: Record<string, string> = {};
    for (const ld of labelData) {
      const label = await prisma.label.upsert({
        where: { workspaceId_name: { workspaceId: workspace.id, name: ld.name } },
        update: {},
        create: { workspaceId: workspace.id, name: ld.name, color: ld.color },
      });
      labels[ld.name] = label.id;
    }

    // Create projects
    const projects = [
      {
        name: "Website Redesign",
        description: "Complete overhaul of the company website with modern UI/UX",
        color: "#6366f1",
        icon: "globe",
      },
      {
        name: "Mobile App v2",
        description: "React Native mobile app - second major release",
        color: "#10b981",
        icon: "smartphone",
      },
      {
        name: "API Infrastructure",
        description: "Backend API improvements and new endpoints",
        color: "#f59e0b",
        icon: "server",
      },
    ];

    const projectIds: string[] = [];
    for (const p of projects) {
      const proj = await prisma.project.create({
        data: {
          workspaceId: workspace.id,
          name: p.name,
          description: p.description,
          color: p.color,
          icon: p.icon,
          status: "ACTIVE",
        },
      });
      projectIds.push(proj.id);
    }

    // Create tasks with various statuses, priorities, and dates
    const now = new Date();
    const tasks = [
      // Website Redesign tasks
      { title: "Design homepage mockup", status: "DONE", priority: "P1", projectIdx: 0, dueOffset: -5, labelNames: ["Design", "Feature"], desc: "Create Figma mockups for the new homepage layout" },
      { title: "Implement responsive navbar", status: "DONE", priority: "P2", projectIdx: 0, dueOffset: -3, labelNames: ["Feature"], desc: "Build mobile-friendly navigation component" },
      { title: "Create contact form", status: "IN_PROGRESS", priority: "P2", projectIdx: 0, dueOffset: 2, labelNames: ["Feature"], desc: "Build contact form with validation and email sending" },
      { title: "Optimize page load speed", status: "IN_PROGRESS", priority: "P1", projectIdx: 0, dueOffset: 3, labelNames: ["Enhancement", "Urgent"], desc: "Reduce bundle size and optimize images" },
      { title: "SEO meta tags setup", status: "TODO", priority: "P3", projectIdx: 0, dueOffset: 5, labelNames: ["Enhancement"], desc: "Add proper meta tags for all pages" },
      { title: "Dark mode support", status: "TODO", priority: "P3", projectIdx: 0, dueOffset: 7, labelNames: ["Feature", "Design"], desc: "Implement dark mode toggle across all components" },
      { title: "Fix footer links", status: "IN_REVIEW", priority: "P4", projectIdx: 0, dueOffset: 1, labelNames: ["Bug"], desc: "Several footer links are broken" },

      // Mobile App tasks
      { title: "Setup CI/CD pipeline", status: "DONE", priority: "P1", projectIdx: 1, dueOffset: -7, labelNames: ["Enhancement"], desc: "Configure GitHub Actions for automated builds" },
      { title: "Push notifications", status: "IN_PROGRESS", priority: "P1", projectIdx: 1, dueOffset: 1, labelNames: ["Feature", "Urgent"], desc: "Implement push notification service with Firebase" },
      { title: "User authentication flow", status: "DONE", priority: "P1", projectIdx: 1, dueOffset: -4, labelNames: ["Feature"], desc: "OAuth2 login with Google and Apple" },
      { title: "Offline mode support", status: "TODO", priority: "P2", projectIdx: 1, dueOffset: 10, labelNames: ["Feature"], desc: "Enable offline data access with sync" },
      { title: "App store screenshots", status: "TODO", priority: "P3", projectIdx: 1, dueOffset: 14, labelNames: ["Design", "Documentation"], desc: "Create screenshots for app store listing" },
      { title: "Fix crash on Android 12", status: "IN_PROGRESS", priority: "P1", projectIdx: 1, dueOffset: 0, labelNames: ["Bug", "Urgent"], desc: "App crashes when opening camera on Android 12 devices" },

      // API Infrastructure tasks
      { title: "Rate limiting middleware", status: "DONE", priority: "P2", projectIdx: 2, dueOffset: -6, labelNames: ["Enhancement"], desc: "Add Redis-based rate limiting" },
      { title: "GraphQL endpoint", status: "IN_PROGRESS", priority: "P2", projectIdx: 2, dueOffset: 4, labelNames: ["Feature"], desc: "Create GraphQL API alongside REST" },
      { title: "Database migration tool", status: "TODO", priority: "P3", projectIdx: 2, dueOffset: 8, labelNames: ["Enhancement"], desc: "Automated DB migration scripts" },
      { title: "API documentation", status: "IN_REVIEW", priority: "P3", projectIdx: 2, dueOffset: 2, labelNames: ["Documentation"], desc: "Swagger/OpenAPI docs for all endpoints" },
      { title: "Fix memory leak in worker", status: "IN_PROGRESS", priority: "P1", projectIdx: 2, dueOffset: 0, labelNames: ["Bug", "Urgent"], desc: "Background worker consuming too much memory" },
      { title: "Add caching layer", status: "TODO", priority: "P2", projectIdx: 2, dueOffset: 6, labelNames: ["Enhancement"], desc: "Redis caching for frequently accessed endpoints" },

      // Inbox tasks (no project)
      { title: "Team standup notes", status: "TODO", priority: "P3", projectIdx: -1, dueOffset: 0, labelNames: [], desc: "Prepare notes for daily standup" },
      { title: "Review PR #42", status: "TODO", priority: "P2", projectIdx: -1, dueOffset: 1, labelNames: [], desc: "Code review for authentication module" },
    ];

    const createdTaskIds: string[] = [];
    for (const t of tasks) {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + t.dueOffset);
      const completedAt = t.status === "DONE" ? new Date(dueDate.getTime() - 86400000) : undefined;

      const task = await prisma.task.create({
        data: {
          title: t.title,
          description: t.desc,
          status: t.status as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
          priority: t.priority as "P1" | "P2" | "P3" | "P4",
          projectId: t.projectIdx >= 0 ? projectIds[t.projectIdx] : undefined,
          creatorId: user.id,
          assigneeId: user.id,
          dueDate,
          completedAt,
          labels: {
            create: t.labelNames
              .filter((name) => labels[name])
              .map((name) => ({ labelId: labels[name] })),
          },
        },
      });
      createdTaskIds.push(task.id);
    }

    // Add some comments
    const commentData = [
      { taskIdx: 0, content: "Mockup approved by the design team!" },
      { taskIdx: 2, content: "Need to add CAPTCHA for spam prevention" },
      { taskIdx: 3, content: "Current lighthouse score is 62, target is 90+" },
      { taskIdx: 8, content: "Firebase setup done, testing on iOS next" },
      { taskIdx: 12, content: "Tested on Pixel 6, crash is reproducible" },
      { taskIdx: 17, content: "Memory usage jumps from 200MB to 2GB after 6 hours" },
    ];
    for (const c of commentData) {
      await prisma.comment.create({
        data: { taskId: createdTaskIds[c.taskIdx], userId: user.id, content: c.content },
      });
    }

    // Add checklist items to some tasks
    const checklistData = [
      { taskIdx: 2, items: ["Form validation", "Email sending", "Success message", "Error handling"] },
      { taskIdx: 3, items: ["Compress images", "Lazy load components", "Minify CSS", "Tree shake JS", "Enable gzip"] },
      { taskIdx: 8, items: ["Firebase setup", "iOS config", "Android config", "Test on devices"] },
    ];
    for (const cl of checklistData) {
      for (let i = 0; i < cl.items.length; i++) {
        await prisma.checklistItem.create({
          data: {
            taskId: createdTaskIds[cl.taskIdx],
            title: cl.items[i],
            position: i,
            completed: i < Math.floor(cl.items.length / 2),
          },
        });
      }
    }

    // Add notifications
    const notifData = [
      { type: "DUE_REMINDER", title: "Task due soon", message: "\"Optimize page load speed\" is due in 3 days", taskIdx: 3 },
      { type: "TASK_COMPLETED", title: "Task completed", message: "\"Design homepage mockup\" has been completed", taskIdx: 0 },
      { type: "OVERDUE_ALERT", title: "Task overdue!", message: "\"Fix crash on Android 12\" is overdue", taskIdx: 12 },
      { type: "COMMENT_ADDED", title: "New comment", message: "New comment on \"Push notifications\"", taskIdx: 8 },
    ];
    for (const n of notifData) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: n.type as "DUE_REMINDER" | "TASK_COMPLETED" | "OVERDUE_ALERT" | "COMMENT_ADDED",
          title: n.title,
          message: n.message,
          taskId: createdTaskIds[n.taskIdx],
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Sample data created successfully!",
      counts: {
        projects: projects.length,
        tasks: tasks.length,
        labels: labelData.length,
        comments: commentData.length,
        notifications: notifData.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed data", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/seed - Clear all sample data with reason
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const reason = (body as Record<string, string>).reason || "No reason provided";

    if (!reason || reason.length < 5) {
      return NextResponse.json(
        { error: "Please provide a reason with at least 5 characters for clearing data" },
        { status: 400 }
      );
    }

    // Delete in proper order to respect foreign keys
    await prisma.checklistItem.deleteMany({});
    await prisma.attachment.deleteMany({});
    await prisma.taskAssignee.deleteMany({});
    await prisma.timeEntry.deleteMany({});
    await prisma.timer.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.taskLabel.deleteMany({});
    await prisma.taskDependency.deleteMany({});
    await prisma.activity.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.label.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.webhookDelivery.deleteMany({});
    await prisma.webhook.deleteMany({});
    await prisma.integration.deleteMany({});
    await prisma.apiKey.deleteMany({});
    await prisma.workspaceMember.deleteMany({});
    await prisma.workspace.deleteMany({});

    console.log(`[ADMIN] Data cleared. Reason: ${reason}`);

    return NextResponse.json({
      success: true,
      message: "All sample data has been cleared",
      reason,
      clearedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Clear error:", error);
    return NextResponse.json(
      { error: "Failed to clear data", details: String(error) },
      { status: 500 }
    );
  }
}
