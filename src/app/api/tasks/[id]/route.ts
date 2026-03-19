import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession, errorResponse } from "@/lib/api-helpers";
import { isValidRecurrence, getNextOccurrence, RecurrencePattern } from "@/lib/recurrence";
import { Prisma, TaskPriority, TaskStatus } from "@prisma/client";

const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  projectId: z.string().nullable().optional(),
  sectionId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  position: z.number().optional(),
  recurrence: z.any().nullable().optional(),
  isArchived: z.boolean().optional(),
  labelIds: z.array(z.string()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        labels: { include: { label: true } },
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            assigneeId: true,
          },
          orderBy: { position: "asc" },
        },
        comments: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true, image: true } },
      },
    });

    if (!task) return errorResponse("Task not found", 404);

    return NextResponse.json(task);
  } catch {
    return errorResponse("Failed to fetch task", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateTaskSchema.parse(body);

    if (data.recurrence !== undefined && data.recurrence !== null && !isValidRecurrence(data.recurrence)) {
      return errorResponse("Invalid recurrence pattern", 400);
    }

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return errorResponse("Task not found", 404);

    // Handle label updates
    if (data.labelIds) {
      await prisma.taskLabel.deleteMany({ where: { taskId: id } });
      await prisma.taskLabel.createMany({
        data: data.labelIds.map((labelId) => ({ taskId: id, labelId })),
      });
    }

    const { labelIds, ...updateFields } = data;

    // Build update data
    const updateData: Prisma.TaskUpdateInput = {};
    if (updateFields.title !== undefined) updateData.title = updateFields.title;
    if (updateFields.description !== undefined)
      updateData.description = updateFields.description;
    if (updateFields.status !== undefined)
      updateData.status = updateFields.status;
    if (updateFields.priority !== undefined)
      updateData.priority = updateFields.priority;
    if (updateFields.position !== undefined)
      updateData.position = updateFields.position;
    if (updateFields.isArchived !== undefined)
      updateData.isArchived = updateFields.isArchived;

    if (updateFields.dueDate !== undefined) {
      updateData.dueDate = updateFields.dueDate
        ? new Date(updateFields.dueDate)
        : null;
    }
    if (updateFields.startDate !== undefined) {
      updateData.startDate = updateFields.startDate
        ? new Date(updateFields.startDate)
        : null;
    }

    if (updateFields.recurrence !== undefined) {
      updateData.recurrence =
        updateFields.recurrence as Prisma.InputJsonValue | null ?? Prisma.JsonNull;
    }

    if (updateFields.projectId !== undefined) {
      updateData.project = updateFields.projectId
        ? { connect: { id: updateFields.projectId } }
        : { disconnect: true };
    }
    if (updateFields.sectionId !== undefined) {
      updateData.section = updateFields.sectionId
        ? { connect: { id: updateFields.sectionId } }
        : { disconnect: true };
    }
    if (updateFields.assigneeId !== undefined) {
      updateData.assignee = updateFields.assigneeId
        ? { connect: { id: updateFields.assigneeId } }
        : { disconnect: true };
    }
    if (updateFields.parentId !== undefined) {
      updateData.parent = updateFields.parentId
        ? { connect: { id: updateFields.parentId } }
        : { disconnect: true };
    }

    // Handle completion
    if (
      updateFields.status === "DONE" &&
      existingTask.status !== "DONE"
    ) {
      updateData.completedAt = new Date();

      // Handle recurring task - create next occurrence
      if (existingTask.recurrence) {
        const pattern = existingTask.recurrence as unknown as RecurrencePattern;
        const baseDate = existingTask.dueDate || new Date();
        const nextDate = getNextOccurrence(pattern, baseDate);

        if (nextDate) {
          await prisma.task.create({
            data: {
              title: existingTask.title,
              description: existingTask.description,
              priority: existingTask.priority,
              status: "TODO",
              projectId: existingTask.projectId,
              sectionId: existingTask.sectionId,
              assigneeId: existingTask.assigneeId,
              creatorId: existingTask.creatorId,
              dueDate: nextDate,
              recurrence: existingTask.recurrence as Prisma.InputJsonValue,
            },
          });
        }
      }

      // Create notification for task creator
      if (existingTask.creatorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: existingTask.creatorId,
            type: "TASK_COMPLETED",
            title: "Task Completed",
            message: `"${existingTask.title}" has been marked as done`,
            taskId: id,
          },
        });
      }
    }

    // Track status change
    if (updateFields.status && updateFields.status !== existingTask.status) {
      await prisma.activity.create({
        data: {
          type: "STATUS_CHANGED",
          userId: session.user.id,
          taskId: id,
          projectId: existingTask.projectId,
          meta: { from: existingTask.status, to: updateFields.status },
        },
      });
    }

    // Track assignment change
    if (
      updateFields.assigneeId !== undefined &&
      updateFields.assigneeId !== existingTask.assigneeId
    ) {
      if (updateFields.assigneeId) {
        await prisma.notification.create({
          data: {
            userId: updateFields.assigneeId,
            type: "TASK_ASSIGNED",
            title: "Task Assigned",
            message: `You have been assigned to "${existingTask.title}"`,
            taskId: id,
          },
        });
      }
    }

    void labelIds; // consumed above

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        labels: { include: { label: true } },
        subtasks: {
          select: { id: true, title: true, status: true, priority: true },
        },
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    return errorResponse("Failed to update task", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return errorResponse("Task not found", 404);

    await prisma.task.delete({ where: { id } });

    await prisma.activity.create({
      data: {
        type: "TASK_DELETED",
        userId: session.user.id,
        projectId: task.projectId,
        meta: { title: task.title },
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return errorResponse("Failed to delete task", 500);
  }
}
