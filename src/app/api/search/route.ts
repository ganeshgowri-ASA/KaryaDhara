import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  errorResponse,
  successResponse,
} from "@/lib/api-helpers";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const url = req.nextUrl;
  const q = url.searchParams.get("q");
  if (!q?.trim()) return errorResponse("Search query 'q' is required");

  const query = q.trim();
  const priority = url.searchParams.get("priority");
  const status = url.searchParams.get("status");
  const projectId = url.searchParams.get("projectId");
  const labelIds = url.searchParams.get("labelIds");
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");

  try {
    const taskWhere: Prisma.TaskWhereInput = {
      creatorId: user.id,
      isArchived: false,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    };

    if (priority) {
      taskWhere.priority = { in: priority.split(",") as Prisma.EnumTaskPriorityFilter["in"] };
    }
    if (status) {
      taskWhere.status = { in: status.split(",") as Prisma.EnumTaskStatusFilter["in"] };
    }
    if (projectId) taskWhere.projectId = projectId;
    if (labelIds) {
      taskWhere.labels = { some: { labelId: { in: labelIds.split(",") } } };
    }
    if (dateFrom || dateTo) {
      taskWhere.dueDate = {};
      if (dateFrom) taskWhere.dueDate.gte = new Date(dateFrom);
      if (dateTo) taskWhere.dueDate.lte = new Date(dateTo);
    }

    const [tasks, projects, labels, comments] = await Promise.all([
      prisma.task.findMany({
        where: taskWhere,
        take: 20,
        orderBy: { updatedAt: "desc" },
        include: {
          labels: { include: { label: true } },
        },
      }),
      prisma.project.findMany({
        where: {
          workspace: { members: { some: { userId: user.id } } },
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.label.findMany({
        where: {
          workspace: { members: { some: { userId: user.id } } },
          name: { contains: query, mode: "insensitive" },
        },
        take: 10,
      }),
      prisma.comment.findMany({
        where: {
          userId: user.id,
          content: { contains: query, mode: "insensitive" },
        },
        take: 10,
        include: {
          task: { select: { id: true, title: true } },
        },
      }),
    ]);

    const results = [
      ...tasks.map((t, i) => ({
        id: t.id,
        type: "task" as const,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        labels: t.labels.map((tl) => ({
          name: tl.label.name,
          color: tl.label.color,
        })),
        matchedField: t.title.toLowerCase().includes(query.toLowerCase())
          ? "title"
          : "description",
        score: 100 - i,
      })),
      ...projects.map((p, i) => ({
        id: p.id,
        type: "project" as const,
        title: p.name,
        description: p.description,
        status: p.status,
        matchedField: p.name.toLowerCase().includes(query.toLowerCase())
          ? "name"
          : "description",
        score: 80 - i,
      })),
      ...labels.map((l, i) => ({
        id: l.id,
        type: "label" as const,
        title: l.name,
        matchedField: "name",
        score: 60 - i,
      })),
      ...comments.map((c, i) => ({
        id: c.id,
        type: "comment" as const,
        title: c.task.title,
        description: c.content.substring(0, 100),
        matchedField: "content",
        score: 40 - i,
      })),
    ].sort((a, b) => b.score - a.score);

    return successResponse({ data: results, total: results.length });
  } catch (err) {
    return errorResponse(
      "Search failed",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
