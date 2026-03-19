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
    const project = await prisma.project.findFirst({
      where: {
        id,
        workspace: { members: { some: { userId: user.id } } },
      },
      include: {
        sections: { orderBy: { position: "asc" } },
        _count: { select: { tasks: true, sections: true } },
      },
    });

    if (!project) return errorResponse("Project not found", 404);
    return successResponse(project);
  } catch (err) {
    return errorResponse(
      "Failed to fetch project",
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
    const project = await prisma.project.findFirst({
      where: {
        id,
        workspace: { members: { some: { userId: user.id } } },
      },
    });
    if (!project) return errorResponse("Project not found", 404);

    const body = await req.json();
    const { name, description, color, status, startDate, endDate } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined)
      updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null;

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { tasks: true, sections: true } },
      },
    });

    return successResponse(updated);
  } catch (err) {
    return errorResponse(
      "Failed to update project",
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
    const project = await prisma.project.findFirst({
      where: {
        id,
        workspace: { members: { some: { userId: user.id } } },
      },
    });
    if (!project) return errorResponse("Project not found", 404);

    await prisma.project.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (err) {
    return errorResponse(
      "Failed to delete project",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
