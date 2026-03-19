import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse, jsonResponse } from "@/lib/api-utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      sections: {
        include: {
          tasks: {
            include: {
              labels: { include: { label: true } },
              assignee: { select: { id: true, name: true, image: true } },
              _count: { select: { subtasks: true, comments: true } },
            },
            orderBy: { position: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
      _count: { select: { tasks: true } },
    },
  });

  if (!project) return errorResponse("Project not found", 404);
  return jsonResponse(project);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const existing = await prisma.project.findUnique({
    where: { id: params.id },
  });
  if (!existing) return errorResponse("Project not found", 404);

  try {
    const body = await req.json();
    const { name, description, color, icon, status, startDate, endDate } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description;
    if (color !== undefined) data.color = color;
    if (icon !== undefined) data.icon = icon;
    if (status !== undefined) data.status = status;
    if (startDate !== undefined)
      data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      data.endDate = endDate ? new Date(endDate) : null;

    const project = await prisma.project.update({
      where: { id: params.id },
      data,
      include: { _count: { select: { tasks: true, sections: true } } },
    });

    return jsonResponse(project);
  } catch (error) {
    console.error("Update project error:", error);
    return errorResponse("Failed to update project", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const existing = await prisma.project.findUnique({
    where: { id: params.id },
  });
  if (!existing) return errorResponse("Project not found", 404);

  await prisma.project.delete({ where: { id: params.id } });
  return jsonResponse({ success: true });
}
