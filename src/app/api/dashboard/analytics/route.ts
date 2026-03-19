import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse, jsonResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const days = parseInt(searchParams.get("days") || "30", 10);
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const userId = session.user.id;
  const userTaskFilter = {
    OR: [{ assigneeId: userId }, { creatorId: userId }],
  };

  const [
    totalTasks,
    completedTasks,
    overdueTasks,
    tasksByStatus,
    tasksByPriority,
    recentCompletions,
    upcomingTasks,
  ] = await Promise.all([
    // Total tasks
    prisma.task.count({ where: userTaskFilter }),

    // Completed in period
    prisma.task.count({
      where: {
        ...userTaskFilter,
        status: "DONE",
        completedAt: { gte: startDate },
      },
    }),

    // Overdue
    prisma.task.count({
      where: {
        ...userTaskFilter,
        status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
        dueDate: { lt: now },
      },
    }),

    // Tasks by status
    prisma.task.groupBy({
      by: ["status"],
      where: userTaskFilter,
      _count: { _all: true },
    }),

    // Tasks by priority
    prisma.task.groupBy({
      by: ["priority"],
      where: userTaskFilter,
      _count: { _all: true },
    }),

    // Completion trend (tasks completed per day in period)
    prisma.task.findMany({
      where: {
        ...userTaskFilter,
        status: "DONE",
        completedAt: { gte: startDate },
      },
      select: { completedAt: true },
      orderBy: { completedAt: "asc" },
    }),

    // Upcoming tasks (next 7 days)
    prisma.task.findMany({
      where: {
        ...userTaskFilter,
        status: { notIn: ["DONE", "CANCELLED", "ARCHIVED"] },
        dueDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        priority: true,
        status: true,
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
  ]);

  // Build completion trend data (completions per day)
  const trendMap: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    trendMap[d.toISOString().split("T")[0]] = 0;
  }
  for (const t of recentCompletions) {
    if (t.completedAt) {
      const key = t.completedAt.toISOString().split("T")[0];
      if (key in trendMap) trendMap[key]++;
    }
  }

  const completionTrend = Object.entries(trendMap).map(([date, count]) => ({
    date,
    completed: count,
  }));

  // Productivity score: completions / total active * 100
  const activeTasks = totalTasks - completedTasks;
  const productivityScore =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Status distribution
  const statusDistribution = tasksByStatus.map((s) => ({
    status: s.status,
    count: s._count._all,
  }));

  // Priority distribution
  const priorityDistribution = tasksByPriority.map((p) => ({
    priority: p.priority,
    count: p._count._all,
  }));

  return jsonResponse({
    summary: {
      totalTasks,
      completedTasks,
      activeTasks,
      overdueTasks,
      productivityScore,
    },
    completionTrend,
    statusDistribution,
    priorityDistribution,
    upcomingTasks,
  });
}
