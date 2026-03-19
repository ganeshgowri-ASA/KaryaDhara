import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  errorResponse,
  successResponse,
} from "@/lib/api-helpers";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  try {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const baseWhere = { creatorId: user.id, isArchived: false };

    const [
      totalTasks,
      completedTasks,
      overdueTasks,
      upcomingTasks,
      inProgressTasks,
      tasksCompletedThisWeek,
      tasksCreatedThisWeek,
      completedWithTime,
      overdueTasksList,
      upcomingTasksList,
      trendsData,
    ] = await Promise.all([
      prisma.task.count({ where: baseWhere }),
      prisma.task.count({ where: { ...baseWhere, status: "DONE" } }),
      prisma.task.count({
        where: {
          ...baseWhere,
          status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
          dueDate: { lt: now },
        },
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
          dueDate: { gte: now, lte: weekFromNow },
        },
      }),
      prisma.task.count({
        where: { ...baseWhere, status: "IN_PROGRESS" },
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          status: "DONE",
          completedAt: { gte: weekAgo },
        },
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.task.findMany({
        where: {
          ...baseWhere,
          status: "DONE",
          completedAt: { not: null },
        },
        select: { createdAt: true, completedAt: true },
        take: 100,
        orderBy: { completedAt: "desc" },
      }),
      prisma.task.findMany({
        where: {
          ...baseWhere,
          status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
          dueDate: { lt: now },
        },
        select: { id: true, title: true, priority: true, dueDate: true },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.task.findMany({
        where: {
          ...baseWhere,
          status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
          dueDate: { gte: now, lte: weekFromNow },
        },
        select: { id: true, title: true, priority: true, dueDate: true },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.task.findMany({
        where: {
          ...baseWhere,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true, completedAt: true, status: true },
      }),
    ]);

    // Compute average completion time
    let avgCompletionTimeHours = 0;
    if (completedWithTime.length > 0) {
      const totalHours = completedWithTime.reduce((sum, t) => {
        if (!t.completedAt) return sum;
        const diff =
          t.completedAt.getTime() - t.createdAt.getTime();
        return sum + diff / (1000 * 60 * 60);
      }, 0);
      avgCompletionTimeHours = Math.round(
        (totalHours / completedWithTime.length) * 10
      ) / 10;
    }

    const completionRate =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    // Build completion trends (last 30 days)
    const trendMap = new Map<string, { completed: number; created: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      trendMap.set(key, { completed: 0, created: 0 });
    }
    trendsData.forEach((t) => {
      const createdKey = t.createdAt.toISOString().split("T")[0];
      const entry = trendMap.get(createdKey);
      if (entry) entry.created++;
      if (t.completedAt) {
        const completedKey = t.completedAt.toISOString().split("T")[0];
        const cEntry = trendMap.get(completedKey);
        if (cEntry) cEntry.completed++;
      }
    });

    const completionTrends = Array.from(trendMap.entries()).map(
      ([date, counts]) => ({
        date,
        ...counts,
      })
    );

    const overdueTasksMapped = overdueTasksList.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate!.toISOString(),
      daysOverdue: Math.ceil(
        (now.getTime() - t.dueDate!.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

    const upcomingTasksMapped = upcomingTasksList.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate!.toISOString(),
      daysUntilDue: Math.ceil(
        (t.dueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

    return successResponse({
      metrics: {
        totalTasks,
        completedTasks,
        overdueTasks,
        upcomingTasks,
        inProgressTasks,
        completionRate,
        avgCompletionTimeHours,
        tasksCompletedThisWeek,
        tasksCreatedThisWeek,
      },
      completionTrends,
      overdueTasks: overdueTasksMapped,
      upcomingTasks: upcomingTasksMapped,
    });
  } catch (err) {
    return errorResponse(
      "Failed to fetch dashboard data",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
