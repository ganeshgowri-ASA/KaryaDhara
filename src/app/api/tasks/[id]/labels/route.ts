import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse, jsonResponse } from "@/lib/api-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task) return errorResponse("Task not found", 404);

  try {
    const { labelId } = await req.json();
    if (!labelId) return errorResponse("labelId is required");

    await prisma.taskLabel.create({
      data: { taskId: params.id, labelId },
    });

    const updated = await prisma.task.findUnique({
      where: { id: params.id },
      include: { labels: { include: { label: true } } },
    });

    return jsonResponse(updated, 201);
  } catch {
    return errorResponse("Label already attached or not found", 409);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const labelId = searchParams.get("labelId");
  if (!labelId) return errorResponse("labelId query param is required");

  await prisma.taskLabel.delete({
    where: { taskId_labelId: { taskId: params.id, labelId } },
  });

  return jsonResponse({ success: true });
}
