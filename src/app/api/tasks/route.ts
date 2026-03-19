import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  errorResponse,
  successResponse,
  parsePagination,
  paginatedResponse,
} from "@/lib/api-helpers";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { page, limit, skip } = parsePagination(req);
  const url = req.nextUrl;

  const where: Prisma.TaskWhereInput = {
    creatorId: user.id,
    isArchived: false,
  };

  const statusParam = url.searchParams.get("status");
  if (statusParam) {
    where.status = { in: statusParam.split(",") as Prisma.EnumTaskStatusFilter["in"] };
  }

  const priorityParam = url.searchParams.get("priority");
  if (priorityParam) {
    where.priority = { in: priorityParam.split(",") as Prisma.EnumTaskPriorityFilter["in"] };
  }

  const projectId = url.searchParams.get("projectId");
  if (projectId) where.projectId = projectId;

  const assigneeId = url.searchParams.get("assigneeId");
  if (assigneeId) where.assigneeId = assigneeId;

  const search = url.searchParams.get("search");
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const dueDateFrom = url.searchParams.get("dueDateFrom");
  const dueDateTo = url.searchParams.get("dueDateTo");
  if (dueDateFrom || dueDateTo) {
    where.dueDate = {};
    if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
    if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
  }

  const labelIds = url.searchParams.get("labelIds");
  if (labelIds) {
    where.labels = {
      some: { labelId: { in: labelIds.split(",") } },
    };
  }

  const parentOnly = url.searchParams.get("parentOnly");
  if (parentOnly === "true") {
    where.parentId = null;
  }

  try {
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        include: {
          labels: { include: { label: true } },
          subtasks: {
            select: { id: true, title: true, status: true, priority: true },
          },
          _count: { select: { subtasks: true, comments: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    const mapped = tasks.map((t) => ({
      ...t,
      labels: t.labels.map((tl) => tl.label),
    }));

    return paginatedResponse(mapped, total, page, limit);
  } catch (err) {
    return errorResponse(
      "Failed to fetch tasks",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  try {
    const body = await req.json();
    const { title, description, status, priority, dueDate, startDate, projectId, sectionId, parentId, recurrence, labelIds } = body;

    if (!title?.trim()) {
      return errorResponse("Title is required");
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description || null,
        status: status || "TODO",
        priority: priority || "P3",
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        projectId: projectId || null,
        sectionId: sectionId || null,
        parentId: parentId || null,
        recurrence: recurrence || undefined,
        creatorId: user.id,
        assigneeId: user.id,
      },
      include: {
        labels: { include: { label: true } },
        _count: { select: { subtasks: true, comments: true } },
      },
    });

    if (labelIds?.length) {
      await prisma.taskLabel.createMany({
        data: labelIds.map((labelId: string) => ({
          taskId: task.id,
          labelId,
        })),
        skipDuplicates: true,
      });
    }

    const result = {
      ...task,
      labels: task.labels.map((tl) => tl.label),
    };

    return successResponse(result, 201);
  } catch (err) {
    return errorResponse(
      "Failed to create task",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
