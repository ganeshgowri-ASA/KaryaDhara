import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  errorResponse,
  jsonResponse,
  parsePagination,
  paginatedResponse,
} from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const { page, limit, skip } = parsePagination(searchParams);

  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const projectId = searchParams.get("projectId");
  const assigneeId = searchParams.get("assigneeId");
  const labelId = searchParams.get("labelId");
  const dueBefore = searchParams.get("dueBefore");
  const dueAfter = searchParams.get("dueAfter");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  const parentId = searchParams.get("parentId");

  const where: Record<string, unknown> = {
    creatorId: session.user.id,
    parentId: parentId || null,
  };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (projectId) where.projectId = projectId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (labelId) {
    where.labels = { some: { labelId } };
  }
  if (dueBefore || dueAfter) {
    where.dueDate = {};
    if (dueBefore)
      (where.dueDate as Record<string, unknown>).lte = new Date(dueBefore);
    if (dueAfter)
      (where.dueDate as Record<string, unknown>).gte = new Date(dueAfter);
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        labels: { include: { label: true } },
        subtasks: { select: { id: true, title: true, status: true } },
        assignee: { select: { id: true, name: true, image: true } },
        project: { select: { id: true, name: true, color: true } },
        _count: { select: { comments: true, subtasks: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return paginatedResponse(tasks, total, page, limit);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  try {
    const body = await req.json();
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      startDate,
      projectId,
      sectionId,
      assigneeId,
      parentId,
      recurrence,
      labelIds,
    } = body;

    if (!title?.trim()) {
      return errorResponse("Title is required");
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description,
        status: status || "TODO",
        priority: priority || "P3",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        projectId,
        sectionId,
        assigneeId,
        creatorId: session.user.id,
        parentId,
        recurrence: recurrence || undefined,
        labels: labelIds?.length
          ? {
              create: labelIds.map((labelId: string) => ({ labelId })),
            }
          : undefined,
      },
      include: {
        labels: { include: { label: true } },
        subtasks: { select: { id: true, title: true, status: true } },
        assignee: { select: { id: true, name: true, image: true } },
        project: { select: { id: true, name: true, color: true } },
      },
    });

    return jsonResponse(task, 201);
  } catch (error) {
    console.error("Create task error:", error);
    return errorResponse("Failed to create task", 500);
  }
}
