import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse, jsonResponse } from "@/lib/api-utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      labels: { include: { label: true } },
      subtasks: {
        include: {
          labels: { include: { label: true } },
          assignee: { select: { id: true, name: true, image: true } },
        },
        orderBy: { position: "asc" },
      },
      comments: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true, image: true } },
      project: { select: { id: true, name: true, color: true } },
      section: { select: { id: true, name: true } },
      _count: { select: { comments: true, subtasks: true } },
    },
  });

  if (!task) return errorResponse("Task not found", 404);
  return jsonResponse(task);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const existing = await prisma.task.findUnique({
    where: { id: params.id },
  });
  if (!existing) return errorResponse("Task not found", 404);

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
      position,
      recurrence,
      isArchived,
    } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description;
    if (status !== undefined) {
      data.status = status;
      if (status === "DONE") data.completedAt = new Date();
      if (status !== "DONE" && existing.completedAt) data.completedAt = null;
    }
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined)
      data.dueDate = dueDate ? new Date(dueDate) : null;
    if (startDate !== undefined)
      data.startDate = startDate ? new Date(startDate) : null;
    if (projectId !== undefined) data.projectId = projectId;
    if (sectionId !== undefined) data.sectionId = sectionId;
    if (assigneeId !== undefined) data.assigneeId = assigneeId;
    if (position !== undefined) data.position = position;
    if (recurrence !== undefined) data.recurrence = recurrence;
    if (isArchived !== undefined) data.isArchived = isArchived;

    const task = await prisma.task.update({
      where: { id: params.id },
      data,
      include: {
        labels: { include: { label: true } },
        subtasks: { select: { id: true, title: true, status: true } },
        assignee: { select: { id: true, name: true, image: true } },
        project: { select: { id: true, name: true, color: true } },
      },
    });

    return jsonResponse(task);
  } catch (error) {
    console.error("Update task error:", error);
    return errorResponse("Failed to update task", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const existing = await prisma.task.findUnique({
    where: { id: params.id },
  });
  if (!existing) return errorResponse("Task not found", 404);

  await prisma.task.delete({ where: { id: params.id } });
  return jsonResponse({ success: true });
}
