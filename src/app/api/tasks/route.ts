import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getAuthSession,
  parsePagination,
  paginatedResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { suggestPriority, suggestSubtasks } from "@/lib/smart-suggestions";
import { isValidRecurrence } from "@/lib/recurrence";
import { Prisma, TaskPriority, TaskStatus } from "@prisma/client";

const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  projectId: z.string().optional(),
  sectionId: z.string().optional(),
  assigneeId: z.string().optional(),
  parentId: z.string().optional(),
  recurrence: z.any().optional(),
  labelIds: z.array(z.string()).optional(),
  autoSuggestSubtasks: z.boolean().optional(),
  autoSuggestPriority: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const url = new URL(request.url);
  const pagination = parsePagination(url);

  const where: Prisma.TaskWhereInput = {
    creatorId: session.user.id,
    isArchived: false,
  };

  const status = url.searchParams.get("status");
  if (status) where.status = status as TaskStatus;

  const priority = url.searchParams.get("priority");
  if (priority) where.priority = priority as TaskPriority;

  const projectId = url.searchParams.get("projectId");
  if (projectId) where.projectId = projectId;

  const assigneeId = url.searchParams.get("assigneeId");
  if (assigneeId) where.assigneeId = assigneeId;

  const labelId = url.searchParams.get("labelId");
  if (labelId) {
    where.labels = { some: { labelId } };
  }

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

  const parentId = url.searchParams.get("parentId");
  if (parentId === "null") {
    where.parentId = null;
  } else if (parentId) {
    where.parentId = parentId;
  }

  try {
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          labels: { include: { label: true } },
          subtasks: {
            select: { id: true, title: true, status: true, priority: true },
            take: 10,
          },
          project: { select: { id: true, name: true, color: true } },
          assignee: { select: { id: true, name: true, image: true } },
        },
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.task.count({ where }),
    ]);

    return paginatedResponse(tasks, total, pagination);
  } catch {
    return errorResponse("Failed to fetch tasks", 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  try {
    const body = await request.json();
    const data = createTaskSchema.parse(body);

    // Validate recurrence if provided
    if (data.recurrence && !isValidRecurrence(data.recurrence)) {
      return errorResponse("Invalid recurrence pattern", 400);
    }

    // Smart priority suggestion
    let priority = data.priority;
    if (!priority && data.autoSuggestPriority) {
      priority = suggestPriority({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || "TODO",
        priority: priority || "P3",
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        projectId: data.projectId,
        sectionId: data.sectionId,
        assigneeId: data.assigneeId,
        creatorId: session.user.id,
        parentId: data.parentId,
        recurrence: data.recurrence
          ? (data.recurrence as Prisma.InputJsonValue)
          : undefined,
        labels: data.labelIds
          ? {
              create: data.labelIds.map((labelId) => ({ labelId })),
            }
          : undefined,
      },
      include: {
        labels: { include: { label: true } },
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, image: true } },
      },
    });

    // Auto-generate subtasks if requested
    let subtaskSuggestions: { title: string; priority: string }[] = [];
    if (data.autoSuggestSubtasks) {
      subtaskSuggestions = suggestSubtasks({
        title: data.title,
        description: data.description,
      });

      await prisma.task.createMany({
        data: subtaskSuggestions.map((s, i) => ({
          title: s.title,
          priority: s.priority as TaskPriority,
          status: "TODO" as TaskStatus,
          creatorId: session.user.id,
          parentId: task.id,
          projectId: data.projectId,
          position: i,
        })),
      });
    }

    // Create activity
    await prisma.activity.create({
      data: {
        type: "TASK_CREATED",
        userId: session.user.id,
        taskId: task.id,
        projectId: data.projectId,
        meta: { title: data.title },
      },
    });

    // Fetch with subtasks included
    const fullTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        labels: { include: { label: true } },
        subtasks: {
          select: { id: true, title: true, status: true, priority: true },
        },
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(fullTask, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    return errorResponse("Failed to create task", 500);
  }
}
