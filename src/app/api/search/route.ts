import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  errorResponse,
  jsonResponse,
  parsePagination,
} from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q");
  const { limit } = parsePagination(searchParams);

  if (!query?.trim()) return errorResponse("Search query 'q' is required");

  const searchTerm = query.trim();

  // Filters
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const projectId = searchParams.get("projectId");
  const labelId = searchParams.get("labelId");
  const dueBefore = searchParams.get("dueBefore");
  const dueAfter = searchParams.get("dueAfter");
  const assigneeId = searchParams.get("assigneeId");

  const taskWhere: Record<string, unknown> = {
    creatorId: session.user.id,
    OR: [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ],
  };

  if (status) taskWhere.status = status;
  if (priority) taskWhere.priority = priority;
  if (projectId) taskWhere.projectId = projectId;
  if (assigneeId) taskWhere.assigneeId = assigneeId;
  if (labelId) taskWhere.labels = { some: { labelId } };
  if (dueBefore || dueAfter) {
    taskWhere.dueDate = {};
    if (dueBefore)
      (taskWhere.dueDate as Record<string, unknown>).lte = new Date(dueBefore);
    if (dueAfter)
      (taskWhere.dueDate as Record<string, unknown>).gte = new Date(dueAfter);
  }

  const [tasks, projects, labels] = await Promise.all([
    prisma.task.findMany({
      where: taskWhere,
      include: {
        labels: { include: { label: true } },
        assignee: { select: { id: true, name: true, image: true } },
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: { _count: { select: { tasks: true } } },
      take: 5,
    }),
    prisma.label.findMany({
      where: {
        name: { contains: searchTerm, mode: "insensitive" },
      },
      include: { _count: { select: { tasks: true } } },
      take: 10,
    }),
  ]);

  return jsonResponse({
    tasks,
    projects,
    labels,
    counts: {
      tasks: tasks.length,
      projects: projects.length,
      labels: labels.length,
    },
  });
}
