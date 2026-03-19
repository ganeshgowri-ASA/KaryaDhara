import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  errorResponse,
  parsePagination,
  paginatedResponse,
} from "@/lib/api-utils";

interface Notification {
  id: string;
  type: "due_reminder" | "overdue" | "assigned" | "completed" | "comment";
  title: string;
  message: string;
  taskId?: string;
  taskTitle?: string;
  read: boolean;
  createdAt: string;
}

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const { page, limit } = parsePagination(searchParams);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  // Fetch tasks to generate notifications from
  const [overdueTasks, dueSoonTasks, recentActivities] = await Promise.all([
    prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: session.user.id },
          { creatorId: session.user.id },
        ],
        status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
        dueDate: { lt: now },
      },
      select: { id: true, title: true, dueDate: true, priority: true },
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
    prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: session.user.id },
          { creatorId: session.user.id },
        ],
        status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
        dueDate: { gte: now, lte: tomorrow },
      },
      select: { id: true, title: true, dueDate: true, priority: true },
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
    prisma.activity.findMany({
      where: {
        userId: { not: session.user.id },
        task: {
          OR: [
            { assigneeId: session.user.id },
            { creatorId: session.user.id },
          ],
        },
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        user: { select: { name: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const notifications: Notification[] = [];

  // Overdue alerts
  for (const task of overdueTasks) {
    notifications.push({
      id: `overdue-${task.id}`,
      type: "overdue",
      title: "Task Overdue",
      message: `"${task.title}" was due ${task.dueDate?.toLocaleDateString()}`,
      taskId: task.id,
      taskTitle: task.title,
      read: false,
      createdAt: (task.dueDate || now).toISOString(),
    });
  }

  // Due soon reminders
  for (const task of dueSoonTasks) {
    notifications.push({
      id: `due-${task.id}`,
      type: "due_reminder",
      title: "Due Soon",
      message: `"${task.title}" is due ${task.dueDate?.toLocaleDateString()}`,
      taskId: task.id,
      taskTitle: task.title,
      read: false,
      createdAt: now.toISOString(),
    });
  }

  // Activity-based notifications
  for (const activity of recentActivities) {
    const actorName = activity.user.name || "Someone";
    let message = "";

    switch (activity.type) {
      case "TASK_COMPLETED":
        message = `${actorName} completed "${activity.task?.title}"`;
        break;
      case "TASK_ASSIGNED":
        message = `${actorName} assigned you to "${activity.task?.title}"`;
        break;
      case "COMMENT_ADDED":
        message = `${actorName} commented on "${activity.task?.title}"`;
        break;
      case "STATUS_CHANGED":
        message = `${actorName} updated status of "${activity.task?.title}"`;
        break;
      default:
        message = `${actorName} updated "${activity.task?.title}"`;
    }

    notifications.push({
      id: `activity-${activity.id}`,
      type:
        activity.type === "TASK_ASSIGNED"
          ? "assigned"
          : activity.type === "TASK_COMPLETED"
            ? "completed"
            : activity.type === "COMMENT_ADDED"
              ? "comment"
              : "due_reminder",
      title: activity.type.replace(/_/g, " ").toLowerCase(),
      message,
      taskId: activity.task?.id,
      taskTitle: activity.task?.title,
      read: false,
      createdAt: activity.createdAt.toISOString(),
    });
  }

  // Sort by date, newest first
  notifications.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const total = notifications.length;
  const start = (page - 1) * limit;
  const paginated = notifications.slice(start, start + limit);

  return paginatedResponse(paginated, total, page, limit);
}
