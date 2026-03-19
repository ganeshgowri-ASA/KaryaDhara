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
    const label = await prisma.label.findFirst({
      where: {
        id,
        workspace: { members: { some: { userId: user.id } } },
      },
      include: {
        tasks: {
          include: {
            task: {
              select: { id: true, title: true, status: true, priority: true },
            },
          },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!label) return errorResponse("Label not found", 404);
    return successResponse(label);
  } catch (err) {
    return errorResponse(
      "Failed to fetch label",
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
    const label = await prisma.label.findFirst({
      where: {
        id,
        workspace: { members: { some: { userId: user.id } } },
      },
    });
    if (!label) return errorResponse("Label not found", 404);

    const body = await req.json();
    const { name, color } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (color !== undefined) updateData.color = color;

    const updated = await prisma.label.update({
      where: { id },
      data: updateData,
      include: { _count: { select: { tasks: true } } },
    });

    return successResponse(updated);
  } catch (err) {
    return errorResponse(
      "Failed to update label",
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
    const label = await prisma.label.findFirst({
      where: {
        id,
        workspace: { members: { some: { userId: user.id } } },
      },
    });
    if (!label) return errorResponse("Label not found", 404);

    await prisma.label.delete({ where: { id } });
    return successResponse({ success: true });
  } catch (err) {
    return errorResponse(
      "Failed to delete label",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
