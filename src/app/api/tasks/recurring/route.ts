import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse, jsonResponse } from "@/lib/api-utils";

interface RecurrencePattern {
  type: "daily" | "weekly" | "monthly" | "custom";
  interval?: number; // every N days/weeks/months
  daysOfWeek?: number[]; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  endDate?: string;
  maxOccurrences?: number;
}

function getNextOccurrence(
  currentDate: Date,
  pattern: RecurrencePattern
): Date | null {
  const next = new Date(currentDate);
  const interval = pattern.interval || 1;

  switch (pattern.type) {
    case "daily":
      next.setDate(next.getDate() + interval);
      break;

    case "weekly":
      if (pattern.daysOfWeek?.length) {
        const currentDay = next.getDay();
        const sorted = [...pattern.daysOfWeek].sort((a, b) => a - b);
        const nextDay = sorted.find((d) => d > currentDay);
        if (nextDay !== undefined) {
          next.setDate(next.getDate() + (nextDay - currentDay));
        } else {
          // Next week
          const daysUntilNext = 7 - currentDay + sorted[0];
          next.setDate(
            next.getDate() + daysUntilNext + (interval - 1) * 7
          );
        }
      } else {
        next.setDate(next.getDate() + 7 * interval);
      }
      break;

    case "monthly":
      next.setMonth(next.getMonth() + interval);
      if (pattern.dayOfMonth) {
        const lastDay = new Date(
          next.getFullYear(),
          next.getMonth() + 1,
          0
        ).getDate();
        next.setDate(Math.min(pattern.dayOfMonth, lastDay));
      }
      break;

    case "custom":
      next.setDate(next.getDate() + (interval || 1));
      break;
  }

  if (pattern.endDate && next > new Date(pattern.endDate)) {
    return null;
  }

  return next;
}

// POST: Create next occurrence of a recurring task
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  try {
    const { taskId, action } = await req.json();
    if (!taskId) return errorResponse("taskId is required");

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { labels: true },
    });

    if (!task) return errorResponse("Task not found", 404);
    if (!task.recurrence) return errorResponse("Task has no recurrence pattern");

    const pattern = task.recurrence as unknown as RecurrencePattern;

    if (action === "skip") {
      // Skip: calculate next occurrence after the next one
      const skipped = getNextOccurrence(
        task.dueDate || new Date(),
        pattern
      );
      const nextAfterSkip = skipped
        ? getNextOccurrence(skipped, pattern)
        : null;

      if (nextAfterSkip) {
        const updated = await prisma.task.update({
          where: { id: taskId },
          data: {
            dueDate: nextAfterSkip,
            status: "TODO",
            completedAt: null,
          },
        });
        return jsonResponse(updated);
      }

      return jsonResponse({ message: "No more occurrences", task });
    }

    if (action === "complete") {
      // Complete current and create next occurrence
      await prisma.task.update({
        where: { id: taskId },
        data: { status: "DONE", completedAt: new Date() },
      });

      const nextDate = getNextOccurrence(
        task.dueDate || new Date(),
        pattern
      );

      if (nextDate) {
        const newTask = await prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            priority: task.priority,
            projectId: task.projectId,
            sectionId: task.sectionId,
            assigneeId: task.assigneeId,
            creatorId: task.creatorId,
            recurrence: task.recurrence as object,
            dueDate: nextDate,
            labels: {
              create: task.labels.map((tl) => ({ labelId: tl.labelId })),
            },
          },
          include: {
            labels: { include: { label: true } },
          },
        });

        return jsonResponse({
          completed: taskId,
          nextOccurrence: newTask,
        });
      }

      return jsonResponse({
        completed: taskId,
        message: "Recurrence ended - no more occurrences",
      });
    }

    if (action === "reschedule") {
      const { newDate } = await req.json().catch(() => ({ newDate: null }));
      if (!newDate) return errorResponse("newDate is required for reschedule");

      const updated = await prisma.task.update({
        where: { id: taskId },
        data: { dueDate: new Date(newDate) },
      });
      return jsonResponse(updated);
    }

    return errorResponse(
      "Invalid action. Use: complete, skip, or reschedule"
    );
  } catch (error) {
    console.error("Recurring task error:", error);
    return errorResponse("Failed to process recurring task", 500);
  }
}
