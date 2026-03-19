import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  errorResponse,
  successResponse,
} from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");

  try {
    const where: Record<string, unknown> = {
      workspace: { members: { some: { userId: user.id } } },
    };
    if (workspaceId) where.workspaceId = workspaceId;

    const labels = await prisma.label.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    return successResponse({ data: labels });
  } catch (err) {
    return errorResponse(
      "Failed to fetch labels",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  try {
    const body = await req.json();
    const { name, color, workspaceId } = body;

    if (!name?.trim()) return errorResponse("Label name is required");
    if (!workspaceId) return errorResponse("Workspace ID is required");

    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: user.id },
    });
    if (!membership) return errorResponse("Not a member of this workspace", 403);

    const existing = await prisma.label.findFirst({
      where: { workspaceId, name: name.trim() },
    });
    if (existing) return errorResponse("Label with this name already exists");

    const label = await prisma.label.create({
      data: {
        name: name.trim(),
        color: color || "#94a3b8",
        workspaceId,
      },
      include: { _count: { select: { tasks: true } } },
    });

    return successResponse(label, 201);
  } catch (err) {
    return errorResponse(
      "Failed to create label",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
