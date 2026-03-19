import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  errorResponse,
  successResponse,
} from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    const task = await prisma.task.findFirst({
      where: { id, creatorId: user.id },
      include: {
        labels: { include: { label: true } },
        subtasks: {
          include: {
            labels: { include: { label: true } },
            _count: { select: { subtasks: true, comments: true } },
          },
        },
        comments: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { subtasks: true, comments: true } },
      },
    });

    if (!task) return errorResponse("Task not found", 404);

    const result = {
      ...task,
      labels: task.labels.map((tl) => tl.label),
      subtasks: task.subtasks.map((st) => ({
        ...st,
        labels: st.labels.map((tl) => tl.label),
      })),
    };

    return successResponse(result);
  } catch (err) {
    return errorResponse(
      "Failed to fetch task",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    const existing = await prisma.task.findFirst({
      where: { id, creatorId: user.id },
    });
    if (!existing) return errorResponse("Task not found", 404);

    const body = await req.json();
    const { title, description, status, priority, dueDate, startDate, projectId, sectionId, parentId, recurrence, labelIds, isArchived } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = status;
      if (status === "DONE" && existing.status !== "DONE") {
        updateData.completedAt = new Date();
      }
      if (status !== "DONE" && existing.status === "DONE") {
        updateData.completedAt = null;
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (projectId !== undefined) updateData.projectId = projectId || null;
    if (sectionId !== undefined) updateData.sectionId = sectionId || null;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (recurrence !== undefined) updateData.recurrence = recurrence;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        labels: { include: { label: true } },
        _count: { select: { subtasks: true, comments: true } },
      },
    });

    if (labelIds !== undefined) {
      await prisma.taskLabel.deleteMany({ where: { taskId: id } });
      if (labelIds.length) {
        await prisma.taskLabel.createMany({
          data: labelIds.map((labelId: string) => ({
            taskId: id,
            labelId,
          })),
          skipDuplicates: true,
        });
      }
    }

    const result = {
      ...task,
      labels: task.labels.map((tl) => tl.label),
    };

    return successResponse(result);
  } catch (err) {
    return errorResponse(
      "Failed to update task",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    const task = await prisma.task.findFirst({
      where: { id, creatorId: user.id },
    });
    if (!task) return errorResponse("Task not found", 404);

    await prisma.task.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (err) {
    return errorResponse(
      "Failed to delete task",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
