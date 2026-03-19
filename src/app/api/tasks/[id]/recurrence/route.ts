import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  errorResponse,
  successResponse,
} from "@/lib/api-helpers";

interface RecurrencePattern {
  type: "daily" | "weekly" | "monthly" | "custom";
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  cron?: string;
}

function getNextOccurrence(pattern: RecurrencePattern, fromDate: Date): Date {
  const next = new Date(fromDate);
  const interval = pattern.interval || 1;

  switch (pattern.type) {
    case "daily":
      next.setDate(next.getDate() + interval);
      break;
    case "weekly":
      if (pattern.daysOfWeek?.length) {
        const currentDay = next.getDay();
        const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b);
        const nextDay = sortedDays.find((d) => d > currentDay);
        if (nextDay !== undefined) {
          next.setDate(next.getDate() + (nextDay - currentDay));
        } else {
          const daysUntilNext = 7 * interval - currentDay + sortedDays[0];
          next.setDate(next.getDate() + daysUntilNext);
        }
      } else {
        next.setDate(next.getDate() + 7 * interval);
      }
      break;
    case "monthly":
      next.setMonth(next.getMonth() + interval);
      if (pattern.dayOfMonth) {
        const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(Math.min(pattern.dayOfMonth, maxDay));
      }
      break;
    case "custom":
      next.setDate(next.getDate() + interval);
      break;
  }

  return next;
}

export async function POST(
  req: NextRequest,
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

    const body = await req.json();
    const { action } = body;

    if (action === "set") {
      const { pattern } = body as { action: string; pattern: RecurrencePattern };
      if (!pattern?.type) return errorResponse("Recurrence pattern type is required");

      const updated = await prisma.task.update({
        where: { id },
        data: { recurrence: JSON.parse(JSON.stringify(pattern)) },
      });
      return successResponse(updated);
    }

    if (action === "skip") {
      const recurrence = task.recurrence as unknown as RecurrencePattern | null;
      if (!recurrence) return errorResponse("Task has no recurrence pattern");

      const currentDue = task.dueDate || new Date();
      const nextDue = getNextOccurrence(recurrence, currentDue);

      const updated = await prisma.task.update({
        where: { id },
        data: { dueDate: nextDue },
      });
      return successResponse(updated);
    }

    if (action === "reschedule") {
      const { newDate } = body;
      if (!newDate) return errorResponse("newDate is required for rescheduling");

      const updated = await prisma.task.update({
        where: { id },
        data: { dueDate: new Date(newDate) },
      });
      return successResponse(updated);
    }

    if (action === "complete") {
      const recurrence = task.recurrence as unknown as RecurrencePattern | null;
      if (!recurrence) {
        const completed = await prisma.task.update({
          where: { id },
          data: { status: "DONE", completedAt: new Date() },
        });
        return successResponse(completed);
      }

      const currentDue = task.dueDate || new Date();
      const nextDue = getNextOccurrence(recurrence, currentDue);

      const updated = await prisma.task.update({
        where: { id },
        data: {
          status: "TODO",
          dueDate: nextDue,
          completedAt: null,
        },
      });
      return successResponse({ ...updated, nextOccurrence: nextDue.toISOString() });
    }

    if (action === "remove") {
      const updated = await prisma.task.update({
        where: { id },
        data: { recurrence: Prisma.JsonNull },
      });
      return successResponse(updated);
    }

    return errorResponse("Invalid action. Use: set, skip, reschedule, complete, remove");
  } catch (err) {
    return errorResponse(
      "Failed to manage recurrence",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
