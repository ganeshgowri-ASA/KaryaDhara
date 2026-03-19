import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const userId = session.user.id;
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  try {
    const [
      totalTasks,
      completedTasks,
      overdueTasks,
      upcomingTasks,
      inProgressTasks,
      tasksByPriorityRaw,
      tasksByStatusRaw,
      recentActivity,
      completedRecently,
      createdRecently,
    ] = await Promise.all([
      prisma.task.count({
        where: { creatorId: userId, isArchived: false },
      }),
      prisma.task.count({
        where: { creatorId: userId, status: "DONE" },
      }),
      prisma.task.count({
        where: {
          creatorId: userId,
          status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
          dueDate: { lt: now },
          isArchived: false,
        },
      }),
      prisma.task.count({
        where: {
          creatorId: userId,
          status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
          dueDate: { gte: now, lte: sevenDaysFromNow },
          isArchived: false,
        },
      }),
      prisma.task.count({
        where: { creatorId: userId, status: "IN_PROGRESS", isArchived: false },
      }),
      prisma.task.groupBy({
        by: ["priority"],
        where: { creatorId: userId, isArchived: false },
        _count: true,
      }),
      prisma.task.groupBy({
        by: ["status"],
        where: { creatorId: userId, isArchived: false },
        _count: true,
      }),
      prisma.activity.findMany({
        where: { userId },
        include: { task: { select: { id: true, title: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.task.findMany({
        where: {
          creatorId: userId,
          completedAt: { gte: thirtyDaysAgo },
        },
        select: { completedAt: true },
      }),
      prisma.task.findMany({
        where: {
          creatorId: userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true },
      }),
    ]);

    // Build priority and status maps
    const tasksByPriority: Record<string, number> = {};
    for (const row of tasksByPriorityRaw) {
      tasksByPriority[row.priority] = row._count;
    }

    const tasksByStatus: Record<string, number> = {};
    for (const row of tasksByStatusRaw) {
      tasksByStatus[row.status] = row._count;
    }

    // Build 30-day completion trend
    const completionTrend: { date: string; completed: number; created: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const completed = completedRecently.filter(
        (t) => t.completedAt?.toISOString().split("T")[0] === dateStr
      ).length;

      const created = createdRecently.filter(
        (t) => t.createdAt.toISOString().split("T")[0] === dateStr
      ).length;

      completionTrend.push({ date: dateStr, completed, created });
    }

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return NextResponse.json({
      totalTasks,
      completedTasks,
      overdueTasks,
      upcomingTasks,
      inProgressTasks,
      completionRate,
      tasksByPriority,
      tasksByStatus,
      completionTrend,
      recentActivity,
    });
  } catch {
    return errorResponse("Failed to fetch dashboard stats", 500);
  }
}
