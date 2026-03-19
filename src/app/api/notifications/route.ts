import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  errorResponse,
  successResponse,
} from "@/lib/api-helpers";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  taskId?: string;
  isRead: boolean;
  createdAt: string;
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const [overdueTasks, upcomingTasks, recentActivities] = await Promise.all([
      prisma.task.findMany({
        where: {
          creatorId: user.id,
          status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
          dueDate: { lt: now },
          isArchived: false,
        },
        select: { id: true, title: true, dueDate: true, priority: true },
        orderBy: { dueDate: "asc" },
        take: 20,
      }),
      prisma.task.findMany({
        where: {
          creatorId: user.id,
          status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
          dueDate: { gte: now, lte: tomorrow },
          isArchived: false,
        },
        select: { id: true, title: true, dueDate: true, priority: true },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.activity.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          task: { select: { id: true, title: true } },
        },
      }),
    ]);

    const notifications: NotificationItem[] = [];

    overdueTasks.forEach((task) => {
      const daysOverdue = Math.ceil(
        (now.getTime() - (task.dueDate?.getTime() || 0)) / (1000 * 60 * 60 * 24)
      );
      notifications.push({
        id: `overdue-${task.id}`,
        type: "overdue_alert",
        title: "Task Overdue",
        message: `"${task.title}" is ${daysOverdue} day(s) overdue`,
        taskId: task.id,
        isRead: false,
        createdAt: (task.dueDate || now).toISOString(),
      });
    });

    upcomingTasks.forEach((task) => {
      const hoursUntil = Math.ceil(
        ((task.dueDate?.getTime() || 0) - now.getTime()) / (1000 * 60 * 60)
      );
      notifications.push({
        id: `due-${task.id}`,
        type: "due_reminder",
        title: "Due Soon",
        message: `"${task.title}" is due in ${hoursUntil} hour(s)`,
        taskId: task.id,
        isRead: false,
        createdAt: now.toISOString(),
      });
    });

    recentActivities.forEach((activity) => {
      const typeMap: Record<string, { type: string; title: string }> = {
        TASK_COMPLETED: { type: "task_completed", title: "Task Completed" },
        TASK_ASSIGNED: { type: "task_assigned", title: "Task Assigned" },
        COMMENT_ADDED: { type: "comment_added", title: "New Comment" },
        STATUS_CHANGED: { type: "status_changed", title: "Status Changed" },
      };
      const mapped = typeMap[activity.type];
      if (mapped) {
        notifications.push({
          id: activity.id,
          type: mapped.type,
          title: mapped.title,
          message: activity.task?.title || "Task activity",
          taskId: activity.taskId || undefined,
          isRead: true,
          createdAt: activity.createdAt.toISOString(),
        });
      }
    });

    notifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return successResponse({ data: notifications });
  } catch (err) {
    return errorResponse(
      "Failed to fetch notifications",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
