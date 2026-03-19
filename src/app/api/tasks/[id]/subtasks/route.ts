import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse, jsonResponse } from "@/lib/api-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const parent = await prisma.task.findUnique({
    where: { id: params.id },
  });
  if (!parent) return errorResponse("Parent task not found", 404);

  try {
    const body = await req.json();
    const { title, description, priority, dueDate, assigneeId } = body;

    if (!title?.trim()) return errorResponse("Title is required");

    const subtask = await prisma.task.create({
      data: {
        title: title.trim(),
        description,
        priority: priority || parent.priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId,
        creatorId: session.user.id,
        parentId: params.id,
        projectId: parent.projectId,
        sectionId: parent.sectionId,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
      },
    });

    return jsonResponse(subtask, 201);
  } catch (error) {
    console.error("Create subtask error:", error);
    return errorResponse("Failed to create subtask", 500);
  }
}
