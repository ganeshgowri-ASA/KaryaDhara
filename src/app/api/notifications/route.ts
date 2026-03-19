import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, parsePagination, paginatedResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const url = new URL(request.url);
  const pagination = parsePagination(url);
  const unreadOnly = url.searchParams.get("unreadOnly") === "true";

  try {
    const where = {
      userId: session.user.id,
      ...(unreadOnly && { isRead: false }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          task: { select: { id: true, title: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return paginatedResponse(notifications, total, pagination);
  } catch {
    return errorResponse("Failed to fetch notifications", 500);
  }
}

// Generate due-date reminders and overdue alerts
export async function POST() {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    // Find tasks due soon
    const dueSoonTasks = await prisma.task.findMany({
      where: {
        assigneeId: session.user.id,
        status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
        dueDate: { lte: tomorrow, gte: now },
      },
      select: { id: true, title: true, dueDate: true },
    });

    // Find overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        assigneeId: session.user.id,
        status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
        dueDate: { lt: now },
      },
      select: { id: true, title: true, dueDate: true },
    });

    const notifications = [];

    for (const task of dueSoonTasks) {
      // Check if notification already exists for this task today
      const existing = await prisma.notification.findFirst({
        where: {
          userId: session.user.id,
          taskId: task.id,
          type: "DUE_REMINDER",
          createdAt: { gte: new Date(now.toISOString().split("T")[0]) },
        },
      });
      if (!existing) {
        notifications.push({
          userId: session.user.id,
          type: "DUE_REMINDER" as const,
          title: "Due Soon",
          message: `"${task.title}" is due ${task.dueDate?.toLocaleDateString()}`,
          taskId: task.id,
        });
      }
    }

    for (const task of overdueTasks) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: session.user.id,
          taskId: task.id,
          type: "OVERDUE_ALERT",
          createdAt: { gte: new Date(now.toISOString().split("T")[0]) },
        },
      });
      if (!existing) {
        notifications.push({
          userId: session.user.id,
          type: "OVERDUE_ALERT" as const,
          title: "Overdue Task",
          message: `"${task.title}" is overdue`,
          taskId: task.id,
        });
      }
    }

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    return NextResponse.json({ created: notifications.length });
  } catch {
    return errorResponse("Failed to generate notifications", 500);
  }
}
