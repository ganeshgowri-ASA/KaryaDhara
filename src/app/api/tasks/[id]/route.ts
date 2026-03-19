import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, notFound } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const task = await prisma.task.findFirst({
    where: { id: params.id, creatorId: user.id },
    include: {
      subtasks: {
        include: {
          labels: { include: { label: true } },
          _count: { select: { subtasks: true, comments: true } },
        },
        orderBy: { position: "asc" },
      },
      labels: { include: { label: true } },
      comments: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      project: { select: { id: true, name: true, color: true } },
      section: { select: { id: true, name: true, color: true } },
      assignee: { select: { id: true, name: true, image: true } },
      blockedBy: {
        include: { blocking: { select: { id: true, title: true } } },
      },
      blocks: {
        include: { blocked: { select: { id: true, title: true } } },
      },
      _count: { select: { subtasks: true, comments: true } },
    },
  });

  if (!task) return notFound("Task not found");
  return NextResponse.json(task);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const existing = await prisma.task.findFirst({
    where: { id: params.id, creatorId: user.id },
  });
  if (!existing) return notFound("Task not found");

  const body = await req.json();
  const {
    title,
    description,
    status,
    priority,
    dueDate,
    startDate,
    position,
    projectId,
    sectionId,
    parentId,
    assigneeId,
    recurrence,
    labels,
    isArchived,
  } = body;

  // Build update data
  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (status !== undefined) {
    data.status = status;
    if (status === "DONE") data.completedAt = new Date();
    else data.completedAt = null;
  }
  if (priority !== undefined) data.priority = priority;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
  if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
  if (position !== undefined) data.position = position;
  if (projectId !== undefined) data.projectId = projectId || null;
  if (sectionId !== undefined) data.sectionId = sectionId || null;
  if (parentId !== undefined) data.parentId = parentId || null;
  if (assigneeId !== undefined) data.assigneeId = assigneeId || null;
  if (recurrence !== undefined) data.recurrence = recurrence;
  if (isArchived !== undefined) data.isArchived = isArchived;

  // Handle labels update
  if (labels !== undefined) {
    await prisma.taskLabel.deleteMany({ where: { taskId: params.id } });
    if (labels.length > 0) {
      await prisma.taskLabel.createMany({
        data: labels.map((labelId: string) => ({
          taskId: params.id,
          labelId,
        })),
      });
    }
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data,
    include: {
      subtasks: {
        include: {
          labels: { include: { label: true } },
          _count: { select: { subtasks: true, comments: true } },
        },
        orderBy: { position: "asc" },
      },
      labels: { include: { label: true } },
      project: { select: { id: true, name: true, color: true } },
      section: { select: { id: true, name: true, color: true } },
      assignee: { select: { id: true, name: true, image: true } },
      _count: { select: { subtasks: true, comments: true } },
    },
  });

  // Log activity
  try {
    const workspace = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
    });
    if (workspace) {
      await prisma.activity.create({
        data: {
          type: status === "DONE" ? "TASK_COMPLETED" : "TASK_UPDATED",
          userId: user.id,
          workspaceId: workspace.workspaceId,
          taskId: params.id,
          meta: { changes: Object.keys(data) },
        },
      });
    }
  } catch {
    /* activity logging is best-effort */
  }

  return NextResponse.json(task);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const existing = await prisma.task.findFirst({
    where: { id: params.id, creatorId: user.id },
  });
  if (!existing) return notFound("Task not found");

  await prisma.task.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
