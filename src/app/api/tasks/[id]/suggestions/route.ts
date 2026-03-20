import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, errorResponse } from "@/lib/api-helpers";
import { suggestSubtasks, suggestPriority } from "@/lib/smart-suggestions";

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
      select: { title: true, description: true, dueDate: true, priority: true },
    });

    if (!task) return errorResponse("Task not found", 404);

    const subtasks = suggestSubtasks({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
    });

    const suggestedPriority = suggestPriority({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
    });

    return NextResponse.json({
      subtasks,
      suggestedPriority,
    });
  } catch {
    return errorResponse("Failed to generate suggestions", 500);
  }
}
