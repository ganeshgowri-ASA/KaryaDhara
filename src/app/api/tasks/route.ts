import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionUser,
  unauthorized,
  badRequest,
  getOrCreateWorkspace,
} from "@/lib/api-helpers";
import { Prisma } from "@prisma/client";

const taskInclude = {
  subtasks: {
    include: {
      labels: { include: { label: true } },
      _count: { select: { subtasks: true, comments: true } },
    },
    orderBy: { position: "asc" as const },
  },
  labels: { include: { label: true } },
  comments: {
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" as const },
    take: 5,
  },
  project: { select: { id: true, name: true, color: true } },
  assignee: { select: { id: true, name: true, image: true } },
  creator: { select: { id: true, name: true, image: true } },
  section: { select: { id: true, name: true, color: true } },
  blockedBy: {
    include: {
      blocking: { select: { id: true, title: true } },
      blocked: { select: { id: true, title: true } },
    },
  },
  blocks: {
    include: {
      blocking: { select: { id: true, title: true } },
      blocked: { select: { id: true, title: true } },
    },
  },
  _count: { select: { subtasks: true, comments: true } },
};

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = req.nextUrl;
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");
  const labelId = searchParams.get("labelId");
  const parentId = searchParams.get("parentId");

  const where: Prisma.TaskWhereInput = {
    creatorId: user.id,
    isArchived: false,
    parentId: parentId || null,
  };

  if (projectId) where.projectId = projectId;
  if (status) {
    const statuses = status.split(",");
    where.status = { in: statuses as Prisma.EnumTaskStatusFilter["in"] };
  }
  if (priority) {
    const priorities = priority.split(",");
    where.priority = {
      in: priorities as Prisma.EnumTaskPriorityFilter["in"],
    };
  }
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (labelId) {
    where.labels = { some: { labelId } };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: { position: "asc" },
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

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
    labels,
    recurrence,
  } = body;

  if (!title?.trim()) return badRequest("Title is required");

  // Ensure workspace exists for label creation
  await getOrCreateWorkspace(user.id);

  const maxPosition = await prisma.task.aggregate({
    where: { creatorId: user.id, parentId: parentId || null, projectId: projectId || null },
    _max: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description || null,
      status: status || "TODO",
      priority: priority || "P3",
      position: (maxPosition._max.position ?? 0) + 1,
      dueDate: dueDate ? new Date(dueDate) : null,
      startDate: startDate ? new Date(startDate) : null,
      projectId: projectId || null,
      sectionId: sectionId || null,
      assigneeId: assigneeId || null,
      parentId: parentId || null,
      creatorId: user.id,
      recurrence: recurrence || null,
      labels: labels?.length
        ? {
            create: labels.map((labelId: string) => ({ labelId })),
          }
        : undefined,
    },
    include: taskInclude,
  });

  return NextResponse.json({ task }, { status: 201 });
}
